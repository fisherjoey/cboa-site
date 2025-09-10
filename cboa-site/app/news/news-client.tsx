'use client'

import { useState } from 'react'
import Hero from '@/components/content/Hero'
import NewsCard from '@/components/content/NewsCard'
import { ContentItem } from '@/lib/content'

interface NewsClientProps {
  articles: ContentItem[]
  tags: string[]
}

export default function NewsClient({ articles, tags }: NewsClientProps) {
  const [selectedTag, setSelectedTag] = useState('all')
  
  const filteredArticles = selectedTag === 'all' 
    ? articles 
    : articles.filter(article => article.tags?.includes(selectedTag))
  
  const featuredArticle = filteredArticles.find(a => a.featured)
  const regularArticles = filteredArticles.filter(a => !a.featured)
  
  return (
    <>
      <Hero
        title="News & Updates"
        subtitle="Stay informed with the latest CBOA news"
      />

      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Tags Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setSelectedTag('all')}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedTag === 'all'
                    ? 'bg-cboa-orange text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    selectedTag === tag
                      ? 'bg-cboa-orange text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Article */}
          {featuredArticle && (
            <div className="mb-12">
              <NewsCard 
                title={featuredArticle.title || ''}
                date={featuredArticle.date || ''}
                excerpt={featuredArticle.excerpt || ''}
                author={featuredArticle.author}
                slug={featuredArticle.slug || ''}
                featured 
              />
            </div>
          )}

          {/* Regular Articles Grid */}
          {regularArticles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularArticles.map((article) => (
                <NewsCard 
                  key={article.slug} 
                  title={article.title || ''}
                  date={article.date || ''}
                  excerpt={article.excerpt || ''}
                  author={article.author}
                  slug={article.slug || ''}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {articles.length === 0 
                  ? 'No news articles have been published yet. Use the CMS to add articles.'
                  : 'No articles found for the selected tag.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}