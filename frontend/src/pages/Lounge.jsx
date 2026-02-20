import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquareMore, Search, Flame, Clock3, Plus, Users } from "lucide-react";
import { createLoungeDiscussion, getLoungeDiscussions } from "../utils/api";
import { useAuth } from "../context/AuthContext";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function normalizeTags(value) {
  return String(value || "")
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);
}

export default function Lounge() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    cinema_name: "",
    body: "",
    tagsRaw: "",
  });

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");
    getLoungeDiscussions({ query, sort, limit: 36 })
      .then((items) => {
        if (!ignore) setDiscussions(items || []);
      })
      .catch((err) => {
        if (!ignore) setError(err.message || "Failed to load lounge discussions");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [query, sort]);

  const canSubmit = useMemo(() => {
    return Boolean(form.title.trim() && form.cinema_name.trim() && form.body.trim());
  }, [form]);

  const handleCreateDiscussion = async (event) => {
    event.preventDefault();
    if (!canSubmit || !user) return;
    setSubmitting(true);
    setError("");
    try {
      const created = await createLoungeDiscussion({
        title: form.title.trim(),
        cinema_name: form.cinema_name.trim(),
        body: form.body.trim(),
        tags: normalizeTags(form.tagsRaw),
      });
      if (created) {
        setDiscussions((prev) => [created, ...prev]);
        setForm({ title: "", cinema_name: "", body: "", tagsRaw: "" });
        setComposerOpen(false);
      }
    } catch (err) {
      setError(err.message || "Unable to create discussion");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen px-2.5 pb-8 pt-4 sm:px-6 md:pt-5">
      <main className="mx-auto w-full max-w-7xl">
        <section className="mb-5 border-b border-white/12 pb-4 md:pb-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                <MessageSquareMore size={12} />
                Lounge
              </p>
              <h1 className="font-display text-2xl font-bold text-text-main md:text-4xl">
                Cinema Discussions
              </h1>
              <p className="mt-1 text-xs text-text-soft md:text-sm">
                Start focused film threads and debate with the community.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setComposerOpen((prev) => !prev)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/35 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
            >
              <Plus size={16} />
              New Discussion
            </button>
          </div>

          {composerOpen && (
            <form onSubmit={handleCreateDiscussion} className="mt-4 grid gap-2.5 border-t border-white/10 pt-4 md:grid-cols-2">
              <input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Discussion title"
                className="h-11 rounded-xl border border-white/15 bg-surface/72 px-3 text-sm text-text-main placeholder:text-text-soft/70 focus:border-primary/45 focus:outline-none"
              />
              <input
                value={form.cinema_name}
                onChange={(event) => setForm((prev) => ({ ...prev, cinema_name: event.target.value }))}
                placeholder="Cinema / movie name"
                className="h-11 rounded-xl border border-white/15 bg-surface/72 px-3 text-sm text-text-main placeholder:text-text-soft/70 focus:border-primary/45 focus:outline-none"
              />
              <textarea
                value={form.body}
                onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
                placeholder="What should people discuss?"
                rows={4}
                className="rounded-xl border border-white/15 bg-surface/72 px-3 py-2.5 text-sm text-text-main placeholder:text-text-soft/70 focus:border-primary/45 focus:outline-none md:col-span-2"
              />
              <input
                value={form.tagsRaw}
                onChange={(event) => setForm((prev) => ({ ...prev, tagsRaw: event.target.value }))}
                placeholder="Tags (comma separated)"
                className="h-11 rounded-xl border border-white/15 bg-surface/72 px-3 text-sm text-text-main placeholder:text-text-soft/70 focus:border-primary/45 focus:outline-none md:col-span-2"
              />
              <div className="md:col-span-2 flex items-center justify-between gap-2">
                <p className="text-[11px] text-text-soft">Be specific: scene analysis, direction, soundtrack, writing.</p>
                <button
                  type="submit"
                  disabled={!canSubmit || submitting || !user}
                  className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {submitting ? "Posting..." : user ? "Publish Thread" : "Sign in to post"}
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="mb-4 flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
          <label className="relative w-full md:max-w-md">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-soft" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search discussions by title, cinema, or topic"
              className="h-11 w-full rounded-xl border border-white/15 bg-surface/72 pl-10 pr-3 text-sm text-text-main placeholder:text-text-soft/80 focus:border-primary/45 focus:outline-none"
            />
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSort("recent")}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                sort === "recent"
                  ? "border-primary/35 bg-primary/10 text-primary"
                  : "border-white/15 bg-surface/60 text-text-soft hover:text-text-main"
              }`}
            >
              <Clock3 size={14} />
              Recent
            </button>
            <button
              type="button"
              onClick={() => setSort("popular")}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                sort === "popular"
                  ? "border-primary/35 bg-primary/10 text-primary"
                  : "border-white/15 bg-surface/60 text-text-soft hover:text-text-main"
              }`}
            >
              <Flame size={14} />
              Popular
            </button>
          </div>
        </section>

        {error && (
          <p className="mb-3 rounded-xl border border-red-300/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}

        {loading ? (
          <div className="divide-y divide-white/10 border-y border-white/10">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse py-4">
                <div className="mb-2 h-4 w-1/3 rounded bg-surface-2/60" />
                <div className="mb-1.5 h-5 w-2/3 rounded bg-surface-2/60" />
                <div className="h-3 w-full rounded bg-surface-2/60" />
              </div>
            ))}
          </div>
        ) : discussions.length === 0 ? (
          <div className="border-y border-white/10 py-10 text-center text-text-soft">
            <p className="text-base font-semibold text-text-main">No discussions found</p>
            <p className="mt-1 text-sm">Start the first thread in Lounge.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10 border-y border-white/10">
            {discussions.map((discussion) => (
              <Link
                key={discussion._id}
                to={`/community/lounge/${discussion._id}`}
                className="group block py-4 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                      {discussion.cinema_name}
                    </p>
                    <h2 className="line-clamp-2 font-display text-xl font-semibold text-text-main group-hover:text-primary">
                      {discussion.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm text-text-soft">
                      {discussion.body_preview || discussion.body}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-soft">
                      <span>by {discussion.created_by_name || discussion.created_by_username}</span>
                      <span>{formatDate(discussion.created_at)}</span>
                      <span className="inline-flex items-center gap-1">
                        <MessageSquareMore size={14} />
                        {discussion.comments_count || 0}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users size={14} />
                        {(discussion.participants || []).length}
                      </span>
                    </div>
                  </div>
                </div>
                {(discussion.tags || []).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {discussion.tags.slice(0, 4).map((tag) => (
                      <span
                        key={`${discussion._id}-${tag}`}
                        className="text-[11px] text-text-soft"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
