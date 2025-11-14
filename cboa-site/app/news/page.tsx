import { publicNewsAPI } from '@/lib/api'
import NewsClient from './news-client'

export const dynamic = 'force-dynamic'

export default async function NewsPage() {
  try {
    // Fetch active news articles from database
    const articles = await publicNewsAPI.getActive()

    // Sort by priority (desc) then published date (desc)
    const sortedArticles = articles.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority
      }
      return new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
    })

    // Extract unique tags
    const allTags = sortedArticles.reduce((tags: string[], article) => {
      if (article.tags) {
        article.tags.forEach(tag => {
          if (!tags.includes(tag)) {
            tags.push(tag)
          }
        })
      }
      return tags
    }, [])

    // Convert to format expected by NewsClient
    const formattedArticles = sortedArticles.map(article => ({
      title: article.title,
      slug: article.slug,
      date: article.published_date,
      excerpt: article.excerpt,
      author: article.author,
      tags: article.tags || [],
      featured: article.featured,
      image: article.image_url
    }))

    return <NewsClient articles={formattedArticles} tags={allTags} />
  } catch (error) {
    console.error('Failed to load news articles:', error)
    // Return empty state on error
    return <NewsClient articles={[]} tags={[]} />
  }
}