from kubernetes import client, config
from .settings import settings
import logging

logger = logging.getLogger(__name__)

class K8sClient:
    def __init__(self):
        try:
            config.load_incluster_config()
            logger.info("Loaded in-cluster Kubernetes config")
        except config.ConfigException:
            try:
                config.load_kube_config()
                logger.info("Loaded local Kubernetes config")
            except Exception as e:
                logger.error(f"Failed to load Kubernetes config: {e}")
        
        self.core_v1 = client.CoreV1Api()
        self.apps_v1 = client.AppsV1Api()

    def get_deployment_state(self):
        try:
            deploy = self.apps_v1.read_namespaced_deployment(
                name=settings.TARGET_DEPLOYMENT,
                namespace=settings.NAMESPACE
            )
            return {
                "desired": deploy.spec.replicas,
                "ready": deploy.status.ready_replicas or 0,
                "available": deploy.status.available_replicas or 0,
            }
        except Exception as e:
            logger.error(f"Error fetching deployment state: {e}")
            return {"desired": 0, "ready": 0, "available": 0}

    def get_pods(self):
        try:
            label_selector = "app=autonomous-api"
            pods = self.core_v1.list_namespaced_pod(
                namespace=settings.NAMESPACE,
                label_selector=label_selector
            )
            return pods.items
        except Exception as e:
            logger.error(f"Error fetching pods: {e}")
            return []
            
    def scale_deployment(self, replicas: int):
        try:
            body = {"spec": {"replicas": replicas}}
            self.apps_v1.patch_namespaced_deployment_scale(
                name=settings.TARGET_DEPLOYMENT,
                namespace=settings.NAMESPACE,
                body=body
            )
            return True
        except Exception as e:
            logger.error(f"Error scaling deployment: {e}")
            return False

    def get_pod_logs(self, pod_name, previous=False):
        try:
            logs = self.core_v1.read_namespaced_pod_log(
                name=pod_name,
                namespace=settings.NAMESPACE,
                previous=previous,
                tail_lines=50
            )
            return logs
        except Exception:
            return ""

k8s_client = K8sClient()
