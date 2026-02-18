/* eslint-disable no-unused-vars */
export default function ActionButton({
  icon: Icon,
  label,
  primary = false,
  onClick,
  disabled = false,
  iconClassName = "",
  emphasize = false,
  compact = false,
}) {
  const iconSize = compact ? 14 : 16;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center rounded-xl border font-medium transition-all duration-300
        ${compact ? "h-9 w-[104px] shrink-0 gap-1.5 px-2.5 text-xs whitespace-nowrap" : "w-full gap-2 px-4 py-2.5 text-sm sm:w-auto"}
        hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]
        backdrop-blur-md shadow-soft disabled:cursor-not-allowed disabled:opacity-50
        ${emphasize ? "animate-button-pop" : ""}
        ${
          primary
            ? "border-primary/45 bg-primary/85 text-background hover:bg-primary"
            : "border-white/20 bg-surface-2/60 text-text-main hover:border-primary/35 hover:bg-surface-2/80"
        }
      `}
    >
      <Icon size={iconSize} className={iconClassName} />
      {label}
    </button>
  );
}
