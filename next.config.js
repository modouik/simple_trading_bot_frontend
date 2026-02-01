/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Désactive le mode strict
  eslint: {
    ignoreDuringBuilds: true, // Ignore les erreurs de style
  },
  typescript: {
    ignoreBuildErrors: true, // Ignore les erreurs de type
  },
  output: 'standalone', // Génère un build optimisé
  env: {
    // For Local Server
    
   //

  //  API_PROD_URL: "http://localhost:3000/api/",

    // API_PROD_URL: "https://laravel.pixelstrap.net/fastkart/api",
  },
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/en/dashboard",
        permanent: true,
      },
      {
        source: "/en",
        destination: "/en/dashboard",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1:8000",
      },
      {
        protocol: "https",
        hostname: "fastkart-admin-json.vercel.app",
      },
      {
        protocol: "https",
        hostname: "laravel.pixelstrap.net",
      },
    ],
  }
};

module.exports = nextConfig;
