import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";

export function CastSection({ cast }) {
  const navigate = useNavigate();
  const sectionRef = useRevealOnScroll();

  if (!cast?.length) return null;

  return (
    <section ref={sectionRef} className="reveal-on-scroll relative z-20 py-2 md:py-6">
      <div className="mx-auto max-w-7xl px-2.5 sm:px-6">
        <h2 className="mb-2 flex items-center gap-2 font-display text-xl font-bold text-text-main md:mb-3 md:text-3xl">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
            <Users size={18} />
          </span>
          Cast
        </h2>

        <div className="scrollbar-hide flex snap-x snap-proximity gap-1.5 overflow-x-auto pb-1 sm:gap-2">
          {cast.map((actor) => (
            <button
              key={actor.id}
              type="button"
              onClick={() => navigate(`/person/${actor.id}?role=acting`)}
              className="group w-[96px] min-w-[96px] snap-start text-center transition sm:w-[118px] sm:min-w-[118px] md:w-[184px] md:min-w-[184px] lg:w-[204px] lg:min-w-[204px]"
            >
              <img
                src={actor.profile_path || "/no-image.svg"}
                alt={actor.name}
                className="mx-auto h-12 w-12 rounded-full object-cover ring-1 ring-white/15 md:h-24 md:w-24 lg:h-28 lg:w-28"
                loading="lazy"
              />
              <p className="mt-1 line-clamp-1 text-[11px] font-semibold text-text-main group-hover:text-white md:text-sm">
                {actor.name}
              </p>
              <p className="line-clamp-2 text-[10px] text-text-soft md:text-xs">{actor.character}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
