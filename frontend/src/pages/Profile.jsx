import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useMemo } from "react";
import { getLoggedMovies, getWatchlist, fetchMovieDetails } from "../utils/api";
import MovieCarousel from "../components/MovieCarousel";
import EditProfileModal from "../components/EditProfileModal";
import { Popcorn, Ticket, UserCircle, Clapperboard, CalendarDays, UserPen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const useResponsiveSlice = () => {
  const [slice, setSlice] = useState(() => (window.innerWidth <= 768 ? 4 : 6));

  useEffect(() => {
    const onResize = () => setSlice(window.innerWidth <= 768 ? 4 : 6);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return slice;
};

const daysSince = (dateString) => {
  if (!dateString) return null;
  return Math.floor((Date.now() - new Date(dateString)) / 86400000);
};

const StatBox = ({ label, value }) => (
  <div className="rounded-xl border border-white/10 bg-surface/55 px-3 py-2.5">
    <p className="text-[10px] uppercase tracking-[0.14em] text-text-soft">{label}</p>
    <p className="mt-1 font-display text-lg font-semibold text-text-main sm:text-xl">{value ?? "-"}</p>
  </div>
);

const Section = ({
  title,
  icon,
  emptyText,
  emptySub,
  loading,
  movies,
  sliceCount,
  onViewAll,
  forceViewAll = false,
}) => (
  <section className="mb-6 sm:mb-8">
    <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-text-main sm:text-xl">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-text-main">
          {icon}
        </span>
        {title}
      </h2>

      {(forceViewAll || movies.length > sliceCount) && movies.length > 0 && (
        <button
          className="rounded-lg border border-white/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-soft transition hover:bg-white/10 hover:text-text-main"
          onClick={onViewAll}
        >
          View all
        </button>
      )}
    </div>

    {!loading && movies.length === 0 ? (
      <div className="rounded-2xl border border-white/10 bg-surface/50 py-9 text-center shadow-soft">
        <p className="text-base font-semibold text-text-main">{emptyText}</p>
        <p className="mt-1 text-sm text-text-soft">{emptySub}</p>
      </div>
    ) : (
      <MovieCarousel movies={movies} loading={loading} edgePadding={false} />
    )}
  </section>
);

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [watched, setWatched] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const navigate = useNavigate();
  const sliceCount = useResponsiveSlice();

  useEffect(() => {
    if (!user?.username) return;

    setLoading(true);
    Promise.all([
      getLoggedMovies(user.username).then((ids) =>
        Promise.all([...ids].reverse().map(fetchMovieDetails))
      ),
      getWatchlist(user.username).then((ids) =>
        Promise.all(ids.map(fetchMovieDetails))
      ),
    ])
      .then(([watchedDetails, watchlistDetails]) => {
        setWatched(watchedDetails.filter(Boolean));
        setWatchlist(watchlistDetails.filter(Boolean));
      })
      .finally(() => setLoading(false));
  }, [user]);

  const favoriteGenre = useMemo(() => {
    if (!watched.length) return null;

    const genreCount = {};
    watched.forEach((movie) =>
      (movie.genres || []).forEach((genre) => {
        genreCount[genre.name] = (genreCount[genre.name] || 0) + 1;
      })
    );

    return Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0];
  }, [watched]);

  const displayName = user?.name?.trim() || user?.username || "User";

  const handleSaveProfile = async (payload) => {
    setIsSavingProfile(true);
    try {
      await updateProfile(payload);
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (!user) {
    return (
      <div className="px-4 py-12 text-center text-text-soft">
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <div className="min-h-screen px-2.5 pb-8 pt-4 sm:px-6 sm:pb-10 md:pt-5">
      <section className="glass-panel mx-auto w-full max-w-7xl rounded-3xl border border-white/15 p-3.5 sm:p-4.5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-surface-2/70 sm:h-16 sm:w-16">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="avatar"
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : displayName ? (
                  <span className="font-display text-2xl font-bold text-text-main sm:text-3xl">
                    {displayName[0].toUpperCase()}
                  </span>
                ) : (
                  <UserCircle className="text-text-main" size={30} />
                )}
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-text-soft">Profile</p>
                <h1 className="font-display text-lg font-bold text-text-main sm:text-2xl">
                  {displayName}
                </h1>
                <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-text-soft sm:text-xs">
                  <CalendarDays size={12} />
                  {daysSince(user.joined) ?? 0} days active
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-surface/50 px-3 py-2 text-xs font-medium text-text-main transition hover:bg-surface/70"
              >
                <UserPen size={13} />
                Edit Profile
              </button>
              <div className="items-center rounded-xl border border-white/10 bg-surface/50 px-3 py-2 text-xs text-text-soft md:flex hidden">
                <Clapperboard size={14} className="mr-2 text-text-main" />
                Ratings improve recommendations
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-surface/50 px-3 py-2 text-xs font-medium text-text-main sm:hidden"
          >
            <UserPen size={13} />
            Edit Profile
          </button>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatBox label="Watched" value={watched.length} />
            <StatBox label="Watchlist" value={watchlist.length} />
            <StatBox label="Days Active" value={daysSince(user.joined)} />
            <StatBox label="Top Genre" value={favoriteGenre || "—"} />
          </div>
        </div>
      </section>

      <main className="mx-auto mt-4 w-full max-w-7xl sm:mt-5">
        <Section
          title="Watched Movies"
          icon={<Popcorn size={16} />}
          emptyText="No screenings logged yet"
          emptySub="Start watching and log your first movie."
          loading={loading}
          movies={watched}
          sliceCount={sliceCount}
          onViewAll={() => navigate("/watched-movies")}
          forceViewAll={true}
        />

        <Section
          title="Your Watchlist"
          icon={<Ticket size={16} />}
          emptyText="Your watchlist is empty"
          emptySub="Add movies you want to watch next."
          loading={loading}
          movies={watchlist}
          sliceCount={sliceCount}
          onViewAll={() => navigate("/watchlist")}
        />

        <div className="sm:hidden rounded-xl border border-white/10 bg-surface/40 px-3 py-2.5 text-[11px] text-text-soft">
          <span className="mr-1.5 inline-flex align-middle text-text-main">
            <Clapperboard size={14} />
          </span>
          Keep rating consistently to improve recommendation quality.
        </div>
      </main>

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={user}
        onSave={handleSaveProfile}
        isSaving={isSavingProfile}
      />
    </div>
  );
}
