import { connectDB } from '@/lib/db';
import { ProductGoal, Fund } from '@/lib/models';
import { requireSession } from '@/lib/auth';
import { ProductsList } from '@/components/ProductsList';

export default async function ProductosPage() {
  await requireSession();
  await connectDB();

  const products = await ProductGoal.find().sort({ createdAt: -1 }).lean() as any[];
  const funds = await Fund.find().sort({ order: 1 }).lean() as any[];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-text tracking-tight">Productos</h1>
        <p className="text-text-muted mt-1 text-sm">Compara precios y elige el mejor para cada cosa</p>
      </div>

      <ProductsList
        initialProducts={JSON.parse(JSON.stringify(products))}
        funds={JSON.parse(JSON.stringify(funds))}
      />
    </div>
  );
}
