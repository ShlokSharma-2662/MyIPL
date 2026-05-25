import { TEAMS } from '../data';
import { INTERNATIONAL_TEAMS } from '../internationalData';

export default function TeamBadge({ teamId, size = 'md' }) {
  const t = TEAMS.find(x => x.id === teamId) || INTERNATIONAL_TEAMS.find(x => x.id === teamId);
  if (!t) return null;
  const sz = size === 'sm' ? 'w-7 h-7 text-[10px]' : size === 'lg' ? 'w-12 h-12 text-sm' : 'w-9 h-9 text-xs';
  return (
    <div
      className={`${sz} flex items-center justify-center rounded font-bold shrink-0 border shadow-lg relative overflow-hidden group transition-transform hover:scale-105`}
      style={{ backgroundColor: t.primary, color: t.dark === '#000000' ? '#fff' : t.dark, borderColor: t.dark }}
    >
      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <span className="relative z-10 drop-shadow-md">{t.short}</span>
    </div>
  );
}
