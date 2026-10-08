import asyncio
import logging
import time
from .k8s_client import k8s_client
from .events import event_log

logger = logging.getLogger(__name__)

class Healer:
    def __init__(self):
        # strategies: 'reactive', 'threshold', 'predictive'
        self.strategy = 'predictive'
        # pod_name -> state (HEALTHY, SUSPECT, HEALING, COOLDOWN)
        self.pod_states = {}
        self.cooldown_until = {}
        self.threshold_pct = 60.0
        self.prediction_horizon_s = 60.0

    def set_strategy(self, strategy: str):
        self.strategy = strategy
        event_log.add_event(f"Strategy changed to {strategy.capitalize()}", level="INFO")

    async def evaluate_pod(self, pod_name: str, metrics: dict, prediction: dict, anomaly_score: float):
        if self.strategy == 'reactive':
            return # Let Kubernetes handle OOMKills
            
        current_time = time.time()
        if self.cooldown_until.get(pod_name, 0) > current_time:
            return # In cooldown
            
        action_needed = False
        reason = ""

        if self.strategy == 'threshold':
            mem_pct = metrics.get('memory_usage', 0)
            if mem_pct > self.threshold_pct:
                action_needed = True
                reason = f"Memory threshold breached ({mem_pct:.1f}% > {self.threshold_pct}%)"
                
        elif self.strategy == 'predictive':
            verdict = prediction.get('verdict')
            eta = prediction.get('eta_seconds')
            current_mem = metrics.get('memory_usage', 0)
            
            # Trigger if we predict a crash within 60s, OR if we're already leaking past 60%
            if (verdict == 'leak_predicted' and eta is not None and eta <= self.prediction_horizon_s) or current_mem > 60.0:
                action_needed = True
                slope = prediction.get('slope_mb_s', 0)
                r2 = prediction.get('r2', 0)
                reason = f"AI Prediction: ETA {eta}s (Memory at {current_mem:.1f}%, Slope +{slope}MB/s)"
            elif anomaly_score < 0:
                action_needed = True
                reason = f"AI Anomaly Detected (Score: {anomaly_score:.2f}) - Possible CPU Spike or Deadlock"

        if action_needed and self.pod_states.get(pod_name, "HEALTHY") == "HEALTHY":
            self.pod_states[pod_name] = "HEALING"
            event_log.add_event(f"Action triggered for {pod_name}: {reason}", level="WARNING", details={"anomaly": anomaly_score, **prediction})
            asyncio.create_task(self.heal_pod(pod_name))

    async def heal_pod(self, pod_name: str):
        # 1. Scale to n+1
        state = k8s_client.get_deployment_state()
        current_desired = state['desired']
        if current_desired >= 5:
            event_log.add_event("Max replicas reached. Cannot scale up.", level="ERROR")
            self.pod_states[pod_name] = "HEALTHY"
            return
            
        new_desired = current_desired + 1
        k8s_client.scale_deployment(new_desired)
        event_log.add_event(f"Scaled up to {new_desired} replicas", level="INFO")
        
        # 2. Wait for new pod Ready
        await asyncio.sleep(1) # Give K8s time to create pod object
        ready = False
        for _ in range(30):
            state = k8s_client.get_deployment_state()
            if state['ready'] >= new_desired:
                ready = True
                break
            await asyncio.sleep(1)
            
        if not ready:
            event_log.add_event("Timeout waiting for replacement pod to be ready", level="ERROR")
        else:
            event_log.add_event("Replacement pod is Ready", level="INFO")
            
        # 3. Delete leaking pod (Kubernetes will scale down based on desired state if we scaled up, 
        # but to ensure zero downtime we scaled up first. Actually, deleting a pod while desired=N 
        # causes K8s to recreate it. We should just delete the pod and let K8s recreate it if we didn't scale up,
        # OR we scale down back to original desired count after deleting. Wait, if we scale down, K8s might kill the wrong pod.
        # So we delete the specific pod, and scale down.
        
        # Actually, simpler zero downtime: scale up, wait ready, then delete the specific pod, then scale down.
        # But if we just delete the pod, K8s will see desired=N+1 and actual=N, so it will create another.
        # So we must scale down first, then delete the pod before K8s randomly picks one to delete.
        # Even better: annotate pod for deletion cost, then scale down. But for simplicity here, we just explicitly delete the pod.
        try:
            from .settings import settings
            k8s_client.core_v1.delete_namespaced_pod(name=pod_name, namespace=settings.NAMESPACE)
            event_log.add_event(f"Deleted leaking pod {pod_name}", level="INFO")
        except Exception as e:
            event_log.add_event(f"Failed to delete pod: {e}", level="ERROR")
        finally:
            k8s_client.scale_deployment(current_desired) # Always scale back down
            
        self.cooldown_until[pod_name] = time.time() + 30
        self.pod_states[pod_name] = "HEALTHY"

healer = Healer()
