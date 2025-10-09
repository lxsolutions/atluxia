import { Injectable } from '@nestjs/common';
import { StayListing, RankingReason, StaySearchQuery } from '@atluxia/contracts';
import { IRanker } from '../ports/iranker.port';

interface RankingWeights {
  price: number;
  rating: number;
  location: number;
  amenities: number;
  availability: number;
  luxury: number;
  family: number;
  view: number;
  space: number;
}

@Injectable()
export class WeightedLinearRanker implements IRanker {
  private defaultWeights: RankingWeights = {
    price: 0.25,
    rating: 0.2,
    location: 0.15,
    amenities: 0.1,
    availability: 0.08,
    luxury: 0.07,
    family: 0.06,
    view: 0.05,
    space: 0.04,
  };

  async rank(listings: StayListing[], query: StaySearchQuery): Promise<{
    rankedListings: StayListing[];
    reasons: Map<string, RankingReason[]>;
  }> {
    const reasons = new Map<string, RankingReason[]>();
    const scoredListings = listings.map(listing => {
      const listingReasons: RankingReason[] = [];
      let score = 0;

      // Calculate score based on features
      for (const reason of listing.reasons) {
        const featureScore = this.calculateFeatureScore(reason, query);
        score += featureScore;
        listingReasons.push({
          ...reason,
          weight: reason.weight,
          value: reason.value,
        });
      }

      // Normalize score to 0-100 range
      score = Math.min(Math.max(score * 100, 0), 100);

      reasons.set(listing.id, listingReasons);

      return {
        ...listing,
        score,
      };
    });

    // Sort by score descending
    const rankedListings = scoredListings.sort((a, b) => b.score - a.score);

    return {
      rankedListings,
      reasons,
    };
  }

  private calculateFeatureScore(reason: RankingReason, query: StaySearchQuery): number {
    const weight = this.defaultWeights[reason.feature as keyof RankingWeights] || 0.1;
    
    switch (reason.feature) {
      case 'price':
        return this.calculatePriceScore(reason.value as number, query, weight);
      case 'rating':
        return this.calculateRatingScore(reason.value as number, weight);
      case 'location':
        return this.calculateLocationScore(reason.value as string, query, weight);
      case 'amenities':
        return this.calculateAmenitiesScore(reason.value as string[], weight);
      case 'availability':
        return this.calculateAvailabilityScore(reason.value as string, weight);
      case 'luxury':
        return this.calculateLuxuryScore(reason.value as string, weight);
      case 'family':
        return this.calculateFamilyScore(reason.value as string, weight);
      case 'view':
        return this.calculateViewScore(reason.value as string, weight);
      case 'space':
        return this.calculateSpaceScore(reason.value as number, weight);
      default:
        return weight * 0.5;
    }
  }

  private calculatePriceScore(price: number, query: StaySearchQuery, weight: number): number {
    if (query.filters?.maxPrice) {
      // Higher score for lower prices relative to max budget
      const priceRatio = Math.max(0, 1 - (price / query.filters.maxPrice));
      return weight * priceRatio;
    }
    // Default: higher score for lower prices
    const normalizedPrice = Math.max(0, 1 - (price / 1000)); // Assuming $1000 as max
    return weight * normalizedPrice;
  }

  private calculateRatingScore(rating: number, weight: number): number {
    // Higher score for higher ratings
    return weight * (rating / 5);
  }

  private calculateLocationScore(location: string, query: StaySearchQuery, weight: number): number {
    if (query.location && location.toLowerCase().includes(query.location.toLowerCase())) {
      return weight * 1.0; // Exact match
    }
    return weight * 0.5; // Partial match or no location specified
  }

  private calculateAmenitiesScore(amenities: string[], weight: number): number {
    // Higher score for more amenities
    const amenityCount = amenities?.length || 0;
    return weight * Math.min(amenityCount / 5, 1);
  }

  private calculateAvailabilityScore(availability: string, weight: number): number {
    // Higher score for better availability
    switch (availability) {
      case 'high':
        return weight * 1.0;
      case 'medium':
        return weight * 0.7;
      case 'low':
        return weight * 0.3;
      default:
        return weight * 0.5;
    }
  }

  private calculateLuxuryScore(luxury: string, weight: number): number {
    // Higher score for luxury features
    return weight * 0.8; // Luxury always gets good score
  }

  private calculateFamilyScore(family: string, weight: number): number {
    // Higher score for family-friendly features
    return weight * 0.9;
  }

  private calculateViewScore(view: string, weight: number): number {
    // Higher score for better views
    switch (view) {
      case 'city':
      case 'ocean':
        return weight * 1.0;
      case 'garden':
      case 'mountain':
        return weight * 0.8;
      default:
        return weight * 0.5;
    }
  }

  private calculateSpaceScore(space: number, weight: number): number {
    // Higher score for more space
    return weight * Math.min(space / 5, 1);
  }

  getAlgorithmName(): string {
    return 'weighted_linear';
  }
}