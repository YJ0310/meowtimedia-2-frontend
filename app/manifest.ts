import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Meowtimap - Your Journey Through Asian Culture',
    short_name: 'Meowtimap',
    description: 'Collect cultures. Earn stamps. Fall in love with Asia. Explore 10 Asian countries and learn about their rich cultural heritage.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#A8BEDF',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
