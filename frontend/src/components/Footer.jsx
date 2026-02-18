import tmdbLogo from "../assets/tmdbLogo.svg";

export default function Footer({ className = "" }) {
  return (
    <footer
      className={`border-t border-white/10 bg-background/35 px-4 py-4 backdrop-blur-xl ${className}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 text-[11px] text-text-soft md:text-xs">
        <span>&copy; {new Date().getFullYear()} Flick Deck</span>
        <span className="text-text-mute">•</span>
        <span className="md:hidden">TMDB</span>
        <span className="hidden md:inline">Powered by TMDB</span>
        <img src={tmdbLogo} alt="TMDB Logo" className="h-4 w-auto opacity-85" />
        <span className="hidden text-text-mute md:inline">•</span>
        <span className="hidden md:inline">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </span>
      </div>
    </footer>
  );
}
