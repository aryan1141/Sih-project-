export const CATEGORY_COLORS: Record<string, string> = {
  Wildfires: '#FF7A45',
  Floods: '#3FC7C0',
  'Severe Storms': '#C9A8FF',
  Earthquakes: '#FFD166',
  Volcanoes: '#3B82F6',
  Landslides: '#E29578',
  Drought: '#DDA15E',
  'Sea and Lake Ice': '#90E0EF',
  Other: '#8CA0B3',
};

export const DEFAULT_COLOR = '#8CA0B3';

export function colorFor(category?: string): string {
  if (!category) return DEFAULT_COLOR;
  return CATEGORY_COLORS[category] || DEFAULT_COLOR;
}

export function getSeverityBadge(severity?: string): { label: string; bg: string; text: string } {
  switch (severity) {
    case 'critical':
      return { label: 'CRITICAL', bg: 'bg-red-950/70 border-red-500/50', text: 'text-red-400' };
    case 'high':
      return { label: 'HIGH', bg: 'bg-orange-950/70 border-orange-500/50', text: 'text-orange-400' };
    case 'moderate':
      return { label: 'MODERATE', bg: 'bg-yellow-950/70 border-yellow-500/50', text: 'text-yellow-400' };
    default:
      return { label: 'MONITORING', bg: 'bg-slate-800/70 border-slate-600/50', text: 'text-slate-300' };
  }
}
