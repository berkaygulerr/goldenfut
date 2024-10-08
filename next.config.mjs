/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https", // Protokolü belirtin
        hostname: "b.fssta.com", // Alan adını belirtin
        port: "", // Gerekirse port belirtin, yoksa boş bırakın
        pathname: "/uploads/application/soccer/team-logos/**", // Yol desenini belirtin
      },
    ],
  },
};

export default nextConfig;
