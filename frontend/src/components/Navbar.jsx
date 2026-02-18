import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, UserCircle, LogOut, Star, Compass } from "lucide-react";
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
        to="/watchlist"
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-text-main hover:bg-white/12"
        onClick={() => setOpen(false)}
      >
        <Star size={17} className="text-accent" />
        Watchlist
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

function MobileMenu({ open, setOpen, user, onProfile, onLogout }) {
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="absolute inset-x-3 top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-white/10 glass-panel p-4 shadow-card animate-fade-in-up">
        <div className="mb-5 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center text-lg font-bold font-display tracking-tight text-text-main"
            onClick={() => setOpen(false)}
          >
            Flick Deck
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="rounded-xl border border-white/15 p-2 text-text-soft hover:text-text-main"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-medium text-text-main hover:bg-white/10"
            onClick={() => setOpen(false)}
          >
            <Compass size={16} className="text-cta" />
            Discover
          </Link>
          {user ? (
            <>
              <button
                onClick={() => {
                  setOpen(false);
                  onProfile();
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-medium text-text-main hover:bg-white/10"
              >
                <UserCircle size={16} className="text-cta" />
                Profile
              </button>
              <Link
                to="/watchlist"
                className="flex items-center gap-3 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-medium text-text-main hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                <Star size={16} className="text-cta" />
                Watchlist
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-sm font-medium text-red-200 hover:bg-red-500/20"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="block rounded-xl border border-white/25 bg-white/15 px-4 py-3 text-center text-sm font-semibold text-text-main"
              onClick={() => setOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/auth");
    setMobileOpen(false);
    setProfileOpen(false);
  }, [logout, navigate]);

  const handleProfile = useCallback(() => {
    navigate("/profile");
    setMobileOpen(false);
    setProfileOpen(false);
  }, [navigate]);

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5">
        <div className="relative mx-auto w-full max-w-7xl">
          <div
            className={`glass-pill relative flex h-14 items-center justify-between rounded-full px-4 sm:h-16 sm:px-6 transition-all duration-300 ${
              scrolled ? "shadow-card" : ""
            }`}
          >
            <Link
              to="/"
              className="inline-flex items-center text-lg font-bold font-display tracking-tight text-text-main"
              aria-label="Flick Deck Home"
            >
              Flick Deck
            </Link>

            <div className="hidden items-center gap-3 md:flex">
              <SearchBar />
              {!user ? (
                <Link
                  to="/auth"
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

            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-full border border-white/20 p-2 text-text-main md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu
        open={mobileOpen}
        setOpen={setMobileOpen}
        user={user}
        onProfile={handleProfile}
        onLogout={handleLogout}
      />

      <div className="h-16 sm:h-20" />
    </>
  );
}
