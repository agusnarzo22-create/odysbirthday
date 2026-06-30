/**
 * Helper to get the correct asset URL considering Vite's base path configuration.
 * Useful for static assets located in the public/ directory.
 */
export const getAssetUrl = (path) => {
  if (!path) return '';
  // Return early if the path is already an absolute URL or data/blob URI
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  const base = import.meta.env.BASE_URL || '/';
  // Remove leading slash from the path if present to avoid double slash
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${base}${cleanPath}`;
};
