/** Standard API success response */
export interface ApiSuccess<T> {
  data: T;
}

/** Standard API error response */
export interface ApiError {
  error: string;
  code: string;
}

/** Pagination query params */
export interface PaginatedParams {
  limit?: number;
  skip?: number;
}

/** Full metrics snapshot returned by GET /metrics */
export interface IMetrics {
  totalSaved: number;
  totalTarget: number;
  percentage: number;
  remaining: number;
  monthlyRequired: number;          // to reach target by the move-out date
  currentVelocity: number;          // avg monthly savings last 2 months
  projectedMonths: number | null;   // months to goal at current velocity
  onTrack: boolean;
  contributionsByUser: {
    userId: string;
    displayName: string;
    totalContributed: number;
    percentageOfTotal: number;
  }[];
  monthlyHistory: {
    month: string;                  // "Febrero 2026"
    totalDeposited: number;
  }[];
  funds: {
    fundId: string;
    name: string;
    saved: number;
    target: number;
    percentage: number;
    color: string;
  }[];
}
