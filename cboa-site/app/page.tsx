import Hero from '@/components/content/Hero'
import StatsGrid from '@/components/content/StatsGrid'
import NewsCard from '@/components/content/NewsCard'
import TrainingCard from '@/components/content/TrainingCard'
import Button from '@/components/ui/Button'
import ElevateCTA from '@/components/ui/ElevateCTA'
import { getSiteSettings } from '@/lib/settings'
import { getAllContent } from '@/lib/content'

export default function HomePage() {
  // Get statistics from CMS settings
  const settings = getSiteSettings()
  const stats = [
    { label: 'Active Officials', value: settings.statistics.activeOfficials },
    { label: 'Games Per Season', value: settings.statistics.gamesPerSeason },
    { label: 'Years of Service', value: settings.statistics.yearsOfService },
  ]
  
  // Get news from CMS
  const allNews = getAllContent('news')
  const latestNews = allNews
    .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
    .slice(0, 3)
    .map(news => ({
      title: news.title || '',
      date: news.date || '',
      excerpt: news.excerpt || '',
      author: news.author || 'CBOA Admin',
      slug: news.slug || '',
    }))
  
  // Get training events from CMS
  const allTraining = getAllContent('training')
  const currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)
  
  const upcomingTraining = allTraining
    .filter(event => new Date(event.date || '') >= currentDate)
    .sort((a, b) => new Date(a.date || '').getTime() - new Date(b.date || '').getTime())
    .slice(0, 2)
    .map(training => ({
      title: training.title || '',
      date: training.date || '',
      time: `${training.startTime || ''} - ${training.endTime || ''}`,
      location: training.location || '',
      type: (training.type || 'workshop') as 'workshop' | 'certification' | 'refresher' | 'meeting',
      description: training.description || '',
      registrationLink: training.registrationLink || '/training',
      spotsAvailable: (training.maxParticipants || 0) - (training.currentRegistrations || 0),
    }))
  
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
      
      {/* Book Referees CTA */}
      <section className="py-8 sm:py-12 bg-gradient-to-r from-cboa-blue to-blue-800">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Need Officials for Your Games?</h2>
            <p className="text-lg sm:text-xl mb-6 max-w-2xl mx-auto">
              Book certified CBOA referees for your basketball games, tournaments, and events. 
              Professional, experienced, and reliable officials available.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/get-officials" variant="primary" size="lg" className="bg-cboa-orange hover:bg-orange-600 text-white">
                Book Referees Now
              </Button>
              <Button href="/about#contact" variant="secondary" size="lg" className="bg-white text-cboa-blue hover:bg-gray-100">
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>
      
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