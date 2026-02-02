'use client'

import Hero from '@/components/content/Hero'
import ElevateCTA from '@/components/ui/ElevateCTA'
import OSARequestFormWizard from '@/components/forms/OSARequestFormWizard'
import Card from '@/components/ui/Card'
import { IconBallBasketball, IconCalendar, IconTrophy, IconCheck } from '@tabler/icons-react'

export default function GetOfficialsPage() {

  return (
    <>
      <Hero
        title="CBOA Officiating Services"
        subtitle="Request certified basketball officials for your games, leagues, and tournaments"
        primaryAction={{ text: 'Request Officials', href: '#request-form' }}
      />

      {/* About Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <h2 className="text-2xl font-bold text-cboa-blue mb-6">
                CBOA Officiating Services Agreement
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Members of the Calgary Basketball Officials Association are members of the provincial referee organization,
                  the Alberta Basketball Officials Association (ABOA). As such we are pleased to partner with the sanctioning
                  body for all basketball played in the province, Basketball Alberta.
                </p>
                <p>
                  As certified partner members of the Provincial Sport Organizing Committee, CBOA members are trained, assessed,
                  and certified to national standards for basketball officials set forth by Canada Basketball. Members of the
                  Calgary Basketball Officials Association are the only basketball officials in the greater Calgary area eligible
                  to receive this training and certification as provided by the Canadian Basketball Officials Commission (CBOC).
                </p>
                <div className="bg-blue-50 rounded-lg p-6 mt-6">
                  <h3 className="font-bold text-cboa-blue mb-3">Why Choose CBOA Officials?</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <IconCheck size={20} className="text-cboa-orange mr-2 flex-shrink-0" />
                      <span>Nationally certified and trained officials</span>
                    </li>
                    <li className="flex items-start">
                      <IconCheck size={20} className="text-cboa-orange mr-2 flex-shrink-0" />
                      <span>Comprehensive insurance coverage</span>
                    </li>
                    <li className="flex items-start">
                      <IconCheck size={20} className="text-cboa-orange mr-2 flex-shrink-0" />
                      <span>Professional game management</span>
                    </li>
                    <li className="flex items-start">
                      <IconCheck size={20} className="text-cboa-orange mr-2 flex-shrink-0" />
                      <span>Consistent rule interpretation and application</span>
                    </li>
                    <li className="flex items-start">
                      <IconCheck size={20} className="text-cboa-orange mr-2 flex-shrink-0" />
                      <span>Ongoing performance evaluation and development</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Service Types */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-cboa-blue mb-12">
            Our Services
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <IconBallBasketball size={48} className="text-cboa-orange" />
                </div>
                <h3 className="text-xl font-bold text-cboa-blue mb-3">Exhibition Games</h3>
                <p className="text-gray-700">
                  Single games or small sets of games for tournaments, showcases, or special events
                </p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <IconCalendar size={48} className="text-cboa-orange" />
                </div>
                <h3 className="text-xl font-bold text-cboa-blue mb-3">League Coverage</h3>
                <p className="text-gray-700">
                  Complete season coverage for your basketball league with consistent officiating
                </p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <IconTrophy size={48} className="text-cboa-orange" />
                </div>
                <h3 className="text-xl font-bold text-cboa-blue mb-3">Tournament Services</h3>
                <p className="text-gray-700">
                  Full officiating services for tournaments of any size with experienced crews
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <ElevateCTA primaryButtonHref="#request-form" />

      {/* Request Form */}
      <section className="py-16 bg-gray-50" id="request-form">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-cboa-blue mb-4">
            Request Officiating Services
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Complete this form to schedule CBOA officials for your basketball event
          </p>

          <div className="max-w-3xl mx-auto">
            <OSARequestFormWizard />

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Questions about our services? Contact us at{' '}
                <a href="mailto:scheduler@cboa.ca" className="text-cboa-orange hover:text-cboa-blue">
                  scheduler@cboa.ca
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}