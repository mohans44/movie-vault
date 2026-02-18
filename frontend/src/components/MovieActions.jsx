import { Play, Edit3, Heart, LogOut, Share2, Check, Loader2 } from "lucide-react";
import ActionButton from "./ActionButton";

export function MovieActions({
  isLogged,
  isInWatchlist,
  onLogMovie,
  onWatchlistAction,
  onShare,
  watchlistLoading,
  shareSuccess,
  watchlistFeedback,
  compactMobile = false,
}) {
  const watchlistLabel = watchlistLoading
    ? "Updating..."
    : watchlistFeedback === "added"
      ? "Added to Watchlist"
      : watchlistFeedback === "removed"
        ? "Removed from Watchlist"
        : isInWatchlist
          ? "Remove from Watchlist"
          : "Add to Watchlist";

  const WatchlistIcon =
    watchlistLoading ? Loader2 : watchlistFeedback === "added" ? Check : isInWatchlist ? LogOut : Heart;
  const logLabel = compactMobile ? (isLogged ? "Edit" : "Log") : isLogged ? "Edit Log" : "Log Movie";
  const compactWatchlistLabel = watchlistLoading
    ? "Updating"
    : watchlistFeedback === "added"
      ? "Added"
      : watchlistFeedback === "removed"
        ? "Removed"
        : isInWatchlist
          ? "Remove"
          : "Watchlist";
  const shareLabel = compactMobile ? (shareSuccess ? "Copied" : "Share") : shareSuccess ? "Copied!" : "Share";

  return (
    <div
      className={`flex items-center ${
        compactMobile
          ? "flex-nowrap gap-2 overflow-x-auto scrollbar-hide"
          : "flex-wrap gap-3 pt-4"
      }`}
    >
      <ActionButton
        icon={isLogged ? Edit3 : Play}
        label={logLabel}
        primary={true}
        onClick={onLogMovie}
        disabled={false}
        compact={compactMobile}
      />
      {!isLogged && (
        <ActionButton
          icon={WatchlistIcon}
          label={compactMobile ? compactWatchlistLabel : watchlistLabel}
          onClick={onWatchlistAction}
          disabled={watchlistLoading}
          iconClassName={watchlistLoading ? "animate-spin" : ""}
          emphasize={watchlistFeedback === "added" || watchlistFeedback === "removed"}
          compact={compactMobile}
        />
      )}
      <ActionButton
        icon={shareSuccess ? Check : Share2}
        label={shareLabel}
        onClick={onShare}
        compact={compactMobile}
      />
    </div>
  );
}
