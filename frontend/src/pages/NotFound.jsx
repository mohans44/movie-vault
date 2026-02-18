import { Link } from "react-router-dom";
import { Film } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen px-4 py-10 sm:px-6">
      <main className="mx-auto flex min-h-[72vh] w-full max-w-3xl items-center justify-center">
        <div className="w-full rounded-3xl border border-white/15 p-8 text-center glass-panel shadow-card">
          <div className="mb-4 flex flex-col items-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/35 bg-primary/10 text-primary">
              <Film size={24} />
            </div>
            <h1 className="font-display text-6xl font-bold text-primary">404</h1>
          </div>

          <p className="text-xl font-semibold text-text-main">Page not found</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-soft">
            This page is missing from the vault. Head back home and discover something worth watching.
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex rounded-xl border border-primary/45 bg-primary/85 px-6 py-2.5 text-sm font-semibold text-background shadow-glow"
          >
            Go Home
          </Link>
        </div>
      </main>
    </div>
  );
}
