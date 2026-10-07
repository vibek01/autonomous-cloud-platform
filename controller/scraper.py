import asyncio
import httpx
import logging
from datetime import datetime
from .k8s_client import k8s_client
from .settings import settings

logger = logging.getLogger(__name__)

class Scraper:
    def __init__(self):
        self.pod_metrics = {}
        self.client = httpx.AsyncClient(timeout=1.0)
        self.running = False

    async def start(self):
        self.running = True
        asyncio.create_task(self._scrape_loop())

    async def stop(self):
        self.running = False
        await self.client.aclose()

    async def _scrape_loop(self):
        while self.running:
            pods = k8s_client.get_pods()
            current_pod_names = {pod.metadata.name for pod in pods}
            
            # Clean up old pods
            self.pod_metrics = {k: v for k, v in self.pod_metrics.items() if k in current_pod_names}

            tasks = []
            for pod in pods:
                if pod.status.pod_ip:
                    tasks.append(self._scrape_pod(pod))
            
            if tasks:
                await asyncio.gather(*tasks, return_exceptions=True)
            
            await asyncio.sleep(settings.SCRAPE_INTERVAL_MS / 1000.0)

    async def _scrape_pod(self, pod):
        name = pod.metadata.name
        ip = pod.status.pod_ip
        url = f"http://{ip}:8000/metrics"
        
        try:
            resp = await self.client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                self.pod_metrics[name] = {
                    "time": datetime.now().isoformat(),
                    "cpu_usage": data.get("cpu_usage", 0),
                    "memory_usage": data.get("memory_usage", 0),
                    "memory_mb": data.get("memory_mb", 0),
                    "limit_mb": data.get("limit_mb", 150)
                }
        except Exception as e:
            logger.debug(f"Failed to scrape {name}: {e}")

scraper = Scraper()
