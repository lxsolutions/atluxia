

from typing import Dict, List

class CongestionPricing:
    def __init__(self):
        self.base_fee = 5.0  # Base fee per vehicle entry
        self.time_window_hours = 4  # Peak hours with pricing
        self.discount_for_residents = 0.5  # 50% discount for residents

    def calculate_impact(self, current_traffic_volume: int, peak_hour_demand: float) -> Dict:
        """
        Calculate the impact of congestion pricing policy
        Returns dict with economic, traffic, and environmental impacts
        """
        # Economic impact calculation
        revenue = self._calculate_revenue(current_traffic_volume)
        compliance_costs = self._estimate_compliance_costs()

        # Traffic impact (simplified)
        volume_reduction = self._estimate_volume_reduction(peak_hour_demand)
        travel_time_change_pct = self._estimate_travel_time_change(volume_reduction)

        # Environmental impact (simplified)
        emission_reduction = self._estimate_emission_reduction(volume_reduction)

        return {
            "economic": {
                "revenue": revenue,
                "compliance_costs": compliance_costs,
                "net_fiscal_impact": revenue - compliance_costs
            },
            "traffic": {
                "volume_reduction_pct": volume_reduction,
                "travel_time_change_pct": travel_time_change_pct,
                "congestion_index": self._calculate_congestion_index(volume_reduction)
            },
            "environmental": {
                "emission_reduction_tons": emission_reduction,
                "air_quality_index_change": 0.1 * (emission_reduction / 1000)  # Simplified
            },
            "parameters_used": {
                "base_fee": self.base_fee,
                "time_window_hours": self.time_window_hours,
                "peak_hour_demand": peak_hour_demand,
                "current_traffic_volume": current_traffic_volume
            }
        }

    def _calculate_revenue(self, current_traffic_volume: int) -> float:
        """Calculate expected revenue from congestion pricing"""
        # Simplified model with some elasticity
        vehicles_paying = current_traffic_volume * 0.85  # 15% avoid the fee
        return vehicles_paying * self.base_fee * self.time_window_hours * 250  # 250 days/year

    def _estimate_compliance_costs(self) -> float:
        """Estimate compliance costs for businesses and residents"""
        # Simplified model
        return 1e6 + (self.base_fee * 0.85 * self.time_window_hours * 250 * 0.3)

    def _estimate_volume_reduction(self, peak_hour_demand: float) -> float:
        """Estimate percentage reduction in traffic volume"""
        # Simplified demand model
        if peak_hour_demand < 1.5:
            return 20.0
        elif peak_hour_demand < 2.0:
            return 18.0
        else:
            return 15.0

    def _estimate_travel_time_change(self, volume_reduction_pct: float) -> float:
        """Estimate percentage change in travel time"""
        # Simplified model: 3% improvement per 10% volume reduction
        return -0.3 * (volume_reduction_pct / 10)

    def _estimate_emission_reduction(self, volume_reduction_pct: float) -> float:
        """Estimate emission reduction in tons CO2"""
        # Simplified model: 5 tons per 1% volume reduction
        return 5.0 * (volume_reduction_pct / 1)

    def _calculate_congestion_index(self, volume_reduction_pct: float) -> float:
        """Calculate congestion index (lower is better)"""
        base_index = 80.0  # Without pricing
        improvement = 20.0 * (volume_reduction_pct / 30)  # Up to 20 point improvement
        return max(40, base_index - improvement)

    def get_policy_parameters(self) -> Dict:
        """Return current policy parameters"""
        return {
            "base_fee": self.base_fee,
            "time_window_hours": self.time_window_hours,
            "discount_for_residents": self.discount_for_residents
        }

    def update_base_fee(self, new_fee: float) -> None:
        """Update the base fee per vehicle entry"""
        if new_fee < 0:
            raise ValueError("Base fee cannot be negative")
        self.base_fee = new_fee

    def update_time_window(self, new_hours: int) -> None:
        """Update the time window with pricing (hours)"""
        if new_hours < 1 or new_hours > 8:
            raise ValueError("Time window must be between 1 and 8 hours")
        self.time_window_hours = new_hours

    def update_resident_discount(self, new_discount: float) -> None:
        """Update the discount percentage for residents"""
        if new_discount < 0 or new_discount > 1.0:
            raise ValueError("Discount must be between 0 and 1")
        self.discount_for_residents = new_discount
