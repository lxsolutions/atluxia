import { ShareEvent } from '@atluxia/contracts';

export interface ISharePublisher {
  publish(shareEvent: ShareEvent): Promise<void>;
}