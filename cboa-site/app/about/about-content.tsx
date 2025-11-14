'use client'

import { useState, useEffect } from 'react'
import { publicPagesAPI } from '@/lib/api'

export default function AboutContent() {
  const [htmlContent, setHtmlContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true)
        const aboutPage = await publicPagesAPI.getByName('about')
        setHtmlContent(aboutPage?.content || null)
      } catch (error) {
        console.error('Failed to load about page content:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-500 text-lg">Loading content...</p>
          </div>
        </div>
      </section>
    )
  }

  // CMS Content Section
  if (htmlContent) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="tinymce-content">
              <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>
          </div>
        </div>
      </section>
    )
  }

  // History Section - Fallback if no CMS content
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-cboa-blue mb-8 text-center">Our History</h2>
          <div className="prose prose-lg mx-auto">
            <p className="text-gray-700 mb-4">
              The Calgary Basketball Officials Association was founded in 1964 by a group of
              dedicated basketball enthusiasts who recognized the need for organized, professional
              officiating in Calgary's growing basketball community.
            </p>
            <p className="text-gray-700 mb-4">
              Starting with just 25 members, CBOA has grown to over 250 active officials,
              making us one of the largest basketball officiating organizations in Western Canada.
              Our officials work games ranging from youth recreational leagues to high-level
              provincial championships.
            </p>
            <p className="text-gray-700">
              Over the past 45 years, CBOA has been instrumental in developing officiating
              standards, training programs, and mentorship initiatives that have produced some
              of Canada's finest basketball officials, including several who have gone on to
              officiate at national and international levels.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
