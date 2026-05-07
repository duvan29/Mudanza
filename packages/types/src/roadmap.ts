/** Monthly roadmap entry */
export interface IRoadmapMonth {
  _id: string;
  month: string;        // "Ene", "Feb", etc.
  order: number;        // 1-10
  action: string;       // description of what to do
  status: 'pending' | 'active' | 'done';
  note: string | null;
}
