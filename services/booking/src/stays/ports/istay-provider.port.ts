import { StaySearchQuery, StayListing } from '@atluxia/contracts';

export interface IStayProvider {
  search(query: StaySearchQuery): Promise<StayListing[]>;
  getProviderName(): string;
}