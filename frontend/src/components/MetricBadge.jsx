/* eslint-disable no-unused-vars */
export default function MetricBadge({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10">
      <Icon size={16} className="text-accent" />
      <div className="flex flex-col">
        <span className="text-text-main font-semibold text-sm">{value}</span>
        <span className="text-text-soft text-xs">{label}</span>
      </div>
    </div>
  );
}
