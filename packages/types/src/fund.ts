/** Savings fund (Fondo de ahorro) */
export interface IFund {
  _id: string;
  name: string;
  target: number;       // target amount in COP
  saved: number;        // current saved amount in COP
  color: string;        // hex color for UI
  icon: string;         // lucide icon name
  order: number;        // display sort order
  createdAt: string;
}
