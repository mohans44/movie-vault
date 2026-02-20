import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UserCircle, LogOut, Star, MessageSquareMore } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import SearchBar from "./SearchBar";

function useCloseOnOutside(open, setOpen) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [open, setOpen]);

  return ref;
}

function ProfileDropdown({ open, setOpen, onProfile, onLogout }) {
  const location = useLocation();
  const ref = useCloseOnOutside(open, setOpen);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-14 w-56 rounded-2xl border border-white/25 bg-[rgba(18,22,34,0.88)] p-2 shadow-card backdrop-blur-2xl animate-fade-in-up"
    >
      <button
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-text-main hover:bg-white/12"
        onClick={() => {
          setOpen(false);
          onProfile();
        }}
      >
        <UserCircle size={17} className="text-accent" />
        Profile
      </button>
      <Link
        to="/account/watchlist"
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-text-main hover:bg-white/12"
        onClick={() => setOpen(false)}
      >
        <Star size={17} className="text-accent" />
        Watchlist
      </Link>
      <Link
        to="/community/lounge"
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-text-main hover:bg-white/12"
        onClick={() => setOpen(false)}
      >
        <MessageSquareMore size={17} className="text-accent" />
        Lounge
      </Link>
      <button
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-200 hover:bg-red-500/18"
        onClick={() => {
          setOpen(false);
          onLogout();
        }}
      >
        <LogOut size={17} />
        Logout
      </button>
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
    setProfileOpen(false);
  }, [logout, navigate]);

  const handleProfile = useCallback(() => {
    navigate("/account/profile");
    setProfileOpen(false);
  }, [navigate]);

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5">
        <div className="relative mx-auto w-full max-w-7xl">
          <div
            className={`glass-pill relative flex h-14 items-center justify-between rounded-2xl px-4 sm:h-16 sm:rounded-full sm:px-6 transition-all duration-300 ${
              scrolled ? "shadow-card" : ""
            }`}
          >
            <Link
              to="/"
              className="inline-flex items-center text-base font-bold font-display tracking-tight text-text-main sm:text-lg"
              aria-label="Flick Deck Home"
            >
              <span className="sm:hidden">FD</span>
              <span className="hidden sm:inline">Flick Deck</span>
            </Link>

            <div className="hidden items-center gap-3 md:flex">
              <Link
                to="/community/lounge"
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-text-main transition hover:border-white/30 hover:bg-white/10"
              >
                Lounge
              </Link>
              <SearchBar />
              {!user ? (
                <Link
                  to="/login"
                  className="rounded-full border border-white/25 bg-white/15 px-5 py-2 text-sm font-semibold text-text-main transition hover:bg-white/20"
                >
                  Sign In
                </Link>
              ) : (
                <div className="relative">
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-text-main transition hover:border-white/40"
                    onClick={() => setProfileOpen((prev) => !prev)}
                    aria-label="Open profile menu"
                  >
                    {user?.username ? (
                      <span className="text-sm font-bold uppercase">
                        {user.username[0]}
                      </span>
                    ) : (
                      <UserCircle size={18} />
                    )}
                  </button>
                  <ProfileDropdown
                    open={profileOpen}
                    setOpen={setProfileOpen}
                    onProfile={handleProfile}
                    onLogout={handleLogout}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <div className="min-w-0 flex-1">
                <SearchBar compact={true} />
              </div>
              <Link
                to="/community/lounge"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-primary"
                aria-label="Open Lounge"
              >
                <MessageSquareMore size={16} />
              </Link>
              <button
                onClick={() => (user ? navigate("/account/profile") : navigate("/login"))}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-text-main"
                aria-label={user ? "Open Profile" : "Open Sign In"}
              >
                {user?.username ? (
                  <span className="text-xs font-bold uppercase">{user.username[0]}</span>
                ) : (
                  <UserCircle size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="h-16 sm:h-20" />
    </>
  );
}
