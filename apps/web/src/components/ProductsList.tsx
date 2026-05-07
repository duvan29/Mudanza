'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCOP } from '@/lib/utils';
import { Plus, Trophy, ExternalLink, Loader2, ShoppingBag, ChevronRight, CheckCircle, BadgeDollarSign, Star } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  budget: number;
  purchased: boolean;
  fundId: string;
}

interface Fund {
  _id: string;
  name: string;
  color: string;
}

interface Version {
  _id: string;
  name: string;
  price: number;
  store: string;
  link?: string;
  notes?: string;
  chosen: boolean;
}

export function ProductsList({ initialProducts, funds }: { initialProducts: Product[]; funds: Fund[] }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [fundId, setFundId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  const [showVersionForm, setShowVersionForm] = useState(false);
  const [vName, setVName] = useState('');
  const [vPrice, setVPrice] = useState('');
  const [vStore, setVStore] = useState('');
  const [vLink, setVLink] = useState('');
  const [vNotes, setVNotes] = useState('');

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !budget || !fundId) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), budget: parseInt(budget, 10), fundId }),
      });
      const json = await res.json();
      setProducts([json.data, ...products]);
      setName('');
      setBudget('');
      setFundId('');
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const selectProduct = async (productId: string) => {
    if (selectedProduct === productId) { setSelectedProduct(null); return; }
    setSelectedProduct(productId);
    setLoadingVersions(true);
    try {
      const res = await fetch(`/api/products/${productId}/versions`);
      const json = await res.json();
      setVersions(json.data ?? []);
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleCreateVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName.trim() || !vPrice || !vStore.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`/api/products/${selectedProduct}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: vName.trim(), price: parseInt(vPrice, 10), store: vStore.trim(), link: vLink.trim() || undefined, notes: vNotes.trim() || undefined }),
      });
      const res = await fetch(`/api/products/${selectedProduct}/versions`);
      const json = await res.json();
      setVersions(json.data ?? []);
      setVName(''); setVPrice(''); setVStore(''); setVLink(''); setVNotes('');
      setShowVersionForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChoose = async (versionId: string) => {
    await fetch(`/api/products/${selectedProduct}/versions/${versionId}/choose`, { method: 'PATCH' });
    const res = await fetch(`/api/products/${selectedProduct}/versions`);
    const json = await res.json();
    setVersions(json.data ?? []);
  };

  const cheapest = versions.length
    ? versions.reduce((min, v) => (v.price < min.price ? v : min), versions[0])
    : null;

  const inputClass = "w-full px-4 py-3 rounded-[var(--radius-md)] border border-border bg-surface-alt text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light/30 text-sm";

  return (
    <div className="space-y-4">
      {/* Add product */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 text-sm font-medium text-primary-dark hover:text-primary px-4 py-2.5 rounded-[var(--radius-md)] bg-primary-light/15 hover:bg-primary-light/25 transition-all"
      >
        <Plus size={16} /> {showForm ? 'Cancelar' : 'Agregar producto'}
      </button>

      {showForm && (
        <form onSubmit={handleCreateProduct} className="bg-surface rounded-[var(--radius-xl)] border border-border-light shadow-[var(--shadow-md)] p-5 space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del producto — ej: Nevera" className={inputClass} required />
          <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Presupuesto (COP)" className={inputClass} required />
          <div>
            <p className="text-xs text-text-muted mb-2 uppercase tracking-wider font-medium">Fondo asociado</p>
            <div className="flex flex-wrap gap-2">
              {funds.map((f) => (
                <button
                  key={f._id}
                  type="button"
                  onClick={() => setFundId(f._id)}
                  className={`px-3.5 py-2 rounded-full text-xs font-medium border transition-all ${fundId === f._id ? 'text-white border-transparent shadow-sm scale-105' : 'text-text-secondary border-border bg-surface-alt hover:bg-surface-hover'}`}
                  style={fundId === f._id ? { backgroundColor: f.color } : undefined}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={submitting} className="w-full py-3 rounded-[var(--radius-md)] bg-gradient-to-r from-primary to-primary-dark text-white font-medium text-sm shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <ShoppingBag size={14} />}
            {submitting ? 'Creando...' : 'Crear producto'}
          </button>
        </form>
      )}

      {/* Products list */}
      {products.map((product) => (
        <div key={product._id} className="bg-surface rounded-[var(--radius-xl)] border border-border-light shadow-[var(--shadow-sm)] overflow-hidden hover:shadow-[var(--shadow-md)] transition-shadow">
          <button onClick={() => selectProduct(product._id)} className="w-full p-5 text-left hover:bg-surface-alt/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-accent/20 flex items-center justify-center">
                  <ShoppingBag size={18} className="text-accent-dark" />
                </div>
                <div>
                  <p className="font-semibold text-text">{product.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">Presupuesto: {formatCOP(product.budget)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {product.purchased && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-success/20 text-success-dark flex items-center gap-1"><CheckCircle size={12} /> Comprado</span>
                )}
                <ChevronRight size={16} className={`text-text-muted transition-transform ${selectedProduct === product._id ? 'rotate-90' : ''}`} />
              </div>
            </div>
          </button>

          {/* Versions */}
          {selectedProduct === product._id && (
            <div className="border-t border-border-light p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text">Versiones a comparar</h3>
                <button onClick={() => setShowVersionForm(!showVersionForm)} className="text-xs font-medium text-primary-dark hover:text-primary px-2.5 py-1 rounded-full bg-primary-light/15 hover:bg-primary-light/25 transition-all">
                  {showVersionForm ? 'Cancelar' : '+ Agregar'}
                </button>
              </div>

              {showVersionForm && (
                <form onSubmit={handleCreateVersion} className="space-y-2.5 bg-surface-alt rounded-[var(--radius-lg)] p-4 border border-border-light">
                  <input value={vName} onChange={(e) => setVName(e.target.value)} placeholder="Nombre — ej: Samsung RT29K" className={inputClass} required />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" value={vPrice} onChange={(e) => setVPrice(e.target.value)} placeholder="Precio (COP)" className={inputClass} required />
                    <input value={vStore} onChange={(e) => setVStore(e.target.value)} placeholder="Tienda" className={inputClass} required />
                  </div>
                  <input value={vLink} onChange={(e) => setVLink(e.target.value)} placeholder="Link (opcional)" className={inputClass} />
                  <input value={vNotes} onChange={(e) => setVNotes(e.target.value)} placeholder="Notas (opcional)" className={inputClass} />
                  <button type="submit" disabled={submitting} className="w-full py-2.5 rounded-[var(--radius-md)] bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-medium shadow-sm disabled:opacity-50">
                    Agregar versión
                  </button>
                </form>
              )}

              {loadingVersions ? (
                <div className="flex justify-center py-4"><Loader2 size={20} className="animate-spin text-primary" /></div>
              ) : versions.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-4">Sin versiones aún — agrega la primera para comparar</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {versions.map((v) => (
                    <div
                      key={v._id}
                      className={`rounded-[var(--radius-lg)] p-4 border transition-all ${v.chosen ? 'border-amber-400 bg-amber-50/50 shadow-[0_0_0_1px_rgba(212,160,23,0.2)]' : 'border-border-light bg-surface hover:border-border hover:shadow-sm'}`}
                    >
                      {v.chosen && (
                        <div className="flex items-center gap-1.5 text-amber-600 text-xs font-semibold mb-2">
                          <Trophy size={14} /> Elegida
                        </div>
                      )}
                      {cheapest && cheapest._id === v._id && !v.chosen && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success/20 text-success-dark mb-2"><BadgeDollarSign size={12} /> Más barato</span>
                      )}
                      <p className="font-medium text-text text-sm">{v.name}</p>
                      <p className="text-base font-bold text-text mt-1 tabular-nums">{formatCOP(v.price)}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{v.store}</p>
                      {v.notes && <p className="text-xs text-text-muted mt-2 leading-relaxed">{v.notes}</p>}
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border-light">
                        {v.link && (
                          <a href={v.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary-dark hover:text-primary font-medium">
                            <ExternalLink size={12} /> Ver tienda
                          </a>
                        )}
                        {!v.chosen && (
                          <button onClick={() => handleChoose(v._id)} className="text-xs font-semibold text-amber-600 hover:text-amber-700 ml-auto">
                            <span className="flex items-center gap-1"><Star size={12} /> Elegir esta</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {products.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-full bg-accent/20 flex items-center justify-center mb-4">
            <ShoppingBag size={28} className="text-accent-dark" />
          </div>
          <p className="text-text-secondary font-medium">Aún no hay productos</p>
          <p className="text-text-muted text-sm mt-1">Agrega el primero para empezar a comparar</p>
        </div>
      )}
    </div>
  );
}
