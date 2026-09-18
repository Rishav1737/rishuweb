import { Metadata } from 'next'
import { BASE_URL, OG_IMAGE } from '@/lib/constants'

interface SEOProps {
  title: string
  description: string
  image?: string
  url?: string
  keywords?: string[]
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  author?: string
}

/**
 * Generate comprehensive SEO metadata for any page
 * 
 * @example
 * ```typescript
 * export const metadata = generateMetadata({
 *   title: "About Us",
 *   description: "Learn more about our company",
 *   keywords: ["about", "company", "team"],
 * })
 * ```
 */
export function generateMetadata({
  title,
  description,
  image = OG_IMAGE,
  url,
  keywords = [],
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'Your Name',
}: SEOProps): Metadata {
  const baseUrl = BASE_URL
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl
  const fullImage = image.startsWith('http') ? image : `${baseUrl}${image}`

  return {
    title,
    description,
    keywords,
    authors: [{ name: author }],
    creator: author,
    publisher: author,
    openGraph: {
      type,
      locale: 'en_US',
      url: fullUrl,
      title,
      description,
      siteName: 'Your Name',
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@yourhandle',
      images: [fullImage],
    },
    alternates: {
      canonical: fullUrl,
    },
  }
}

/**
 * Generate article metadata for blog posts
 */
export function generateArticleMetadata({
  title,
  description,
  image,
  url,
  keywords = [],
  publishedTime,
  modifiedTime,
  author = 'Your Name',
}: SEOProps): Metadata {
  return generateMetadata({
    title,
    description,
    image,
    url,
    keywords,
    type: 'article',
    publishedTime,
    modifiedTime,
    author,
  })
}

/**
 * Common SEO keywords for the site
 */
export const commonKeywords = [
  'Web Development',
  'Portfolio',
  'Digital Services',
  'Next.js',
  'React',
  'TypeScript',
]

/**
 * Merge common keywords with page-specific keywords
 */
export function mergeKeywords(pageKeywords: string[]): string[] {
  return [...new Set([...commonKeywords, ...pageKeywords])]
}
