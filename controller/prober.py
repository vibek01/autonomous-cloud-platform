import asyncio
import httpx
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class Prober:
    def __init__(self, target_url="http://autonomous-api-service:80", interval_ms=500):
        self.target_url = target_url
        self.interval_s = interval_ms / 1000.0
        self.client = httpx.AsyncClient(timeout=0.25)
        self.running = False
        self.downtime_events = []
        self.current_outage_start = None

    async def start(self):
        self.running = True
        asyncio.create_task(self._probe_loop())

    async def stop(self):
        self.running = False
        await self.client.aclose()

    async def _probe_loop(self):
        while self.running:
            success = False
            try:
                resp = await self.client.get(f"{self.target_url}/health")
                success = resp.status_code == 200
            except Exception:
                pass
                
            if success:
                if self.current_outage_start is not None:
                    # Outage resolved
                    duration = (datetime.now() - self.current_outage_start).total_seconds()
                    self.downtime_events.append({
                        "start": self.current_outage_start.isoformat(),
                        "duration_s": round(duration, 2)
                    })
                    self.current_outage_start = None
            else:
                if self.current_outage_start is None:
                    self.current_outage_start = datetime.now()
                    
            await asyncio.sleep(self.interval_s)

prober = Prober()
