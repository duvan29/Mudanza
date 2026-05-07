'use client';

import Link from 'next/link';
import { formatCOP } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

interface Fund {
  _id: string;
  name: string;
  target: number;
  saved: number;
  color: string;
}

export function FundCard({ fund }: { fund: Fund }) {
  const percentage = fund.target > 0 ? Math.round((fund.saved / fund.target) * 100) : 0;

  return (
    <Link href={`/fondos?id=${fund._id}`}>
      <div className="group bg-surface rounded-[var(--radius-lg)] p-5 border border-border-light hover:border-border hover:shadow-[var(--shadow-md)] transition-all cursor-pointer">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center"
            style={{ backgroundColor: `${fund.color}30` }}
          >
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: fund.color }} />
          </div>
          <div className="flex-1">
            <span className="font-medium text-text text-sm">{fund.name}</span>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${fund.color}20`, color: fund.color }}>
            {percentage}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-surface-alt overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out group-hover:brightness-110"
            style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: fund.color }}
          />
        </div>

        <div className="flex items-center justify-between mt-2.5">
          <p className="text-xs text-text-muted">
            {formatCOP(fund.saved)} <span className="text-text-muted/60">/ {formatCOP(fund.target)}</span>
          </p>
          <TrendingUp size={12} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </Link>
  );
}
