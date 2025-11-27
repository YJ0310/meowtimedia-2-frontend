import { MetadataRoute } from 'next'
import { countries, topics } from '@/lib/mock-data'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://meowtimedia-2-frontend.vercel.app'
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/passport`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // Dynamic country pages
  const countryPages: MetadataRoute.Sitemap = countries.map((country) => ({
    url: `${baseUrl}/country/${country.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Dynamic learn pages
  const learnPages: MetadataRoute.Sitemap = topics.map((topic) => ({
    url: `${baseUrl}/learn/${topic.countrySlug}/${topic.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...countryPages, ...learnPages]
}
