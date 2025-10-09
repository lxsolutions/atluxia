










from typing import Dict

class HousingCredits:
    def __init__(self):
        self.credit_amount = 5000  # Base credit amount per unit
        self.max_credits_per_developer = 10  # Max credits per developer
        self.target_units = 2000  # Target new units to incentivize

    def calculate_impact(self, market_rent: float, construction_costs: float) -> Dict:
        """
        Calculate the impact of housing build credits program
        Returns dict with economic, social, and housing impacts
        """
        # Economic impact calculation
        total_credits = self._calculate_total_credits()
        revenue_impact = self._estimate_revenue_impact(total_credits)

        # Housing market impact (simplified)
        units_incentivized = self._estimate_units_incentivized(market_rent, construction_costs)
        rent_change_pct = self._estimate_rent_change(units_incentivized)

        # Social impact (simplified)
        affordability_score = self._calculate_affordability_score(rent_change_pct)

        return {
            "economic": {
                "total_credits": total_credits,
                "revenue_impact": revenue_impact,
                "net_fiscal_cost": -total_credits  # Credits are a cost to government
            },
            "housing_market": {
                "units_incentivized": units_incentivized,
                "rent_change_pct": rent_change_pct,
                "affordability_index": affordability_score
            },
            "social": {
                "low_income_benefit_score": self._estimate_low_income_benefit(units_incentivized),
                "equity_index_change": 0.1 * (units_incentivized / 500)  # Simplified
            },
            "parameters_used": {
                "credit_amount": self.credit_amount,
                "target_units": self.target_units,
                "market_rent": market_rent,
                "construction_costs": construction_costs
            }
        }

    def _calculate_total_credits(self) -> float:
        """Calculate total credits to be distributed"""
        return self.credit_amount * self.max_credits_per_developer * 50  # 50 developers

    def _estimate_revenue_impact(self, total_credits: float) -> float:
        """Estimate revenue impact (negative = cost to government)"""
        admin_cost = 0.1 * total_credits  # 10% admin cost
        return -total_credits - admin_cost

    def _estimate_units_incentivized(self, market_rent: float, construction_costs: float) -> int:
        """Estimate number of units that will be built due to credits"""
        # Simplified model based on rent-to-cost ratio
        rent_to_cost_ratio = market_rent / construction_costs
        if rent_to_cost_ratio < 0.2:
            return 500  # Very low, but still some development
        elif rent_to_cost_ratio < 0.3:
            return 1000
        else:
            return self.target_units

    def _estimate_rent_change(self, units_incentivized: int) -> float:
        """Estimate percentage change in market rent"""
        # Simplified supply-demand model
        current_supply = 50000  # Existing units
        new_supply = current_supply + units_incentivized
        return -1.0 * (units_incentivized / current_supply) * 0.3  # 30% of supply effect

    def _calculate_affordability_score(self, rent_change_pct: float) -> float:
        """Calculate affordability score based on rent change"""
        if rent_change_pct > 0:
            return 1.0 - (rent_change_pct / 5)
        else:
            return 1.0 + (-rent_change_pct / 3)

    def _estimate_low_income_benefit(self, units_incentivized: int) -> float:
        """Estimate benefit to low-income households"""
        # Simplified model
        if units_incentivized < 500:
            return 0.2
        elif units_incentivized < 1500:
            return 0.5
        else:
            return 0.8

    def get_policy_parameters(self) -> Dict:
        """Return current policy parameters"""
        return {
            "credit_amount": self.credit_amount,
            "max_credits_per_developer": self.max_credits_per_developer,
            "target_units": self.target_units
        }

    def update_credit_amount(self, new_amount: float) -> None:
        """Update the credit amount per unit"""
        if new_amount < 0:
            raise ValueError("Credit amount cannot be negative")
        self.credit_amount = new_amount

    def update_target_units(self, new_target: int) -> None:
        """Update target units to incentivize"""
        if new_target < 1:
            raise ValueError("Target units must be positive")
        self.target_units = new_target





