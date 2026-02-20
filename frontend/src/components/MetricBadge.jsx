/* eslint-disable no-unused-vars */
export default function MetricBadge({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-accent/20 bg-surface/60 px-3 py-2 backdrop-blur-md">
      <Icon size={16} className="text-accent" />
      <div className="flex flex-col">
        <span className="text-text-main font-semibold text-sm">{value}</span>
        <span className="text-text-soft text-xs">{label}</span>
      </div>
    </div>
  );
}
