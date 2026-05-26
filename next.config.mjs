/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        ignoreBuildErrors: true,
    },
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "pankhuri-v3.blr1.digitaloceanspaces.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "pub-26bb499a653042debca0f402361c691f.r2.dev",
                pathname: "/**",
            },
            {
                protocol: "http",
                hostname: "localhost",
                pathname: "/**",
            }
        ],
    },
};

export default nextConfig;
