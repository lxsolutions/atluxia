








export interface RatePlan {
  baseNightly: number
  weeklyDiscountPct?: number
  monthlyDiscountPct?: number
  minNights?: number
  maxNights?: number
}

export interface PricingParams {
  ratePlan: RatePlan
  nights: number
}

/**
 * Calculates the total price for a stay based on length-of-stay discounts.
 *
 * @param params - The pricing parameters including rate plan and number of nights
 * @returns Structured pricing breakdown with totals
 */
export function calculatePricing(params: PricingParams): PricingBreakdown {
  const { ratePlan, nights } = params

  // Apply appropriate discount based on length of stay
  let nightlyRate = ratePlan.baseNightly

  if (nights >= 28) {
    // Monthly discount applies to stays 28+ nights
    nightlyRate *= (1 - (ratePlan.monthlyDiscountPct || 0) / 100)
  } else if (nights >= 7) {
    // Weekly discount applies to stays between 7-27 nights
    nightlyRate *= (1 - (ratePlan.weeklyDiscountPct || 0) / 100)
  }

  const total = nightlyRate * nights

  return {
    baseNightly: ratePlan.baseNightly,
    appliedNightly: nightlyRate.toFixed(2),
    totalNights: nights,
    subtotal: total.toFixed(2),
    fees: (total * 0.1).toFixed(2), // Example fee structure
    taxes: (total * 0.07).toFixed(2), // Example tax rate
    deposit: Math.min(total * 0.3, 500).toFixed(2),
    totalWithFeesAndTaxes: (
      parseFloat(total.toFixed(2)) +
      parseFloat((total * 0.1).toFixed(2)) + // fees
      parseFloat((total * 0.07).toFixed(2))   // taxes
    ).toFixed(2)
  }
}

export interface PricingBreakdown {
  baseNightly: number
  appliedNightly: string
  totalNights: number
  subtotal: string
  fees: string
  taxes: string
  deposit: string
  totalWithFeesAndTaxes: string
}




