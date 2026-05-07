/** Financial movement (deposit or adjustment) */
export interface IMovement {
  _id: string;
  fundId: string;
  userId: string;
  amount: number;       // always positive, in COP
  type: 'deposit' | 'adjustment';
  note: string | null;
  date: string;
  deleted?: boolean;
  createdAt: string;
}

export interface ICreateMovement {
  fundId: string;
  amount: number;
  type: 'deposit' | 'adjustment';
  note?: string;
}
