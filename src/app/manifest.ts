import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DriverFinance',
    short_name: 'Driver',
    description: 'Personal Finance Tracker for ShopeeFood Drivers',
    start_url: '/',
    display: 'standalone',
    background_color: '#111111', // Dark background for the splash screen
    theme_color: '#EE4D2D', // Shopee Orange
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
