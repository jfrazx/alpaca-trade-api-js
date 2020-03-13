import { Directions } from '../../types';

export interface ActivitiesParams {
  date?: string;
  until?: string;
  after?: string;
  direction?: Directions;
  page_size?: number;
  page_token?: string;
}
