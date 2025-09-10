'use client'

import { useState } from 'react'
import Hero from '@/components/content/Hero'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { IconCheck } from '@tabler/icons-react'

export default function BecomeARefereePage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    overSeventeen: '',
    hasExperience: '',
    howHeard: '',
    howHeardOther: '',
  })
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    
    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form) as any).toString()
      })
      alert('Thank you for your application! We will contact you soon.')
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        overSeventeen: '',
        hasExperience: '',
        howHeard: '',
        howHeardOther: '',
      })
    } catch (error) {
      alert('Error submitting form. Please try again.')
    }
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }
  
  const requirements = [
    'Sign the Membership Agreement',
    'Pay the annual dues',
    'Attend a clinic for your level of experience',
    'Purchase the correct referee jersey',
    'Write the rules exam on an annual basis'
  ]
  
  const timeline = [
    { month: 'September', activity: 'New Officials Course - Online classroom sessions begin' },
    { month: 'October', activity: 'On-court training sessions and practical application' },
    { month: 'October-June', activity: 'Active officiating season - gain experience with game assignments' },
    { month: 'Ongoing', activity: 'Continuous training and development opportunities' },
  ]
  
  const benefits = [
    { title: 'Competitive Pay', description: 'Earn $40-$60 per game depending on level, division, and location. Top officials can earn $10,000+ per season.' },
    { title: 'Flexible Schedule', description: 'Choose your availability. Work as many or as few games as your schedule allows.' },
    { title: 'Stay Active', description: 'Great way to stay physically fit while being involved in the sport you love.' },
    { title: 'Career Advancement', description: 'Clear pathway from youth games to high school, college, and potentially professional levels.' },
    { title: 'Community Impact', description: 'Make a positive difference in young athletes\' lives and help grow basketball in Calgary.' },
    { title: 'Training & Support', description: 'Ongoing education, mentorship programs, and support from experienced officials.' },
  ]
  
  return (
    <>
      <Hero
        title="Join the Calgary Basketball Officials Association"
        subtitle="Thank you for your interest in becoming a certified basketball official"
        primaryAction={{ text: 'Apply Now', href: '#application' }}
        secondaryAction={{ text: 'Learn More', href: '#requirements' }}
      />
      
      {/* About Section */}
      <section className="py-16 bg-gray-50" id="requirements">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <h2 className="text-2xl font-bold text-cboa-blue mb-6">
                Becoming an Active CBOA Official
              </h2>
              <p className="text-gray-700 mb-6">
                In order to become an active official with the CBOA, you will need to do the following:
              </p>
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <ul className="space-y-3">
                  {requirements.map((req, index) => (
                    <li key={index} className="text-gray-800 font-medium flex items-start">
                      <IconCheck size={20} className="text-cboa-orange mr-2 flex-shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <p className="text-gray-700">
                  <strong>The CBOA season begins in September</strong> of each year, with a New Officials course that runs in an online classroom in September and on-court sessions in October. These clinics are vital to anyone new to officiating as they cover the rules and mechanics of officiating and what expectations the association will have of you as a member.
                </p>
                <p className="text-gray-700">
                  This course is geared towards those who have never officiated and is an excellent refresher for those getting back into officiating. The course work is both online through Google Classroom and live on-court sessions.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Timeline Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-cboa-blue mb-12">
            Training Timeline
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {timeline.map((item, index) => (
                <Card key={index}>
                  <div className="flex items-start">
                    <div className="w-32 flex-shrink-0">
                      <span className="text-cboa-orange font-bold">{item.month}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700">{item.activity}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-16 bg-cboa-blue text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Become a CBOA Official?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                <h3 className="text-xl font-bold text-cboa-orange mb-3">{benefit.title}</h3>
                <p className="text-gray-100">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Application Form */}
      <section className="py-16 bg-gray-50" id="application">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-cboa-blue mb-4">
            Official Application Form
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Complete this application to begin your journey as a CBOA referee
          </p>
          <div className="max-w-2xl mx-auto">
            <Card>
              <form 
                name="referee-application"
                method="POST"
                data-netlify="true"
                netlify-honeypot="bot-field"
                onSubmit={handleSubmit}
              >
                <input type="hidden" name="form-name" value="referee-application" />
                <input type="hidden" name="bot-field" />
                <h3 className="text-xl font-bold text-cboa-blue mb-6">Contact Information</h3>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
                    />
                  </div>
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
                    />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-cboa-blue mb-6 mt-8">Eligibility Questions</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Are you over the age of 17 at the time of this submission? *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="overSeventeen"
                        value="yes"
                        onChange={handleChange}
                        required
                        className="mr-2"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="overSeventeen"
                        value="no"
                        onChange={handleChange}
                        required
                        className="mr-2"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Do you have basketball officiating experience? *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="hasExperience"
                        value="yes"
                        onChange={handleChange}
                        required
                        className="mr-2"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="hasExperience"
                        value="no"
                        onChange={handleChange}
                        required
                        className="mr-2"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="howHeard" className="block text-sm font-semibold text-gray-700 mb-2">
                    How did you hear about us? *
                  </label>
                  <select
                    id="howHeard"
                    name="howHeard"
                    value={formData.howHeard}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
                  >
                    <option value="">Select an option</option>
                    <option value="websearch">Web Search</option>
                    <option value="friend">Friend</option>
                    <option value="cboamember">Current CBOA Member</option>
                    <option value="cmba">Calgary Minor Basketball Association</option>
                    <option value="surge">Calgary Surge</option>
                    <option value="kidsport">Kid Sport / Project REF</option>
                    <option value="other">Other</option>
                  </select>
                  
                  {formData.howHeard === 'other' && (
                    <input
                      type="text"
                      name="howHeardOther"
                      value={formData.howHeardOther}
                      onChange={handleChange}
                      placeholder="Please specify"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange mt-2"
                    />
                  )}
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-700">
                    <strong>Next Steps:</strong> After submitting your application, we will review it and contact you with information about upcoming training sessions and orientation.
                  </p>
                </div>
                
                <Button type="submit" size="lg" className="w-full">
                  Submit Application
                </Button>
              </form>
            </Card>
            
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Again, thank you for your interest in joining our organization. We look forward to having you as a member.
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Questions? Contact us at <a href="mailto:info@cboa.ca" className="text-cboa-orange hover:text-cboa-blue">info@cboa.ca</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}