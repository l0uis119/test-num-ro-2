/**
 * Central configuration. To use the real product shots, drop your two images
 * into `public/images/` and point `jeanFront` / `jeanBack` at them.
 */
export const IMAGES = {
  // → Replace these two with your front/back product shots.
  jeanFront: "/images/jean-front.jpg",
  jeanBack: "/images/jean-back.jpg",
  // Real mountain / climbing photography (Unsplash, free license).
  heroBg: "/images/bg-cliff.jpg",
  range: "/images/bg-range.jpg",
  summit: "/images/bg-summit.jpg",
  dusk: "/images/bg-valley.jpg",
  rack: "/images/look-rack.jpg",
};

export const PRODUCT = {
  name: "Pantalon Monolith",
  colorway: "Bleu Profond",
  price: "140 €",
  sizes: ["S", "M", "L", "XL", "XXL"] as const,
};
