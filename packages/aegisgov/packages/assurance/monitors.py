










import numpy as np
from typing import Dict, Any

class AssuranceMonitors:
    def __init__(self):
        # Tripwire thresholds from constitution
        self.fairness_regression_pct = 2.0
        self.safety_margin_slack_pct = 3.0
        self.ood_zscore = 3.0
        self.appeal_rate_pct = 5.0
        self.upheld_appeal_rate_pct = 1.0

    def check_fairness_regression(self, metrics: Dict) -> Dict:
        """Check for fairness regression in Atkinson index"""
        if not metrics or 'historical_data' not in metrics or 'current_metrics' not in metrics:
            return {"status": "skipped", "reason": "Insufficient data"}

        historical = [d.get('atkinson_index', 0) for d in metrics['historical_data']]
        current = metrics['current_metrics'].get('atkinson_index', 0)

        if len(historical) < 2:
            return {"status": "skipped", "reason": "Need at least 2 historical data points"}

        # Calculate percentage change
        avg_historical = np.mean(historical)
        pct_change = ((current - avg_historical) / avg_historical) * 100

        if pct_change > self.fairness_regression_pct:
            return {
                "status": "triggered",
                "reason": f"Fairness regression detected: {pct_change:.2f}% increase in Atkinson index",
                "details": {"current_value": current, "historical_avg": avg_historical}
            }

        return {"status": "passed", "details": {"pct_change": pct_change}}

    def check_safety_margin(self, metrics: Dict) -> Dict:
        """Check reserve margin safety margin"""
        if not metrics or 'current_metrics' not in metrics:
            return {"status": "skipped", "reason": "Insufficient data"}

        current_reserve = metrics['current_metrics'].get('reserve_margin', 0)
        target_reserve = 15.0  # Example target

        if current_reserve < (target_reserve - self.safety_margin_slack_pct):
            return {
                "status": "triggered",
                "reason": f"Safety margin breach: {current_reserve} < {(target_reserve - self.safety_margin_slack_pct)}",
                "details": {"current_value": current_reserve, "target": target_reserve}
            }

        return {"status": "passed", "details": {"current_value": current_reserve}}

    def check_ood_detection(self, metrics: Dict) -> Dict:
        """Check for out-of-distribution KPI values using z-score"""
        if not metrics or 'historical_data' not in metrics or 'current_metrics' not in metrics:
            return {"status": "skipped", "reason": "Insufficient data"}

        historical_values = []
        current_values = {}

        # Collect historical and current values for all KPIs
        kpi_names = ['unemployment', 'carbon_intensity', 'rent_burden']
        for kpi in kpi_names:
            hist_kpis = [d.get(kpi, None) for d in metrics['historical_data']]
            current_kpi = metrics['current_metrics'].get(kpi, None)

            if hist_kpis and current_kpi is not None:
                historical_values.extend([v for v in hist_kpis if v is not None])
                current_values[kpi] = current_kpi

        # Check each KPI for OOD
        triggered_kpis = []
        for kpi, current_val in current_values.items():
            if len(historical_values) < 3:  # Need at least 3 points for z-score
                continue

            mean_val = np.mean(historical_values)
            std_val = np.std(historical_values)

            if std_val == 0:
                continue

            z_score = (current_val - mean_val) / std_val
            if abs(z_score) > self.ood_zscore:
                triggered_kpis.append(kpi)

        if triggered_kpis:
            return {
                "status": "triggered",
                "reason": f"OOD detected in KPIs: {', '.join(triggered_kpis)}",
                "details": {"z_scores": current_values}
            }

        return {"status": "passed", "details": {"checked_kpis": list(current_values.keys())}}

    def check_appeal_rates(self, metrics: Dict) -> Dict:
        """Check appeal rates"""
        if not metrics or 'appeal_data' not in metrics:
            return {"status": "skipped", "reason": "Insufficient data"}

        appeal_data = metrics['appeal_data']
        total_appeals = appeal_data.get('total_appeals', 0)
        upheld_appeals = appeal_data.get('upheld_appeals', 0)
        population_size = appeal_data.get('population_size', 1)

        if population_size <= 0:
            return {"status": "skipped", "reason": "Invalid population size"}

        # Calculate rates
        appeal_rate = (total_appeals / population_size) * 100
        upheld_rate = (upheld_appeals / total_appeals) * 100 if total_appeals > 0 else 0

        triggered_reasons = []
        if appeal_rate > self.appeal_rate_pct:
            triggered_reasons.append(f"Appeal rate: {appeal_rate:.2f}% > {self.appeal_rate_pct}%")

        if upheld_rate > self.upheld_appeal_rate_pct:
            triggered_reasons.append(f"Upheld appeal rate: {upheld_rate:.2f}% > {self.upheld_appeal_rate_pct}%")

        if triggered_reasons:
            return {
                "status": "triggered",
                "reason": "; ".join(triggered_reasons),
                "details": {"appeal_rate": appeal_rate, "upheld_rate": upheld_rate}
            }

        return {"status": "passed", "details": {"appeal_rate": appeal_rate, "upheld_rate": upheld_rate}}

    def run_all_monitors(self, metrics: Dict) -> Dict:
        """Run all assurance monitors and return combined results"""
        results = {
            'fairness_regression': self.check_fairness_regression(metrics),
            'safety_margin': self.check_safety_margin(metrics),
            'ood_detection': self.check_ood_detection(metrics),
            'appeal_rates': self.check_appeal_rates(metrics)
        }

        tripwires_triggered = any(result['status'] == 'triggered' for result in results.values())

        return {
            "tripwires_triggered": tripwires_triggered,
            "details": {k: v["reason"] if v["status"] == "triggered" else None
                       for k, v in results.items()}
        }

    def auto_pause_on_tripwire(self, metrics: Dict) -> Dict:
        """Auto-pause system and log ledger entry when tripwires triggered"""
        result = self.run_all_monitors(metrics)

        if not result['tripwires_triggered']:
            return {"status": "running", "message": "All monitors passed"}

        # In a real system, this would:
        # 1. Pause all agents
        # 2. Create ledger entry with reason
        # 3. Notify human operators

        triggered_reasons = [v for v in result['details'].values() if v is not None]
        pause_reason = "; ".join(triggered_reasons)

        return {
            "status": "paused",
            "message": f"System auto-paused due to tripwires: {pause_reason}",
            "ledger_entry": {
                "ts": "2025-08-22T12:00:00Z",
                "severity": "critical",
                "reason": pause_reason,
                "action_taken": "auto_pause"
            }
        }








