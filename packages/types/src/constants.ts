/** Initial fund definitions — seeded once, never created via API */
export const INITIAL_FUNDS = [
  { name: 'Muebles esenciales', target: 4_700_000, color: '#A8D8EA', icon: 'sofa', order: 1 },
  { name: 'Reserva emergencia', target: 6_000_000, color: '#B5EAD7', icon: 'shield', order: 2 },
  { name: 'Arriendo + trasteo', target: 2_000_000, color: '#E2C2FF', icon: 'truck', order: 3 },
  { name: 'Colchón general', target: 9_300_000, color: '#FFD6A5', icon: 'piggy-bank', order: 4 },
] as const;

export const TOTAL_TARGET = 22_000_000;

export const TIMELINE = {
  start: '2026-01',
  end: '2026-10',
  totalMonths: 10,
} as const;

/** Roadmap months with actions — seeded once */
export const ROADMAP_MONTHS = [
  { month: 'Ene', order: 1, action: 'Organizar finanzas y abrir cuenta de ahorro conjunta' },
  { month: 'Feb', order: 2, action: 'Establecer aportes fijos mensuales y primer depósito' },
  { month: 'Mar', order: 3, action: 'Investigar zonas y rangos de arriendo' },
  { month: 'Abr', order: 4, action: 'Comparar precios de muebles esenciales' },
  { month: 'May', order: 5, action: 'Evaluar opciones de electrodomésticos' },
  { month: 'Jun', order: 6, action: 'Revisión de medio camino — ajustar presupuesto si necesario' },
  { month: 'Jul', order: 7, action: 'Comenzar a comprar items con mejores ofertas' },
  { month: 'Ago', order: 8, action: 'Buscar apartamento y agendar visitas' },
  { month: 'Sep', order: 9, action: 'Firmar contrato y coordinar logística de trasteo' },
  { month: 'Oct', order: 10, action: 'Mudanza — instalarse en el nuevo hogar' },
] as const;
