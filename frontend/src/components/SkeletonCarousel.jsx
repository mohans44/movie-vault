import SkeletonCard from "./SkeletonCard";

export default function SkeletonCarousel({ title = "", icon: Icon, edgePadding = true }) {
  return (
    <section className="my-6 md:my-12">
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
      <div
        className={`flex gap-2.5 overflow-x-auto pb-2 sm:gap-4 md:gap-5 ${
          edgePadding ? "px-1 md:px-8" : "px-0"
        }`}
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="w-[23vw] min-w-[23vw] max-w-[130px] flex-shrink-0 sm:w-[30vw] sm:min-w-[30vw] sm:max-w-[220px] md:w-[23vw] md:min-w-[23vw] lg:w-[18vw] lg:min-w-[18vw] xl:w-[15vw] xl:min-w-[15vw]"
          >
            <SkeletonCard />
          </div>
        ))}
      </div>
    </section>
  );
}
