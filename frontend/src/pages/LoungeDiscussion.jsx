import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MessageSquareMore, Send, CornerDownRight, Trash2 } from "lucide-react";
import {
  addLoungeComment,
  deleteLoungeDiscussion,
  getLoungeDiscussionById,
} from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner } from "../components/LoadingSpinner";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildCommentTree(comments = []) {
  const map = new Map();
  comments.forEach((comment) => {
    const id = String(comment._id);
    map.set(id, { ...comment, _id: id, children: [] });
  });

  const roots = [];
  map.forEach((comment) => {
    const parentId = comment.parent_comment_id ? String(comment.parent_comment_id) : null;
    if (parentId && map.has(parentId)) {
      map.get(parentId).children.push(comment);
    } else {
      roots.push(comment);
    }
  });

  const sortByCreated = (a, b) =>
    new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();

  const sortRecursively = (nodes) => {
    nodes.sort(sortByCreated);
    nodes.forEach((node) => sortRecursively(node.children));
  };

  sortRecursively(roots);
  return roots;
}

function CommentNode({
  node,
  depth,
  user,
  replyTarget,
  setReplyTarget,
  replyDraft,
  setReplyDraft,
  posting,
  onSubmitReply,
}) {
  const isReplying = replyTarget === node._id;
  const leftPad = Math.min(depth * 18, 54);

  return (
    <article
      className="border-l border-white/15 py-2.5 pl-3"
      style={{ marginLeft: `${leftPad}px` }}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-text-main">
          {node.author_name || node.author_username}
        </p>
        <span className="text-[11px] text-text-soft">{formatDate(node.created_at)}</span>
      </div>
      <p className="whitespace-pre-wrap text-sm text-text-main/92">{node.message}</p>

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setReplyTarget(isReplying ? null : node._id)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80"
        >
          <CornerDownRight size={13} />
          {isReplying ? "Cancel" : "Reply"}
        </button>
      </div>

      {isReplying && (
        <form onSubmit={(event) => onSubmitReply(event, node._id)} className="mt-2 border-l border-white/10 pl-2.5">
          <textarea
            rows={2}
            value={replyDraft}
            onChange={(event) => setReplyDraft(event.target.value)}
            placeholder={user ? `Reply to ${node.author_name || node.author_username}` : "Sign in to reply"}
            className="w-full rounded-md border border-white/15 bg-surface/72 px-2.5 py-2 text-sm text-text-main placeholder:text-text-soft/80 focus:border-primary/45 focus:outline-none"
            disabled={!user}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={!user || !replyDraft.trim() || posting}
              className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={12} />
              {posting ? "Posting..." : "Reply"}
            </button>
          </div>
        </form>
      )}

      {node.children.length > 0 && (
        <div className="mt-2 space-y-2">
          {node.children.map((child) => (
            <CommentNode
              key={child._id}
              node={child}
              depth={depth + 1}
              user={user}
              replyTarget={replyTarget}
              setReplyTarget={setReplyTarget}
              replyDraft={replyDraft}
              setReplyDraft={setReplyDraft}
              posting={posting}
              onSubmitReply={onSubmitReply}
            />
          ))}
        </div>
      )}
    </article>
  );
}

export default function LoungeDiscussion() {
  const { discussionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [discussion, setDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [replyDraft, setReplyDraft] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [posting, setPosting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");
    getLoungeDiscussionById(discussionId)
      .then((data) => {
        if (!ignore) setDiscussion(data);
      })
      .catch((err) => {
        if (!ignore) setError(err.message || "Failed to load discussion");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [discussionId]);

  const participantsCount = useMemo(() => {
    return (discussion?.participants || []).length;
  }, [discussion]);

  const isCreator = useMemo(() => {
    if (!user || !discussion) return false;
    return user.username === discussion.created_by_username;
  }, [discussion, user]);

  const commentTree = useMemo(
    () => buildCommentTree(discussion?.comments || []),
    [discussion?.comments]
  );

  const postComment = async (message, parentId = null) => {
    const updated = await addLoungeComment(discussionId, message.trim(), parentId);
    if (updated) {
      setDiscussion(updated);
    }
  };

  const handleSubmitComment = async (event) => {
    event.preventDefault();
    if (!comment.trim() || !user) return;
    setPosting(true);
    setError("");
    try {
      await postComment(comment);
      setComment("");
    } catch (err) {
      setError(err.message || "Unable to post comment");
    } finally {
      setPosting(false);
    }
  };

  const handleSubmitReply = async (event, parentId) => {
    event.preventDefault();
    if (!replyDraft.trim() || !user) return;
    setPosting(true);
    setError("");
    try {
      await postComment(replyDraft, parentId);
      setReplyDraft("");
      setReplyTarget(null);
    } catch (err) {
      setError(err.message || "Unable to post reply");
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteDiscussion = async () => {
    if (!discussion?._id || !isCreator || isDeleting) return;
    const confirmed = window.confirm(
      "Delete this discussion permanently? This cannot be undone."
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setError("");
    try {
      await deleteLoungeDiscussion(discussion._id);
      navigate("/community/lounge");
    } catch (err) {
      setError(err.message || "Failed to delete discussion");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading discussion..." />;
  }

  if (!discussion) {
    return (
      <div className="px-4 py-10 text-center text-text-soft">
        Discussion not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen px-3 pb-8 pt-4 sm:px-6 md:pt-5">
      <main className="mx-auto w-full max-w-7xl">
        <Link
          to="/community/lounge"
          className="mb-3 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-surface/55 px-3 py-1.5 text-xs font-semibold text-text-soft transition hover:text-text-main"
        >
          <ArrowLeft size={14} />
          Back to Lounge
        </Link>

        <section className="border-b border-white/12 pb-4 md:pb-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
            {discussion.cinema_name}
          </p>
          <h1 className="font-display text-2xl font-bold text-text-main md:text-4xl">
            {discussion.title}
          </h1>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-text-main/92 md:text-base">
            {discussion.body}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-text-soft">
            <div className="flex flex-wrap items-center gap-2">
              <span>by {discussion.created_by_name || discussion.created_by_username}</span>
              <span>•</span>
              <span>{formatDate(discussion.created_at)}</span>
              <span>•</span>
              <span>{participantsCount} participants</span>
              <span>•</span>
              <span>{discussion.comments_count || 0} replies</span>
            </div>
            {isCreator && (
              <button
                type="button"
                onClick={handleDeleteDiscussion}
                disabled={isDeleting}
                className="inline-flex items-center gap-1 rounded-md border border-red-400/35 bg-red-500/10 px-2 py-1 text-[11px] font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={12} />
                {isDeleting ? "Deleting..." : "Delete Discussion"}
              </button>
            )}
          </div>
          {(discussion.tags || []).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {discussion.tags.map((tag) => (
                <span
                  key={`${discussion._id}-${tag}`}
                  className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] text-text-soft"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="mt-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
              <MessageSquareMore size={16} />
            </span>
            <h2 className="font-display text-xl font-semibold text-text-main">Discussion</h2>
          </div>

          <form onSubmit={handleSubmitComment} className="mb-4">
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={3}
              placeholder={user ? "Add your take..." : "Sign in to participate in this discussion"}
              className="w-full rounded-xl border border-white/15 bg-surface/70 px-3 py-2.5 text-sm text-text-main placeholder:text-text-soft/80 focus:border-primary/45 focus:outline-none"
              disabled={!user}
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={!user || !comment.trim() || posting}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={14} />
                {posting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </form>

          {error && (
            <p className="mb-3 rounded-lg border border-red-300/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}

          <div className="space-y-1.5 border-t border-white/10 pt-2">
            {(discussion.comments || []).length === 0 ? (
              <div className="py-4 text-center text-sm text-text-soft">
                No replies yet. Start the discussion.
              </div>
            ) : (
              commentTree.map((item) => (
                <CommentNode
                  key={item._id}
                  node={item}
                  depth={0}
                  user={user}
                  replyTarget={replyTarget}
                  setReplyTarget={setReplyTarget}
                  replyDraft={replyDraft}
                  setReplyDraft={setReplyDraft}
                  posting={posting}
                  onSubmitReply={handleSubmitReply}
                />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
