import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        domains: ['res.cloudinary.com'],
    },
    // ✅ Empêche Next de bundler Prisma => l'engine reste dans node_modules
    serverExternalPackages: ['@prisma/client', 'prisma'],
}

export default nextConfig
