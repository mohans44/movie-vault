import { Star } from "lucide-react";

function getStarType(stars, i) {
  if (stars >= i) return "full";
  if (stars >= i - 0.5) return "half";
  return "empty";
}

function getRatingPalette(value) {
  if (value > 3.5) {
    return {
      active: "text-cyan-300 fill-cyan-300",
      badge: "text-cyan-100 bg-cyan-500/25",
    };
  }
  if (value > 2) {
    return {
      active: "text-sky-300 fill-sky-300",
      badge: "text-sky-100 bg-sky-500/25",
    };
  }
  return {
    active: "text-rose-300 fill-rose-300",
    badge: "text-rose-100 bg-rose-500/25",
  };
}

export default function StarRating({ value, size = 18, showText = true }) {
  const stars = Math.round((Number(value) || 0) * 2) / 2;
  const rating = value ? Number(value).toFixed(1) : "N/A";
  const palette = getRatingPalette(stars);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => {
            const type = getStarType(stars, i);
            if (type === "full") {
              return (
                <Star
                  key={i}
                  className={`${palette.active} drop-shadow-sm`}
                  size={size}
                />
              );
            }
            if (type === "half") {
              return (
                <span
                  key={i}
                  style={{
                    position: "relative",
                    display: "inline-block",
                    width: size,
                    height: size,
                  }}
                >
                  <Star
                    className={`${palette.active} drop-shadow-sm`}
                    size={size}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: size,
                      height: size,
                      clipPath: "inset(0 50% 0 0)",
                    }}
                  />
                  <Star
                    className="text-gray-500"
                    size={size}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: size,
                      height: size,
                      clipPath: "inset(0 0 0 50%)",
                    }}
                  />
                </span>
              );
            }
            return <Star key={i} className="text-gray-500" size={size} />;
          })}
        </span>
        {showText && (
          <span
            className={`rounded-full px-2 py-0.5 text-sm font-semibold backdrop-blur-sm ${palette.badge}`}
          >
            {rating}
          </span>
        )}
      </div>
    </div>
  );
}
