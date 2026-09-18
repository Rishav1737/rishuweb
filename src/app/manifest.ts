import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Rishab - Website & Services',
    short_name: 'Rishab',
    description: 'Professional portfolio and services. Web development, design, and digital solutions.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/fav-logo.png',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
