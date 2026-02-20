import { Clapperboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";

function mapRoleToQuery(role = "") {
  const value = role.toLowerCase();
  if (value.includes("director")) return "directing";
  if (value.includes("producer")) return "production";
  if (value.includes("writer") || value.includes("screenplay")) return "writing";
  if (value.includes("composer") || value.includes("sound")) return "sound";
  return "crew";
}

export function CrewSection({ crew }) {
  const navigate = useNavigate();
  const sectionRef = useRevealOnScroll();

  if (!crew?.length) return null;

  return (
    <section ref={sectionRef} className="reveal-on-scroll relative z-20 py-2 md:py-6">
      <div className="mx-auto max-w-7xl px-2.5 sm:px-6">
        <h2 className="mb-2 flex items-center gap-2 font-display text-xl font-bold text-text-main md:mb-3 md:text-3xl">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
            <Clapperboard size={18} />
          </span>
          Crew
        </h2>

        <div className="scrollbar-hide flex snap-x snap-proximity gap-1.5 overflow-x-auto pb-1 sm:gap-2">
          {crew.map((person) => (
            <button
              key={`${person.id}-${person.role}`}
              type="button"
              onClick={() => navigate(`/people/${person.id}?role=${mapRoleToQuery(person.role)}`)}
              className="group w-[96px] min-w-[96px] snap-start text-center transition sm:w-[124px] sm:min-w-[124px] md:w-[196px] md:min-w-[196px] lg:w-[220px] lg:min-w-[220px]"
            >
              <img
                src={person.profile_path || "/no-image.svg"}
                alt={person.name}
                className="mx-auto h-12 w-12 rounded-full object-cover ring-1 ring-white/15 md:h-24 md:w-24 lg:h-28 lg:w-28"
                loading="lazy"
              />
              <p className="mt-1 hidden line-clamp-2 text-[10px] font-semibold text-text-main group-hover:text-white md:block md:text-sm">
                {person.role}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-text-soft md:mt-0 md:text-xs">{person.name}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
