import { useEffect, useState, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "./MovieCard";
import SkeletonCard from "./SkeletonCard";
import SkeletonCarousel from "./SkeletonCarousel";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";

const SKELETON_COUNT = 4;

export default function MovieCarousel({
  fetchMovies,
  movies: staticMovies,
  title,
  icon: Icon,
  loading = false,
  edgePadding = true,
}) {
  const [movies, setMovies] = useState(staticMovies || []);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(!!fetchMovies);
  const [loadingNext, setLoadingNext] = useState(false);
  const pageLockRef = useRef(false);
  const railRef = useRef(null);
  const endRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const sectionRef = useRevealOnScroll();

  const loadMovies = useCallback(
    async (pageNum) => {
      if (!fetchMovies) return;
      pageLockRef.current = true;

      if (pageNum === 1) setInitialLoading(true);
      else setLoadingNext(true);

      try {
        const { results, hasMore: more } = await fetchMovies(pageNum);
        setMovies((prev) => {
          const ids = new Set(prev.map((movie) => movie.id));
          return [...prev, ...results.filter((movie) => !ids.has(movie.id))];
        });
        setHasMore(more);
      } catch (error) {
        console.error("Failed to load movies:", error);
      } finally {
        setInitialLoading(false);
        setLoadingNext(false);
        pageLockRef.current = false;
      }
    },
    [fetchMovies]
  );

  useEffect(() => {
    if (!fetchMovies) return;

    setMovies([]);
    setPage(1);
    setHasMore(true);
    setInitialLoading(true);
    setLoadingNext(false);
  }, [fetchMovies]);

  useEffect(() => {
    if (!fetchMovies) return;
    loadMovies(page);
  }, [page, loadMovies, fetchMovies]);

  const moviesToRender = fetchMovies ? movies : staticMovies || [];

  useEffect(() => {
    if (!fetchMovies || !hasMore || loadingNext || initialLoading) return;

    const node = endRef.current;
    if (!node) return;

    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !pageLockRef.current) {
          pageLockRef.current = true;
          setPage((current) => current + 1);
        }
      },
      {
        root: node.parentElement,
        rootMargin: "180px",
        threshold: 0.1,
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchMovies, hasMore, loadingNext, initialLoading, moviesToRender.length]);

  useEffect(() => {
    const node = railRef.current;
    if (!node) return;

    const updateScrollState = () => {
      setCanScrollLeft(node.scrollLeft > 4);
    };

    updateScrollState();
    node.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      node.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [moviesToRender.length, loadingNext, initialLoading]);

  if (initialLoading || loading) {
    return <SkeletonCarousel title={title} icon={Icon} edgePadding={edgePadding} />;
  }

  const scrollRail = (direction) => {
    if (!railRef.current) return;

    const amount = Math.max(240, Math.floor(railRef.current.clientWidth * 0.75));
    railRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const onRailKeyDown = (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollRail("right");
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollRail("left");
    }
  };

  return (
    <section ref={sectionRef} className="reveal-on-scroll my-6 first:mt-2 md:my-12">
      {title && (
        <div className="mb-3 flex items-center gap-2 px-1 md:mb-4 md:px-2">
          {Icon && (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary md:h-9 md:w-9 md:rounded-xl">
              <Icon size={16} />
            </span>
          )}
          <h2 className="font-display text-lg font-bold tracking-tight text-text-main md:text-3xl">
            {title}
          </h2>
        </div>
      )}

      <div className="relative">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollRail("left")}
            className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-white/20 bg-background/70 p-2 text-text-main backdrop-blur-md transition hover:border-primary/45 hover:text-primary md:block"
            aria-label={`Scroll ${title || "carousel"} left`}
          >
            <ChevronLeft size={18} />
          </button>
        )}
        <button
          type="button"
          onClick={() => scrollRail("right")}
          className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-white/20 bg-background/70 p-2 text-text-main backdrop-blur-md transition hover:border-primary/45 hover:text-primary md:block"
          aria-label={`Scroll ${title || "carousel"} right`}
        >
          <ChevronRight size={18} />
        </button>

        <div
          ref={railRef}
          tabIndex={0}
          onKeyDown={onRailKeyDown}
          className={`scrollbar-hide flex snap-x snap-proximity gap-2.5 overflow-x-auto pb-2 outline-none sm:gap-4 md:gap-5 ${
            edgePadding ? "px-1 md:px-8" : "px-0"
          }`}
          style={{ scrollBehavior: "smooth" }}
          aria-label={title || "Movie carousel"}
        >
          {moviesToRender.map((movie, index) => (
            <div
              key={movie.id}
              className="w-[23vw] min-w-[23vw] max-w-[130px] flex-shrink-0 snap-start sm:w-[30vw] sm:min-w-[30vw] sm:max-w-[220px] md:w-[23vw] md:min-w-[23vw] lg:w-[18vw] lg:min-w-[18vw] xl:w-[15vw] xl:min-w-[15vw]"
            >
              <MovieCard movie={movie} prioritize={index < 4} />
            </div>
          ))}

          {loadingNext &&
            Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="w-[23vw] min-w-[23vw] max-w-[130px] flex-shrink-0 snap-start sm:w-[30vw] sm:min-w-[30vw] sm:max-w-[220px] md:w-[23vw] md:min-w-[23vw] lg:w-[18vw] lg:min-w-[18vw] xl:w-[15vw] xl:min-w-[15vw]"
              >
                <SkeletonCard />
              </div>
            ))}

          {fetchMovies && hasMore && (
            <div
              ref={endRef}
              style={{ width: 1, height: 1, alignSelf: "stretch" }}
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    </section>
  );
}
