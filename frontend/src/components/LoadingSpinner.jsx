export function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/70 backdrop-blur-md">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-surface/70 px-7 py-8 shadow-card">
        <div className="h-14 w-14 rounded-full border-4 border-accent/25 border-t-accent animate-spin" />
        <div className="h-2.5 w-16 rounded-full bg-white/10" />
        <p className="text-sm font-medium text-text-soft">{message}</p>
      </div>
    </div>
  );
}
