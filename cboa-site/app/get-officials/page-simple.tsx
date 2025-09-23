'use client'

import Hero from '@/components/content/Hero'
import Card from '@/components/ui/Card'
import MSForm from './MSForm'
import { IconBallBasketball, IconCalendar, IconTrophy } from '@tabler/icons-react'

// IMPORTANT: Replace this with your actual Microsoft Form URL
const MICROSOFT_FORM_URL = "https://forms.office.com/r/YOUR_FORM_ID"

export default function GetOfficialsPage() {
  return (
    <main className="min-h-screen">
      <Hero
        title="Book CBOA Officials"
        subtitle="Professional basketball officiating for your games, tournaments, and events"
        backgroundImage="/images/court-bg.jpg"
      />

      <section className="py-12 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center p-6">
              <IconBallBasketball className="h-12 w-12 text-cboa-orange mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Certified Officials</h3>
              <p className="text-gray-600">All CBOA referees are certified and experienced</p>
            </Card>

            <Card className="text-center p-6">
              <IconCalendar className="h-12 w-12 text-cboa-orange mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Flexible Scheduling</h3>
              <p className="text-gray-600">Book officials for single games or full tournaments</p>
            </Card>

            <Card className="text-center p-6">
              <IconTrophy className="h-12 w-12 text-cboa-orange mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">All Levels</h3>
              <p className="text-gray-600">From youth leagues to senior competitions</p>
            </Card>
          </div>

          {/* Microsoft Form Embed */}
          <Card className="max-w-4xl mx-auto p-8">
            <MSForm
              formUrl={MICROSOFT_FORM_URL}
              title="Request Officials for Your Event"
              height="900px"
            />
          </Card>

          {/* Instructions */}
          <div className="max-w-4xl mx-auto mt-8">
            <Card className="p-6">
              <h3 className="font-bold text-xl mb-4">How It Works</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Fill out the form above with your event details</li>
                <li>We'll review your request within 24-48 hours</li>
                <li>You'll receive confirmation with assigned officials</li>
                <li>Officials will arrive at your venue prepared and on time</li>
              </ol>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> For urgent requests (less than 48 hours notice),
                  please call us directly at (403) 555-0123.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}