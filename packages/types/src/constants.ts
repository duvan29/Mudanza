/** Initial fund definitions — seeded once, never created via API */
export const INITIAL_FUNDS = [
  { name: 'Muebles esenciales', target: 4_700_000, color: '#A8D8EA', icon: 'sofa', order: 1 },
  { name: 'Reserva emergencia', target: 9_000_000, color: '#B5EAD7', icon: 'shield', order: 2 },
  { name: 'Arriendo + trasteo', target: 2_000_000, color: '#E2C2FF', icon: 'truck', order: 3 },
  { name: 'Colchón general', target: 14_300_000, color: '#FFD6A5', icon: 'piggy-bank', order: 4 },
] as const;

export const TOTAL_TARGET = 30_000_000;

export const TIMELINE = {
  start: '2026-01-01',
  end: '2027-01-15',
  totalMonths: 12.5,
} as const;

/** Roadmap months with actions — seeded once */
export const ROADMAP_MONTHS = [
  { month: 'Ene', year: 2026, order: 1, action: 'Organizar finanzas y abrir cuenta de ahorro conjunta' },
  { month: 'Feb', year: 2026, order: 2, action: 'Establecer aportes fijos mensuales y primer depósito' },
  { month: 'Mar', year: 2026, order: 3, action: 'Investigar zonas y rangos de arriendo' },
  { month: 'Abr', year: 2026, order: 4, action: 'Comparar precios de muebles esenciales' },
  { month: 'May', year: 2026, order: 5, action: 'Evaluar opciones de electrodomésticos' },
  { month: 'Jun', year: 2026, order: 6, action: 'Revisión de medio camino — ajustar presupuesto si necesario' },
  { month: 'Jul', year: 2026, order: 7, action: 'Comenzar a comprar items con mejores ofertas' },
  { month: 'Ago', year: 2026, order: 8, action: 'Buscar apartamento y agendar visitas' },
  { month: 'Sep', year: 2026, order: 9, action: 'Revisión de plazo extendido — subir aportes para la nueva meta de $30M' },
  { month: 'Oct', year: 2026, order: 10, action: 'Seguir ahorrando al nuevo ritmo — reforzar Colchón y Emergencia' },
  { month: 'Nov', year: 2026, order: 11, action: 'Buscar apartamento y agendar visitas para enero' },
  { month: 'Dic', year: 2026, order: 12, action: 'Firmar contrato y coordinar logística de trasteo' },
  { month: 'Ene', year: 2027, order: 13, action: 'Mudanza — instalarse en el nuevo hogar (15 de enero)' },
] as const;
