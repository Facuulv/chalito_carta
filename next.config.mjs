/** @type {import('next').NextConfig} */

const STATIC_IMAGE_HOSTS = [
  'files.elchalito.com',
  'res.cloudinary.com',
  'images.unsplash.com',
  'www.elchalito.com',
  'www.gestionelchalito.com',
  'elchalito.com',
  'gestionelchalito.com',
  'chalito-carta.vercel.app',
  'chalito-beta.vercel.app',
];

const extraHosts = (process.env.NEXT_PUBLIC_IMAGE_HOSTS || '')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean);

const allHosts = [...new Set([...STATIC_IMAGE_HOSTS, ...extraHosts])];

/** @type {import('next').NextConfig['images']['remotePatterns']} */
const remotePatterns = allHosts.map((hostname) => ({
  protocol: 'https',
  hostname,
  pathname: '/**',
}));

if (process.env.NODE_ENV === 'development') {
  remotePatterns.push(
    { protocol: 'http', hostname: 'localhost', pathname: '/**' },
    { protocol: 'http', hostname: '127.0.0.1', pathname: '/**' }
  );

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (apiBase) {
    try {
      const parsed = new URL(apiBase);
      if (parsed.hostname && !['localhost', '127.0.0.1'].includes(parsed.hostname)) {
        remotePatterns.push({
          protocol: parsed.protocol.replace(':', ''),
          hostname: parsed.hostname,
          pathname: '/**',
        });
      }
    } catch {
      // noop
    }
  }
}

const nextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
