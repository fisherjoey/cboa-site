'use client'

import Hero from '@/components/content/Hero'
import Card from '@/components/ui/Card'
import { IconCheck, IconHeart, IconShieldCheck, IconUsers } from '@tabler/icons-react'
import Image from 'next/image'

export default function BlueWhistlePage() {
  const objectives = [
    'Create a safe, supportive, and respectful environment for new basketball referees',
    'Eliminate aggressive behavior from players, coaches, and spectators',
    'Promote professionalism, fair play, and adherence to the rules of basketball'
  ]

  const partners = [
    { name: 'Alberta Basketball Officials Association', url: 'https://www.refalberta.ca/' },
    { name: 'Calgary Basketball Officials Association', url: '/' },
    { name: 'Calgary Minor Basketball Association', url: 'https://www.cmba.ab.ca/' }
  ]

  return (
    <>
      <Hero
        title="Blue Whistle Program"
        subtitle="When the whistle is blue, the official is new"
        primaryAction={{ text: 'Become a Referee', href: '/become-a-referee' }}
      />

      {/* About Section */}
      <section className="py-16 bg-gray-50" id="about">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="/images/blue-whistle-official.jpg"
                  alt="Young basketball referee wearing a blue whistle"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-cboa-blue mb-4">
                  &ldquo;When the whistle is <span className="text-blue-500">blue</span>, the official is <span className="text-cboa-orange">new</span>&rdquo;
                </h2>
                <p className="text-gray-700">
                  Basketball Alberta has launched the Blue Whistle Program, a provincewide initiative encouraging respectful treatment of new basketball officials.
                </p>
              </div>
            </div>

            <Card>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Through the Blue Whistle Program, new officials across the province are receiving specially designed blue whistles emblazoned with the orange Basketball Alberta logo.
                </p>
                <p className="text-gray-700">
                  When worn during games, the distinctive and easily identifiable whistle serves as a visual reminder for fans, parents, players and coaches that the official is new.
                </p>
                <p className="text-gray-700">
                  This simple visual cue helps create a more supportive environment for officials who are just starting their journey, encouraging patience and understanding from everyone involved in the game.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Program Objectives */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-cboa-blue mb-12">
            Program Objectives
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="grid gap-6">
              {objectives.map((objective, index) => (
                <Card key={index}>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      {index === 0 && <IconShieldCheck size={32} className="text-blue-500" />}
                      {index === 1 && <IconHeart size={32} className="text-cboa-orange" />}
                      {index === 2 && <IconUsers size={32} className="text-cboa-blue" />}
                    </div>
                    <p className="text-gray-700 text-lg">{objective}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-16 bg-cboa-blue text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why This Program Matters
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-cboa-orange mb-3">Retention</h3>
              <p className="text-gray-100">
                New officials often leave the profession due to negative experiences. A supportive environment helps retain valuable new referees.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-cboa-orange mb-3">Development</h3>
              <p className="text-gray-100">
                When officials feel supported, they can focus on learning and improving rather than dealing with hostile environments.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-cboa-orange mb-3">Community</h3>
              <p className="text-gray-100">
                Building a culture of respect benefits everyone - players, coaches, parents, and officials alike.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Program Partners */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-cboa-blue mb-12">
            Program Partners
          </h2>
          <div className="max-w-2xl mx-auto">
            <Card>
              <ul className="space-y-3">
                {partners.map((partner, index) => (
                  <li key={index} className="flex items-center">
                    <IconCheck size={20} className="text-cboa-orange mr-3 flex-shrink-0" />
                    <a
                      href={partner.url}
                      className="text-cboa-blue hover:text-cboa-orange transition-colors font-medium"
                      target={partner.url === '/' ? undefined : '_blank'}
                      rel={partner.url === '/' ? undefined : 'noopener noreferrer'}
                    >
                      {partner.name}
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-cboa-blue mb-4">
            Interested in Becoming an Official?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our team of basketball officials and receive your blue whistle as part of our new official training program.
          </p>
          <a
            href="/become-a-referee"
            className="inline-block bg-cboa-orange hover:bg-cboa-blue text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Apply to Become a Referee
          </a>
        </div>
      </section>
    </>
  )
}
