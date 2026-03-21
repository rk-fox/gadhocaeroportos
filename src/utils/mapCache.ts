import { Aerodromo } from './aerodromeService';

const preloadedMaps: Record<number, string> = {};

/**
 * Pre-loads a Google Map static image into the browser's memory cache.
 * This ensures that subsequent renders do not trigger new API requests,
 * saving API quota and drastically improving UI fluidity.
 */
export const preloadMapImage = (aerodromo: Aerodromo, apiKey: string): string => {
  if (preloadedMaps[aerodromo.id]) {
    return preloadedMaps[aerodromo.id];
  }

  const url = `https://maps.googleapis.com/maps/api/staticmap?center=${aerodromo.latitude},${aerodromo.longitude}&zoom=${aerodromo.zoom || 15}&size=640x640&scale=2&maptype=satellite&key=${apiKey}`;
  
  // Create an in-memory image to force browser caching
  const img = new Image();
  img.src = url;
  
  preloadedMaps[aerodromo.id] = url;
  return url;
};

/**
 * Retrieves the cached map URL for a given aerodrome.
 * If not cached, it triggers the caching process.
 */
export const getMapImageUrl = (aerodromo: Aerodromo | undefined | null): string => {
  if (!aerodromo) return '';
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
  if (!apiKey) return '';
  return preloadMapImage(aerodromo, apiKey);
};
