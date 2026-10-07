from sklearn.ensemble import IsolationForest
import numpy as np

class AnomalyDetector:
    def __init__(self, baseline_samples=None):
        self.model = IsolationForest(contamination=0.1, random_state=42)
        self.is_trained = False
        if baseline_samples:
            self.train(baseline_samples)

    def train(self, samples):
        """
        samples: list of feature lists [cpu_pct, mem_pct]
        """
        if len(samples) > 10:
            X = np.array(samples)
            self.model.fit(X)
            self.is_trained = True

    def score(self, features):
        """
        Returns anomaly score [-1, 1]. Lower is more abnormal.
        """
        if not self.is_trained:
            return 1.0 # Normal by default
        
        X = np.array([features])
        # decision_function returns average anomaly score, typically between [-0.5, 0.5]
        # We can map it roughly
        score = self.model.decision_function(X)[0]
        return float(score)

anomaly_detector = AnomalyDetector()
