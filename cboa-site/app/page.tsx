import Hero from '@/components/content/Hero'
import StatsGrid from '@/components/content/StatsGrid'
import NewsCard from '@/components/content/NewsCard'
import TrainingCard from '@/components/content/TrainingCard'
import Button from '@/components/ui/Button'
import ElevateCTA from '@/components/ui/ElevateCTA'
import { getSiteSettings } from '@/lib/settings'
import { publicNewsAPI, publicTrainingAPI } from '@/lib/api'

export default async function HomePage() {
  // Get statistics from CMS settings
  const settings = getSiteSettings()
  const stats = [
    { label: 'Active Officials', value: settings.statistics.activeOfficials },
    { label: 'Games Per Season', value: settings.statistics.gamesPerSeason },
    { label: 'Years of Service', value: settings.statistics.yearsOfService },
  ]

  // Fetch latest news from database
  let latestNews: any[] = []
  try {
    const allNews = await publicNewsAPI.getActive()
    latestNews = allNews
      .sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority
        return new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
      })
      .slice(0, 3)
      .map(news => ({
        title: news.title,
        date: news.published_date,
        excerpt: news.excerpt,
        author: news.author,
        slug: news.slug,
        image: news.image_url
      }))
  } catch (error) {
    console.error('Failed to load news for home page:', error)
  }

  // Fetch upcoming training events from database
  let upcomingTraining: any[] = []
  try {
    const events = await publicTrainingAPI.getUpcoming()
    upcomingTraining = events
      .slice(0, 2)
      .map(training => ({
        title: training.title,
        date: training.event_date,
        time: training.event_time ? `${training.event_time} - ${
          // Add 2 hours as default duration
          new Date(new Date(`2000-01-01 ${training.event_time}`).getTime() + 2 * 60 * 60 * 1000)
            .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        }` : 'TBD',
        location: training.location || 'TBD',
        type: 'workshop' as const,
        description: training.description,
        registrationLink: training.registration_url || '/training',
        spotsAvailable: training.capacity || undefined
      }))
  } catch (error) {
    console.error('Failed to load training for home page:', error)
  }
  
  return (
    <>
      <Hero
        title="Calgary Basketball Officials Association"
        subtitle="Join Calgary's premier basketball officiating organization"
        primaryAction={{ text: 'Become a Referee', href: '/become-a-referee' }}
        secondaryAction={{ text: 'View Training', href: '/training' }}
        showLogo={true}
      />
      
      <ElevateCTA />
      
      {/* Latest News */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-cboa-blue">Latest News</h2>
            <Button href="/news" variant="primary" size="sm">
              <span className="hidden sm:inline">View All News</span>
              <span className="sm:hidden">View All</span>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {latestNews.map((news) => (
              <NewsCard key={news.slug} {...news} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Upcoming Training */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-cboa-blue">Upcoming Training</h2>
            <Button href="/training" variant="primary" size="sm">
              <span className="hidden sm:inline">View All Training</span>
              <span className="sm:hidden">View All</span>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {upcomingTraining.map((training, index) => (
              <TrainingCard key={index} {...training} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}