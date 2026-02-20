import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";

export default function SearchBar({ compact = false }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    navigate(`/discover/search?q=${encodeURIComponent(query.trim())}`);
    setQuery("");
  };

  return (
    <div
      className={`relative w-full ${compact ? "max-w-full" : "max-w-xs sm:max-w-sm md:w-72 lg:w-80"}`}
    >
      <form onSubmit={handleSubmit} autoComplete="off" className="relative">
        <input
          ref={inputRef}
          type="text"
          className="h-11 w-full rounded-xl border border-white/15 bg-surface/75 pl-11 pr-11 text-sm text-text-main placeholder:text-text-soft/80 shadow-soft backdrop-blur-md transition focus:border-primary/60 focus:outline-none"
          placeholder="Search movies, cast, crew..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-soft"
        />

        <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="rounded-lg p-1 text-text-soft hover:bg-white/10 hover:text-text-main"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
