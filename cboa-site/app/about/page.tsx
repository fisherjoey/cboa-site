import Hero from '@/components/content/Hero'
import Card from '@/components/ui/Card'
import CTASection from '@/components/ui/CTASection'
import { getSiteSettings } from '@/lib/settings'
import { publicPagesAPI } from '@/lib/api'
import { IconStar, IconScale, IconTrendingUp, IconUsers, IconBallBasketball, IconTrophy, IconCheck } from '@tabler/icons-react'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function AboutPage() {
  const settings = getSiteSettings()
  const executiveTeam = settings.executiveTeam || []

  // Get the about page content from database
  let htmlContent: string | null = null
  try {
    const aboutPage = await publicPagesAPI.getByName('about')
    htmlContent = aboutPage?.content || null
  } catch (error) {
    console.error('Failed to load about page content:', error)
  }
  
  const values = [
    {
      title: 'Excellence',
      description: 'Striving for the highest standards in officiating through continuous improvement and professional development.',
      icon: IconStar
    },
    {
      title: 'Integrity',
      description: 'Maintaining fair and impartial judgment in every call, building trust with players, coaches, and fans.',
      icon: IconScale
    },
    {
      title: 'Development',
      description: 'Fostering continuous learning and growth for officials at all levels of experience.',
      icon: IconTrendingUp
    },
    {
      title: 'Community',
      description: 'Supporting basketball growth in Calgary and building strong relationships within the basketball community.',
      icon: IconUsers
    },
    {
      title: 'Respect',
      description: 'Showing respect for the game, players, coaches, and fellow officials in all interactions.',
      icon: IconBallBasketball
    },
    {
      title: 'Leadership',
      description: 'Setting the standard for basketball officiating excellence in Alberta and beyond.',
      icon: IconTrophy
    }
  ]

  return (
    <>
      <Hero
        title="About CBOA"
        subtitle="Calgary's premier basketball officiating organization since 1964"
      />

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-cboa-blue mb-6">Our Mission</h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              To develop and maintain a strong community of basketball officials who demonstrate 
              excellence, integrity, and professionalism in every game they officiate. We are 
              committed to providing the highest quality officiating services to basketball 
              programs throughout Calgary and surrounding areas.
            </p>
          </div>
        </div>
      </section>

      {/* CMS Content Section */}
      {htmlContent && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="tinymce-content">
                {htmlContent ? (
                  <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: aboutContent?.content || aboutContent?.body || '' }} />
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* History Section - Fallback if no CMS content */}
      {!htmlContent && (
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
      )}

      {/* Values Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-cboa-blue mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <Card key={index}>
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <value.icon size={48} className="text-cboa-orange" />
                  </div>
                  <h3 className="text-xl font-bold text-cboa-blue mb-3">{value.title}</h3>
                  <p className="text-gray-700">{value.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-16 bg-cboa-blue text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">What We Do</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div>
              <h3 className="text-xl font-bold mb-4 text-cboa-orange">Training & Development</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <IconCheck size={20} className="text-cboa-orange mr-2 flex-shrink-0" />
                  Comprehensive training programs for new officials
                </li>
                <li className="flex items-start">
                  <IconCheck size={20} className="text-cboa-orange mr-2 flex-shrink-0" />
                  Ongoing professional development workshops
                </li>
                <li className="flex items-start">
                  <IconCheck size={20} className="text-cboa-orange mr-2 flex-shrink-0" />
                  Mentorship programs pairing experienced officials with newcomers
                </li>
                <li className="flex items-start">
                  <IconCheck size={20} className="text-cboa-orange mr-2 flex-shrink-0" />
                  Annual rules clinics and certification courses
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-cboa-orange">Services & Support</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <IconCheck size={20} className="text-cboa-orange mr-2 flex-shrink-0" />
                  Game assignments for all levels of basketball
                </li>
                <li className="flex items-start">
                  <IconCheck size={20} className="text-cboa-orange mr-2 flex-shrink-0" />
                  Support for basketball programs across Calgary
                </li>
                <li className="flex items-start">
                  <IconCheck size={20} className="text-cboa-orange mr-2 flex-shrink-0" />
                  Maintain officiating standards and best practices
                </li>
                <li className="flex items-start">
                  <IconCheck size={20} className="text-cboa-orange mr-2 flex-shrink-0" />
                  Liaison with Basketball Alberta and Canada Basketball
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Executive Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-cboa-blue mb-12 text-center">Executive Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {executiveTeam.map((member, index) => (
              <Card key={index}>
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 relative rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300">
                    <div className="absolute inset-0 flex items-end justify-center">
                      <Image
                        src={member.image || "/images/executive-placeholder.svg"}
                        alt={`${member.name} - ${member.position}`}
                        width={120}
                        height={120}
                        className="object-cover translate-y-2"
                      />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-cboa-blue">{member.name}</h3>
                  <p className="text-cboa-orange font-medium mb-2">{member.position}</p>
                  <a href={`mailto:${member.email}`} className="text-sm text-gray-600 hover:text-cboa-blue transition-colors">
                    {member.email}
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <CTASection />
        </div>
      </section>
    </>
  )
}