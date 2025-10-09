import os
import requests
from typing import Dict, Optional
from datetime import datetime, timedelta

from .types import (
    PricingRequest, 
    LandedCostBreakdown, 
    PricingResult,
    FeeSchedule,
    FXRate,
    DutyRule,
    Currency,
    Region
)


class PricingEngine:
    """Core pricing engine for landed cost calculation"""

    def __init__(self):
        self.fee_schedules = self._load_fee_schedules()
        self.duty_rules = self._load_duty_rules()
        self.fx_rates = {}
        self.fx_cache_ttl = timedelta(hours=24)
        self.fx_last_updated = None

    def calculate_landed_cost(self, request: PricingRequest) -> PricingResult:
        """Calculate landed cost and determine arbitrage viability"""
        # Update FX rates if needed
        self._update_fx_rates()
        
        # Convert supplier price to USD
        supplier_price_usd = self._convert_to_usd(
            request.supplier_price, 
            request.supplier_currency
        )
        
        # Calculate shipping cost
        shipping_cost = self._calculate_shipping_cost(
            request.supplier_country,
            request.destination_country,
            request.product_weight_kg,
            request.shipping_method
        )
        
        # Calculate import duty
        import_duty = self._calculate_import_duty(
            supplier_price_usd,
            request.supplier_country,
            request.destination_country,
            request.hs_code
        )
        
        # Calculate VAT/tax
        vat_tax = self._calculate_vat_tax(
            supplier_price_usd + shipping_cost + import_duty,
            request.destination_country
        )
        
        # Get fee schedule
        region = self._get_region(request.destination_country)
        fee_schedule = self.fee_schedules.get(region)
        
        if not fee_schedule:
            fee_schedule = self.fee_schedules[Region.US]  # Default to US
        
        # Calculate fees
        platform_fees = self._calculate_platform_fees(supplier_price_usd, fee_schedule)
        payment_fees = self._calculate_payment_fees(supplier_price_usd, fee_schedule)
        
        # Add buffer (5% for unexpected costs)
        buffer = (supplier_price_usd + shipping_cost + import_duty + vat_tax) * 0.05
        
        # Total landed cost
        total_landed_cost = (
            supplier_price_usd + 
            shipping_cost + 
            import_duty + 
            vat_tax + 
            platform_fees + 
            payment_fees + 
            buffer
        )
        
        # Calculate target price
        target_price = self._calculate_target_price(total_landed_cost, region)
        
        # Calculate margins
        margin_pct = (target_price - total_landed_cost) / target_price if target_price > 0 else 0
        abs_margin = target_price - total_landed_cost
        
        # Check arbitrage viability
        is_viable, reason = self._check_arbitrage_viability(margin_pct, abs_margin)
        
        breakdown = LandedCostBreakdown(
            supplier_price_usd=supplier_price_usd,
            shipping_cost=shipping_cost,
            import_duty=import_duty,
            vat_tax=vat_tax,
            platform_fees=platform_fees,
            payment_fees=payment_fees,
            buffer=buffer,
            total_landed_cost=total_landed_cost
        )
        
        return PricingResult(
            landed_cost=total_landed_cost,
            target_price=target_price,
            margin_pct=margin_pct,
            abs_margin=abs_margin,
            breakdown=breakdown,
            is_viable=is_viable,
            reason=reason
        )

    def _convert_to_usd(self, amount: float, currency: Currency) -> float:
        """Convert amount to USD using FX rates"""
        if currency == Currency.USD:
            return amount
        
        rate = self.fx_rates.get(f"{currency.value}_USD")
        if not rate:
            # Fallback rates for development
            fallback_rates = {
                "EUR_USD": 0.85,
                "GBP_USD": 0.73,
                "CAD_USD": 1.35,
                "JPY_USD": 110.5,
                "CNY_USD": 7.2,
            }
            rate = fallback_rates.get(f"{currency.value}_USD", 1.0)
        
        return amount / rate if currency != Currency.USD else amount

    def _calculate_shipping_cost(
        self, 
        origin: str, 
        destination: str, 
        weight_kg: float, 
        method: str
    ) -> float:
        """Calculate shipping cost"""
        # Simplified shipping calculation
        base_rates = {
            "standard": 15.0,
            "express": 35.0,
            "priority": 50.0,
        }
        
        base_cost = base_rates.get(method, 15.0)
        
        # Adjust for weight
        weight_cost = max(0, (weight_kg - 1.0)) * 5.0
        
        # Adjust for distance (simplified)
        if origin != destination:
            distance_multiplier = 1.5 if origin != "US" else 1.0
        else:
            distance_multiplier = 1.0
        
        return (base_cost + weight_cost) * distance_multiplier

    def _calculate_import_duty(
        self, 
        value_usd: float, 
        origin: str, 
        destination: str, 
        hs_code: Optional[str]
    ) -> float:
        """Calculate import duty"""
        # Find applicable duty rule
        duty_pct = 0.0
        
        for rule in self.duty_rules:
            if rule.origin == origin and rule.dest == destination:
                if not hs_code or rule.hs_code == hs_code:
                    duty_pct = rule.duty_pct
                    break
        
        # If no specific rule found, use default
        if duty_pct == 0.0 and origin != destination:
            # Default duty rates
            if origin == "CN" and destination == "US":
                duty_pct = 0.0  # Many consumer electronics are duty-free
            elif origin in ["CN", "TW", "KR"] and destination in ["US", "CA", "EU"]:
                duty_pct = 0.03  # 3% default
            else:
                duty_pct = 0.0
        
        return value_usd * duty_pct

    def _calculate_vat_tax(self, value_usd: float, destination: str) -> float:
        """Calculate VAT/tax"""
        # Simplified VAT rates
        vat_rates = {
            "US": 0.0,  # No federal VAT in US
            "CA": 0.05,  # GST
            "UK": 0.20,  # VAT
            "DE": 0.19,  # VAT
            "FR": 0.20,  # VAT
            "JP": 0.10,  # Consumption tax
        }
        
        vat_rate = vat_rates.get(destination, 0.0)
        return value_usd * vat_rate

    def _calculate_platform_fees(self, price_usd: float, fee_schedule: FeeSchedule) -> float:
        """Calculate platform fees"""
        return (price_usd * fee_schedule.platform_pct) + fee_schedule.fixed_fee

    def _calculate_payment_fees(self, price_usd: float, fee_schedule: FeeSchedule) -> float:
        """Calculate payment processing fees"""
        return price_usd * fee_schedule.payment_pct

    def _calculate_target_price(self, landed_cost: float, region: Region) -> float:
        """Calculate target selling price"""
        # Target 25% margin, with competitive adjustments
        base_target = landed_cost / (1 - 0.25)  # 25% margin
        
        # Competitive pricing adjustments
        # In production, this would use competitor data
        competitive_adjustments = {
            Region.US: 1.0,
            Region.EU: 1.05,  # Slightly higher in EU
            Region.UK: 1.03,
            Region.CA: 0.98,  # Slightly lower in Canada
            Region.JP: 1.10,  # Higher in Japan
            Region.CN: 0.95,  # Lower in China
        }
        
        adjustment = competitive_adjustments.get(region, 1.0)
        target_price = base_target * adjustment
        
        # Round to nearest .99 for psychological pricing
        return round(target_price - 0.01, 2)

    def _check_arbitrage_viability(self, margin_pct: float, abs_margin: float) -> tuple[bool, Optional[str]]:
        """Check if arbitrage is viable"""
        min_margin_pct = float(os.getenv("MIN_MARGIN_PCT", "0.15"))
        min_abs_margin = float(os.getenv("MIN_ABS_MARGIN", "8.0"))
        
        if margin_pct < min_margin_pct:
            return False, f"Margin percentage too low: {margin_pct:.1%} < {min_margin_pct:.1%}"
        
        if abs_margin < min_abs_margin:
            return False, f"Absolute margin too low: ${abs_margin:.2f} < ${min_abs_margin:.2f}"
        
        return True, None

    def _get_region(self, country: str) -> Region:
        """Map country to region"""
        region_map = {
            "US": Region.US,
            "CA": Region.CA,
            "GB": Region.UK,
            "UK": Region.UK,
            "DE": Region.EU,
            "FR": Region.EU,
            "IT": Region.EU,
            "ES": Region.EU,
            "JP": Region.JP,
            "CN": Region.CN,
        }
        return region_map.get(country, Region.US)

    def _update_fx_rates(self):
        """Update FX rates from external source"""
        if self.fx_last_updated and datetime.now() - self.fx_last_updated < self.fx_cache_ttl:
            return
        
        try:
            # Try to get rates from ECB (European Central Bank)
            response = requests.get("https://api.exchangerate.host/latest?base=USD")
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    rates = data.get("rates", {})
                    for currency, rate in rates.items():
                        if currency in [c.value for c in Currency]:
                            self.fx_rates[f"USD_{currency}"] = rate
                            self.fx_rates[f"{currency}_USD"] = 1 / rate
                    self.fx_last_updated = datetime.now()
                    return
        except Exception:
            pass
        
        # Fallback to static rates for development
        self.fx_rates = {
            "USD_EUR": 0.85, "EUR_USD": 1.18,
            "USD_GBP": 0.73, "GBP_USD": 1.37,
            "USD_CAD": 1.35, "CAD_USD": 0.74,
            "USD_JPY": 110.5, "JPY_USD": 0.00905,
            "USD_CNY": 7.2, "CNY_USD": 0.14,
        }
        self.fx_last_updated = datetime.now()

    def _load_fee_schedules(self) -> Dict[Region, FeeSchedule]:
        """Load fee schedules"""
        return {
            Region.US: FeeSchedule(
                region=Region.US,
                platform_pct=0.10,
                payment_pct=0.029,
                fixed_fee=0.30
            ),
            Region.EU: FeeSchedule(
                region=Region.EU,
                platform_pct=0.12,
                payment_pct=0.025,
                fixed_fee=0.25
            ),
            Region.UK: FeeSchedule(
                region=Region.UK,
                platform_pct=0.11,
                payment_pct=0.024,
                fixed_fee=0.28
            ),
            Region.CA: FeeSchedule(
                region=Region.CA,
                platform_pct=0.09,
                payment_pct=0.028,
                fixed_fee=0.32
            ),
        }

    def _load_duty_rules(self) -> list[DutyRule]:
        """Load duty rules"""
        return [
            DutyRule(hs_code="847130", origin="CN", dest="US", duty_pct=0.0),
            DutyRule(hs_code="851712", origin="CN", dest="US", duty_pct=0.0),
            DutyRule(hs_code="950300", origin="CN", dest="US", duty_pct=0.0),
            DutyRule(hs_code="", origin="CN", dest="EU", duty_pct=0.03),
            DutyRule(hs_code="", origin="CN", dest="UK", duty_pct=0.025),
        ]