import { useState } from "react";
import { Star } from "lucide-react";

function getHoverValue(event, star) {
  const { left, width } = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - left;
  return x < width / 2 ? star - 0.5 : star;
}

function getToneClass(value) {
  if (value > 3.5) return "text-cyan-300 fill-cyan-300";
  if (value > 2) return "text-sky-300 fill-sky-300";
  return "text-rose-300 fill-rose-300";
}

export default function InteractiveStarRating({
  rating,
  onRatingChange,
  size = 24,
}) {
  const [hovered, setHovered] = useState(null);
  const value = hovered !== null ? hovered : rating;
  const activeTone = getToneClass(value);

  const getStarType = (star) => {
    if (value >= star) return "full";
    if (value >= star - 0.5) return "half";
    return "empty";
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const type = getStarType(star);

        return (
          <button
            key={star}
            type="button"
            className="relative rounded-md p-0.5 transition-transform duration-150 hover:scale-110"
            onMouseMove={(event) => setHovered(getHoverValue(event, star))}
            onMouseLeave={() => setHovered(null)}
            onClick={(event) => onRatingChange(getHoverValue(event, star))}
            style={{ lineHeight: 0 }}
            aria-label={`Rate ${star} stars`}
          >
            {type === "full" && <Star size={size} className={activeTone} />}

            {type === "half" && (
              <span className="relative block" style={{ width: size, height: size }}>
                <Star
                  size={size}
                  className={activeTone}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    clipPath: "inset(0 50% 0 0)",
                  }}
                />
                <Star
                  size={size}
                  className="text-gray-500"
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    clipPath: "inset(0 0 0 50%)",
                  }}
                />
              </span>
            )}

            {type === "empty" && <Star size={size} className="text-gray-500" />}
          </button>
        );
      })}
    </div>
  );
}
