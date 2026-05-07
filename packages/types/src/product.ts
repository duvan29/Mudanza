/** Household item goal (e.g. "Nevera", "Lavadora") */
export interface IProductGoal {
  _id: string;
  name: string;
  fundId: string;
  budget: number;       // max budget in COP
  purchased: boolean;
  createdAt: string;
}

export interface ICreateProductGoal {
  name: string;
  fundId: string;
  budget: number;
}

/** Specific product version for comparison */
export interface IProductVersion {
  _id: string;
  goalId: string;       // ref: IProductGoal
  name: string;         // e.g. "Samsung RT29K5710S8"
  price: number;        // in COP
  store: string;        // e.g. "Alkosto", "Falabella"
  link: string | null;
  notes: string | null;
  chosen: boolean;      // only one per goalId can be true
  createdBy: string;    // ref: User
  createdAt: string;
}

export interface ICreateProductVersion {
  name: string;
  price: number;
  store: string;
  link?: string;
  notes?: string;
}
