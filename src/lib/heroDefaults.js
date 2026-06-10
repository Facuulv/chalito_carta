export const DEFAULT_HERO_IMAGES = [
  { src: "/hero-hamburguesa-cheeseburger.png", alt: "Hamburguesa Cheeseburger", focalX: 50, focalY: 50, zoom: 1 },
  { src: "/hero-lomo.png", alt: "Lomo", focalX: 50, focalY: 50, zoom: 1 },
  { src: "/hero-empanada-carne.png", alt: "Empanada de Carne", focalX: 50, focalY: 50, zoom: 1 },
  { src: "/hero-papas-tastycream.png", alt: "Papas Tastycream", focalX: 50, focalY: 50, zoom: 1 },
  { src: "/hero-vacio.png", alt: "Vacío", focalX: 50, focalY: 50, zoom: 1 },
];

export function resolveHeroImages(carousel) {
  if (!carousel || carousel.enabled === false) {
    return DEFAULT_HERO_IMAGES;
  }

  const slides = Array.isArray(carousel.slides) ? carousel.slides : [];
  if (slides.length === 0) {
    return DEFAULT_HERO_IMAGES;
  }

  return slides.map((slide, index) => ({
    src: slide.src || slide.url,
    alt: slide.alt || `Slide ${index + 1}`,
    focalX: slide.focalX ?? 50,
    focalY: slide.focalY ?? 50,
    zoom: slide.zoom ?? 1,
  }));
}
