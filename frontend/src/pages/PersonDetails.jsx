import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams, useParams } from "react-router-dom";
import { SlidersHorizontal, CalendarDays, Star } from "lucide-react";
import { fetchPersonDetails, fetchPersonCredits } from "../utils/api";
import { LoadingSpinner } from "../components/LoadingSpinner";

const ROLE_TABS = [
  { key: "acting", label: "Actor" },
  { key: "directing", label: "Director" },
  { key: "production", label: "Producer" },
  { key: "writing", label: "Writer" },
  { key: "sound", label: "Sound" },
  { key: "crew", label: "Other Crew" },
];

const SORT_OPTIONS = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "rating", label: "Top Rated" },
  { key: "title", label: "Title A-Z" },
];

function getRoleBucket(role = "", department = "") {
  const value = `${role} ${department}`.toLowerCase();
  if (value.includes("actor") || value.includes("actress") || value.includes("character")) return "acting";
  if (value.includes("director")) return "directing";
  if (value.includes("producer")) return "production";
  if (value.includes("writer") || value.includes("screenplay")) return "writing";
  if (value.includes("sound") || value.includes("composer")) return "sound";
  return "crew";
}

function sortByRecent(items) {
  return [...items].sort((a, b) => {
    const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
    const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
    return dateB - dateA;
  });
}

function getRatingTone(rating) {
  if (rating > 3.5) return "text-cyan-300";
  if (rating > 2) return "text-sky-300";
  return "text-rose-300";
}

function formatDob(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  const suffix =
    day % 10 === 1 && day % 100 !== 11
      ? "st"
      : day % 10 === 2 && day % 100 !== 12
        ? "nd"
        : day % 10 === 3 && day % 100 !== 13
          ? "rd"
          : "th";

  return `${day}${suffix} ${month} ${year}`;
}

export default function PersonDetails() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [person, setPerson] = useState(null);
  const [credits, setCredits] = useState({ cast: [], crew: [] });
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("rating");
  const [bioExpanded, setBioExpanded] = useState(false);

  const requestedRole = searchParams.get("role") || "";

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    Promise.all([fetchPersonDetails(id), fetchPersonCredits(id)])
      .then(([personData, creditsData]) => {
        if (ignore) return;
        setPerson(personData);
        setCredits(creditsData);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  const groupedCredits = useMemo(() => {
    const grouped = {
      acting: [],
      directing: [],
      production: [],
      writing: [],
      sound: [],
      crew: [],
    };

    credits.cast.forEach((item) => {
      grouped.acting.push(item);
    });

    credits.crew.forEach((item) => {
      const key = getRoleBucket(item.role, item.department);
      grouped[key].push(item);
    });

    Object.keys(grouped).forEach((key) => {
      grouped[key] = sortByRecent(grouped[key]);
    });

    return grouped;
  }, [credits]);

  const availableTabs = ROLE_TABS.filter((tab) => groupedCredits[tab.key].length > 0);
  const fallbackTab = availableTabs[0]?.key || "acting";
  const activeTab = availableTabs.find((tab) => tab.key === requestedRole)
    ? requestedRole
    : fallbackTab;

  useEffect(() => {
    if (!loading && activeTab && requestedRole !== activeTab) {
      setSearchParams({ role: activeTab }, { replace: true });
    }
  }, [activeTab, loading, requestedRole, setSearchParams]);

  const activeCredits = useMemo(() => {
    const items = [...(groupedCredits[activeTab] || [])];

    switch (sortBy) {
      case "oldest":
        return items.sort((a, b) => {
          const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
          const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
          return dateA - dateB;
        });
      case "rating":
        return items.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
      case "title":
        return items.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      case "newest":
      default:
        return items.sort((a, b) => {
          const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
          const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
          return dateB - dateA;
        });
    }
  }, [groupedCredits, activeTab, sortBy]);

  const biography = person?.biography?.trim() || "No biography available.";
  const canExpandBio = biography.length > 320;

  if (loading) {
    return <LoadingSpinner message="Loading person details..." />;
  }

  if (!person) {
    return (
      <div className="px-4 py-16 text-center text-text-soft">Unable to load person details.</div>
    );
  }

  return (
    <div className="min-h-screen px-3 pb-8 pt-3 sm:px-6 sm:pb-10 sm:pt-3">
      <main className="mx-auto w-full max-w-7xl">
        <header className="glass-panel mb-3 rounded-2xl p-3 md:mb-6 md:rounded-3xl md:p-5">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-soft">
            Profile
          </p>
          <h1 className="font-display text-lg font-bold leading-tight text-text-main md:text-4xl">{person.name}</h1>
          <p className="mt-1 text-[11px] text-text-soft md:text-sm">
            {person.known_for_department || "Film"}
            {person.birthday ? ` • Born ${formatDob(person.birthday)}` : ""}
            {person.place_of_birth ? ` • ${person.place_of_birth}` : ""}
          </p>
        </header>

        <div className="grid gap-3 md:gap-5 lg:grid-cols-[320px_1fr] lg:items-start">
          <aside className="glass-panel flex items-start gap-3 rounded-2xl p-3 md:rounded-3xl md:p-5 lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <img
              src={person.profile_path || "/no-image.svg"}
              alt={person.name}
              className="aspect-[2/3] w-[104px] flex-shrink-0 rounded-xl object-cover sm:w-[120px] lg:mx-auto lg:w-full lg:max-w-none lg:rounded-2xl"
            />
            <div className="min-w-0">
              <p
                className={`mt-0 text-[11px] leading-relaxed text-text-soft md:text-sm lg:mt-4 ${
                  bioExpanded ? "" : "line-clamp-6"
                }`}
              >
                {biography}
              </p>
              {canExpandBio && (
                <button
                  type="button"
                  onClick={() => setBioExpanded((value) => !value)}
                  className="mt-2 text-xs font-semibold text-sky-300 transition hover:text-sky-200"
                >
                  {bioExpanded ? "View less" : "View more"}
                </button>
              )}
            </div>
          </aside>

          <section className="glass-panel overflow-hidden rounded-2xl md:rounded-3xl lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <div className="border-b border-white/10 px-3 py-3 md:px-5 lg:sticky lg:top-0 lg:z-10 lg:bg-[rgba(20,24,36,0.86)] lg:backdrop-blur-md">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="scrollbar-hide -mx-1 flex gap-1.5 overflow-x-auto px-1 sm:flex-wrap sm:overflow-visible sm:px-0">
                  {availableTabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setSearchParams({ role: tab.key })}
                      className={`whitespace-nowrap rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition ${
                        activeTab === tab.key
                          ? "border-primary/45 bg-primary/15 text-text-main"
                          : "border-white/15 bg-white/5 text-text-soft hover:bg-white/10"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <label className="inline-flex items-center gap-2 text-[11px] text-text-soft">
                  <SlidersHorizontal size={13} />
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="min-w-[124px] rounded-lg border border-white/15 bg-surface/70 px-2.5 py-1.5 text-[11px] font-semibold text-text-main focus:border-primary/60 focus:outline-none"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {activeCredits.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-text-soft">
                No credits available for this role.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 p-2.5 sm:grid-cols-3 sm:gap-3 sm:p-3 md:grid-cols-4 md:p-4 xl:grid-cols-5">
                {activeCredits.map((item) => {
                  const rating = (item.vote_average || 0) / 2;

                  return (
                    <Link
                      key={`${item.id}-${item.role}`}
                      to={`/movies/${item.id}`}
                      className="group overflow-hidden rounded-xl border border-white/10 bg-surface/50 p-1.5 transition hover:border-primary/30 md:rounded-2xl md:p-2"
                    >
                      <img
                        src={
                          item.poster_path
                            ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
                            : "/no-image.svg"
                        }
                        alt={item.title}
                        className="aspect-[2/3] w-full rounded-lg object-cover md:rounded-xl"
                        loading="lazy"
                      />
                      <p className="mt-1.5 line-clamp-1 text-[11px] font-semibold text-text-main group-hover:text-white md:mt-2 md:text-sm">
                        {item.title}
                      </p>
                      <p className="line-clamp-1 text-[10px] text-text-soft md:text-xs">{item.role}</p>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-text-soft md:text-[11px]">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={11} />
                          {item.release_date?.slice(0, 4) || "—"}
                        </span>
                        {rating > 0 && (
                          <span className={`inline-flex items-center gap-1 font-semibold ${getRatingTone(rating)}`}>
                            <Star size={11} fill="currentColor" />
                            {rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
