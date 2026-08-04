/** Monthly roadmap entry */
export interface IRoadmapMonth {
  _id: string;
  month: string;        // "Ene", "Feb", etc.
  year: number;          // e.g. 2026, 2027 — the plan now spans two calendar years
  order: number;        // 1-13
  action: string;       // description of what to do
  status: 'pending' | 'active' | 'done';
  note: string | null;
}
