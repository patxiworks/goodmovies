/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            // Allow the site itself and criterionpublishers.org (+ subdomains)
            // to embed the app in an <iframe>; block everyone else.
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://criterionpublishers.org https://*.criterionpublishers.org"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
