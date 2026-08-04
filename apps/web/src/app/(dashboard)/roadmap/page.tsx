import { connectDB } from '@/lib/db';
import { RoadmapMonth } from '@/lib/models';
import { requireSession } from '@/lib/auth';
import { RoadmapTimeline } from '@/components/RoadmapTimeline';
import { Info } from 'lucide-react';

export default async function RoadmapPage() {
  await requireSession();
  await connectDB();

  const months = await RoadmapMonth.find().sort({ order: 1 }).lean() as any[];
  const doneCount = months.filter((m) => m.status === 'done').length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-text tracking-tight">Roadmap 2026–2027</h1>
        <p className="text-text-muted mt-1 text-sm">
          Enero 2026 → 15 de enero 2027 • <span className="font-medium text-success-dark">{doneCount}/{months.length} completados</span>
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-text-muted bg-surface-alt px-4 py-2.5 rounded-[var(--radius-md)] border border-border-light">
        <Info size={14} className="text-primary shrink-0" />
        <span>Toca los circulos para cambiar el estado: pendiente → en curso → completado</span>
      </div>

      <RoadmapTimeline initialMonths={JSON.parse(JSON.stringify(months))} />
    </div>
  );
}
