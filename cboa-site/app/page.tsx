import Hero from '@/components/content/Hero'
import ElevateCTA from '@/components/ui/ElevateCTA'
import HomeContent from './home-content'

export default function HomePage() {
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

      <HomeContent />
    </>
  )
}