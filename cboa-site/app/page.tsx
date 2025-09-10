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
      
      {/* Latest News */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-cboa-blue">Latest News</h2>
            <Button href="/news" variant="primary" size="sm">
              View All News
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {latestNews.map((news) => (
              <NewsCard key={news.slug} {...news} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Upcoming Training */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-cboa-blue">Upcoming Training</h2>
            <Button href="/training" variant="primary" size="sm">
              View All Training
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {upcomingTraining.map((training, index) => (
              <TrainingCard key={index} {...training} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}