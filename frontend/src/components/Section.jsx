export function Section({ children, className = "" }) {
  return (
    <section className={`relative z-20 py-12 md:py-14 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="glass-panel rounded-3xl px-4 py-6 md:px-6 md:py-8">
          {children}
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({ icon: Icon, children, count }) {
  return (
    <div className="mb-6 md:mb-8">
      <h2 className="mb-2 flex items-center gap-3 font-display text-2xl font-bold text-text-main md:text-3xl">
        {Icon && (
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
            <Icon size={20} />
          </span>
        )}
        {children}
        {typeof count === "number" && (
          <span className="font-normal text-primary/75">({count})</span>
        )}
      </h2>
      <div className="h-1 w-24 rounded-full bg-primary/70" />
    </div>
  );
}
