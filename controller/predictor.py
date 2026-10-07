import numpy as np
from datetime import datetime

class Predictor:
    def __init__(self, limit_mb=150.0, min_slope=0.5, min_r2=0.8):
        self.limit_mb = limit_mb
        self.min_slope = min_slope
        self.min_r2 = min_r2

    def predict(self, samples):
        """
        samples: list of dicts with 'time' (isoformat) and 'memory_mb'
        Returns: dict with slope, r2, eta, confidence, verdict
        """
        if len(samples) < 5:
            return {"verdict": "insufficient_data"}

        try:
            # Parse times into seconds from start
            t0 = datetime.fromisoformat(samples[0]["time"])
            x = np.array([(datetime.fromisoformat(s["time"]) - t0).total_seconds() for s in samples])
            y = np.array([s["memory_mb"] for s in samples])

            # Least squares fit
            A = np.vstack([x, np.ones(len(x))]).T
            m, c = np.linalg.lstsq(A, y, rcond=None)[0]

            # R squared
            correlation_matrix = np.corrcoef(x, y)
            correlation_xy = correlation_matrix[0,1]
            r_squared = correlation_xy**2

            if np.isnan(r_squared):
                r_squared = 0.0

            current_mem = y[-1]
            eta = float('inf')
            
            if m > self.min_slope and r_squared > self.min_r2:
                # Memory is leaking
                if current_mem < self.limit_mb:
                    eta = (self.limit_mb - current_mem) / m
                else:
                    eta = 0.0
                verdict = "leak_predicted"
            else:
                verdict = "healthy"

            return {
                "slope_mb_s": round(m, 2),
                "r2": round(r_squared, 4),
                "eta_seconds": round(eta, 1) if eta != float('inf') else None,
                "confidence": round(r_squared * 100, 1),
                "verdict": verdict,
                "current_mb": round(current_mem, 2),
                "limit_mb": self.limit_mb
            }
        except Exception:
            return {"verdict": "error"}

predictor = Predictor()
