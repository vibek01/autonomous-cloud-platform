import logging

class Explainer:
    def explain(self, pod_name, metrics, prediction, anomaly_score):
        """
        Generates a human-readable explanation of why the AI made a decision.
        """
        mem_pct = metrics.get('memory_usage', 0)
        
        explanation = []
        explanation.append(f"Analyzing {pod_name}:")
        
        if anomaly_score < 0:
            explanation.append(f"  • Isolation Forest detected anomalous resource patterns (Score: {anomaly_score:.2f}).")
        else:
            explanation.append(f"  • Resource patterns appear normal to Anomaly model.")
            
        verdict = prediction.get('verdict')
        if verdict == 'leak_predicted':
            eta = prediction.get('eta_seconds')
            slope = prediction.get('slope_mb_s', 0)
            explanation.append(f"  • Linear Regression predicts memory leak (+{slope}MB/s).")
            if eta is not None:
                explanation.append(f"  • Projected OOMKill in {eta} seconds.")
        elif verdict == 'insufficient_data':
            explanation.append("  • Insufficient data for regression analysis.")
        else:
            explanation.append("  • Memory usage appears stable.")
            
        return "\n".join(explanation)

explainer = Explainer()
