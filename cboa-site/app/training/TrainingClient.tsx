'use client'

import { useState } from 'react'
import Hero from '@/components/content/Hero'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { IconUserPlus, IconBooks, IconBallBasketball, IconBook, IconTrendingUp, IconUsers, IconRun, IconChecklist, IconUsersGroup, IconPencil, IconCheck, IconVideo, IconFileText, IconSchool } from '@tabler/icons-react'

interface TrainingEvent {
  title: string
  date: string
  startTime: string
  endTime: string
  location: string
  type: 'workshop' | 'certification' | 'refresher' | 'meeting'
  description: string
  registrationLink?: string
  maxParticipants?: number
  currentRegistrations?: number
  instructor?: string
  requirements?: string
  slug: string
}

interface TrainingClientProps {
  trainingEvents: TrainingEvent[]
}

export default function TrainingClient({ trainingEvents }: TrainingClientProps) {
  const [activeTab, setActiveTab] = useState('overview')
  
  const certificationLevels = [
    {
      level: 1,
      name: 'Entry Level Official',
      administrator: 'ABOA',
      description: 'Foundation level for new officials',
      requirements: [
        'Complete online registration with CBOA',
        'Attend New Officials Clinic',
        'Pass basic rules test (60% minimum)',
        'Complete on-court training session',
        'Shadow experienced officials (minimum 3 games)'
      ],
      gameLevel: 'Youth recreational leagues, elementary school',
      timeframe: '1-2 months'
    },
    {
      level: 2,
      name: 'Community Level Official',
      administrator: 'ABOA',
      description: 'Certified for community and school basketball',
      requirements: [
        'Minimum 1 year at Level 1',
        'Complete Level 2 online modules',
        'Pass FIBA exam (70% minimum)',
        'Two successful on-court evaluations',
        'Attend regional training clinic'
      ],
      gameLevel: 'Junior high, community leagues, youth competitive',
      timeframe: '6-12 months from Level 1'
    },
    {
      level: 3,
      name: 'Provincial Level Official',
      administrator: 'ABOA',
      description: 'Qualified for high school and club basketball',
      requirements: [
        'Minimum 2 years at Level 2',
        'Complete advanced mechanics course',
        'Pass FIBA exam (80% minimum)',
        'Three successful evaluations at high school level',
        'Attend provincial camp'
      ],
      gameLevel: 'High school varsity, club basketball, junior college',
      timeframe: '1-2 years from Level 2'
    },
    {
      level: 4,
      name: 'National Level Official',
      administrator: 'CBOC',
      description: 'Elite level for university and national competitions',
      requirements: [
        'Minimum 3 years at Level 3',
        'CBOC recommendation',
        'Pass national certification exam (85% minimum)',
        'Attend national training camp',
        'Multiple evaluations at university level'
      ],
      gameLevel: 'University, national championships, Canada Games',
      timeframe: '2-3 years from Level 3'
    },
    {
      level: 5,
      name: 'FIBA International Official',
      administrator: 'FIBA',
      description: 'International certification for global competitions',
      requirements: [
        'National level experience',
        'FIBA nomination by Canada Basketball',
        'Pass FIBA international exam',
        'Attend FIBA training camp',
        'Meet physical fitness standards'
      ],
      gameLevel: 'International competitions, Olympics, World Championships',
      timeframe: 'By invitation only'
    }
  ]
  
  const pathwaySteps = [
    {
      step: 1,
      title: 'Join CBOA',
      description: 'Register with Calgary Basketball Officials Association',
      icon: IconUserPlus
    },
    {
      step: 2,
      title: 'Initial Training',
      description: 'Complete new officials clinic and online modules',
      icon: IconBooks
    },
    {
      step: 3,
      title: 'Get Experience',
      description: 'Officiate games at appropriate level for your certification',
      icon: IconBallBasketball
    },
    {
      step: 4,
      title: 'Continuous Learning',
      description: 'Attend clinics, workshops, and training sessions',
      icon: IconBook
    },
    {
      step: 5,
      title: 'Evaluation & Advancement',
      description: 'Get evaluated and progress through certification levels',
      icon: IconTrendingUp
    }
  ]
  
  const trainingComponents = [
    {
      title: 'In-Class Sessions',
      description: 'Interactive workshops with experienced instructors',
      icon: IconUsers
    },
    {
      title: 'On-Court Practice',
      description: 'Practical training for positioning, signals, and mechanics',
      icon: IconRun
    },
    {
      title: 'Game Evaluations',
      description: 'Performance assessments during live games',
      icon: IconChecklist
    },
    {
      title: 'Mentorship',
      description: 'Guidance from experienced officials',
      icon: IconUsersGroup
    },
    {
      title: 'Rules Testing',
      description: 'Written exams to verify rules knowledge',
      icon: IconPencil
    }
  ]
  
  return (
    <>
      <Hero
        title="Training & Certification Program"
        subtitle="Your pathway to becoming a certified basketball official in Alberta"
      />
      
      {/* Tabs Navigation */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {['overview', 'levels', 'pathway', 'training', 'schedule', 'resources'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-full font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-cboa-orange text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card>
                <h2 className="text-2xl font-bold text-cboa-blue mb-6">
                  National Officials Certification Program (NOCP)
                </h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    The National Officials Certification Program (NOCP) was launched in 2007 as a cooperative 
                    effort between Canada Basketball and the Canadian Basketball Officials Commission (CBOC). 
                    This program aims to standardize official development across Canada, ensuring consistent 
                    quality and professionalism in basketball officiating.
                  </p>
                  <p>
                    As a member of the Calgary Basketball Officials Association (CBOA), you'll progress through 
                    a structured certification pathway that develops your skills from entry-level to potentially 
                    international competitions.
                  </p>
                  
                  <div className="bg-blue-50 rounded-lg p-6 mt-6">
                    <h3 className="font-bold text-cboa-blue mb-3">Program Highlights</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <IconCheck size={20} className="text-cboa-orange mr-2 flex-shrink-0" />
                        <span>5 certification levels from entry to international</span>
                      </li>
                      <li className="flex items-start">
                        <IconCheck size={20} className="text-cboa-orange mr-2 flex-shrink-0" />
                        <span>Comprehensive training combining online and practical components</span>
                      </li>
                      <li className="flex items-start">
                        <IconCheck size={20} className="text-cboa-orange mr-2 flex-shrink-0" />
                        <span>Standardized evaluation and progression criteria</span>
                      </li>
                      <li className="flex items-start">
                        <IconCheck size={20} className="text-cboa-orange mr-2 flex-shrink-0" />
                        <span>Mentorship and continuous development opportunities</span>
                      </li>
                      <li className="flex items-start">
                        <IconCheck size={20} className="text-cboa-orange mr-2 flex-shrink-0" />
                        <span>Recognition across Canada and pathway to international officiating</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-orange-50 border-l-4 border-cboa-orange p-4 mt-6">
                    <p className="font-semibold text-gray-800">
                      While certification is not required at the entry level, it becomes mandatory for 
                      intermediate, senior, and elite levels. We strongly encourage all officials to 
                      pursue certification to enhance their skills and advance their officiating career.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      )}
      
      {/* Levels Tab */}
      {activeTab === 'levels' && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-cboa-blue mb-12">
              Certification Levels
            </h2>
            <div className="space-y-6">
              {certificationLevels.map((cert) => (
                <Card key={cert.level}>
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-cboa-orange text-white rounded-full flex items-center justify-center text-3xl font-bold">
                        {cert.level}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                        <h3 className="text-xl font-bold text-cboa-blue">
                          Level {cert.level}: {cert.name}
                        </h3>
                      </div>
                      <p className="text-gray-700 mb-4">{cert.description}</p>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-cboa-blue mb-2">Requirements:</h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            {cert.requirements.map((req, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-cboa-orange mr-2">•</span>
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-cboa-blue mb-2">Game Level:</h4>
                          <p className="text-sm text-gray-700 mb-3">{cert.gameLevel}</p>
                          
                          <h4 className="font-semibold text-cboa-blue mb-2">Typical Timeframe:</h4>
                          <p className="text-sm text-gray-700">{cert.timeframe}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Pathway Tab */}
      {activeTab === 'pathway' && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-cboa-blue mb-12">
              Your Certification Pathway
            </h2>
            
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-5 gap-4 mb-12">
                {pathwaySteps.map((step, index) => (
                  <div key={step.step} className="relative h-full">
                    {index < pathwaySteps.length - 1 && (
                      <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gray-300" />
                    )}
                    <Card className="h-full">
                      <div className="text-center relative z-10 h-full flex flex-col justify-between">
                        <div>
                          <div className="flex justify-center mb-3">
                            <step.icon size={36} className="text-cboa-orange" />
                          </div>
                          <h3 className="font-bold text-cboa-blue mb-2">
                            Step {step.step}
                          </h3>
                          <h4 className="text-sm font-semibold mb-2">{step.title}</h4>
                        </div>
                        <p className="text-xs text-gray-600">{step.description}</p>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Training Tab */}
      {activeTab === 'training' && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-cboa-blue mb-12">
              Training Components
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {trainingComponents.map((component, index) => (
                <Card key={index}>
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <component.icon size={48} className="text-cboa-orange" />
                    </div>
                    <h3 className="text-lg font-bold text-cboa-blue mb-2">
                      {component.title}
                    </h3>
                    <p className="text-sm text-gray-700">{component.description}</p>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="max-w-4xl mx-auto">
              <Card>
                <h3 className="text-xl font-bold text-cboa-blue mb-6">
                  View Training Schedule
                </h3>
                <div className="text-center">
                  <p className="text-gray-600 mb-6">
                    Check out our full training schedule for upcoming workshops, certification sessions, and training events.
                  </p>
                  <button 
                    onClick={() => setActiveTab('schedule')}
                    className="bg-cboa-blue text-white px-6 py-3 rounded-full font-semibold hover:bg-opacity-90 transition-all inline-block mb-6"
                  >
                    View Full Schedule
                  </button>
                  
                  <div className="pt-6 border-t border-gray-200">
                    <p className="text-gray-700 mb-4">
                      Ready to start your officiating journey? Join CBOA today and access all our training programs.
                    </p>
                    <Button 
                      href="/become-a-referee" 
                      size="lg"
                    >
                      Apply to Become an Official
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      )}
      
      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-cboa-blue mb-12">
              Training Schedule 2025
            </h2>
            
            <div className="max-w-5xl mx-auto">
              <div className="grid gap-6">
                <Card>
                  <h3 className="text-xl font-bold text-cboa-blue mb-6">Upcoming Sessions</h3>
                  {trainingEvents.length > 0 ? (
                    <div className="space-y-4">
                      {trainingEvents.slice(0, 10).map((event, index) => {
                        const eventDate = new Date(event.date)
                        const formattedDate = eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                        
                        // Determine registration status
                        let statusBadge = null
                        if (event.maxParticipants && event.currentRegistrations !== undefined) {
                          const spotsLeft = event.maxParticipants - event.currentRegistrations
                          if (spotsLeft === 0) {
                            statusBadge = <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">Full</span>
                          } else if (spotsLeft <= 5) {
                            statusBadge = <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{spotsLeft} Spots Left</span>
                          } else {
                            statusBadge = <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Registration Open</span>
                          }
                        } else {
                          statusBadge = <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Registration Open</span>
                        }
                        
                        const borderColor = event.type === 'certification' ? 'border-cboa-orange' : 'border-cboa-blue'
                        
                        return (
                          <div key={index} className={`bg-gray-50 rounded-lg p-4 border-l-4 ${borderColor}`}>
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-800">{event.title}</h4>
                              {statusBadge}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              Date: {formattedDate} • {event.startTime} - {event.endTime}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">Location: {event.location}</p>
                            {event.instructor && (
                              <p className="text-sm text-gray-600 mb-1">Instructor: {event.instructor}</p>
                            )}
                            <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                            {event.requirements && (
                              <p className="text-sm text-gray-500 italic mb-2">Prerequisites: {event.requirements}</p>
                            )}
                            {event.registrationLink && (
                              <a 
                                href={event.registrationLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-block mt-2 text-sm text-cboa-orange hover:text-cboa-blue font-medium"
                              >
                                Register →
                              </a>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No upcoming training events scheduled.</p>
                      <p className="text-sm mt-2">Check back soon for updates!</p>
                    </div>
                  )}
                </Card>
                
                <Card>
                  <h3 className="text-xl font-bold text-cboa-blue mb-4">Important Dates</h3>
                  <div className="bg-orange-50 border-l-4 border-cboa-orange p-4">
                    <ul className="space-y-2 text-sm">
                      <li><strong>Registration Deadline:</strong> August 31, 2025</li>
                      <li><strong>Season Start:</strong> September 2025</li>
                      <li><strong>Mid-Season Evaluations:</strong> January 2026</li>
                      <li><strong>Provincial Championships:</strong> March 2026</li>
                    </ul>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Resources Tab */}
      {activeTab === 'resources' && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-cboa-blue mb-12">
              Certification Resources
            </h2>
            
            <div className="max-w-4xl mx-auto space-y-6">
              <Card>
                <h3 className="text-xl font-bold text-cboa-blue mb-4">
                  Important Links
                </h3>
                <div className="space-y-3">
                  <a 
                    href="https://refalberta.ca" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium text-gray-800">Alberta Basketball Officials Association</span>
                    <span className="text-cboa-orange">→</span>
                  </a>
                  <a 
                    href="https://www.basketball.ca" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium text-gray-800">Canada Basketball</span>
                    <span className="text-cboa-orange">→</span>
                  </a>
                  <a 
                    href="https://www.fiba.basketball" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium text-gray-800">FIBA - International Basketball Federation</span>
                    <span className="text-cboa-orange">→</span>
                  </a>
                </div>
              </Card>
              
              <Card>
                <h3 className="text-xl font-bold text-cboa-blue mb-4">
                  Study Materials
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <IconBooks size={20} className="text-cboa-orange mr-2" />
                      <h4 className="font-semibold text-gray-800">Rule Books</h4>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• FIBA Official Rules</li>
                      <li>• Canada Basketball Modifications</li>
                      <li>• CBOA Local Interpretations</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <IconVideo size={20} className="text-cboa-orange mr-2" />
                      <h4 className="font-semibold text-gray-800">Video Resources</h4>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Mechanics demonstrations</li>
                      <li>• Game situation analysis</li>
                      <li>• Signal tutorials</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <IconFileText size={20} className="text-cboa-orange mr-2" />
                      <h4 className="font-semibold text-gray-800">Practice Tests</h4>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Sample FIBA exams</li>
                      <li>• Rules quizzes</li>
                      <li>• Scenario-based questions</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <IconSchool size={20} className="text-cboa-orange mr-2" />
                      <h4 className="font-semibold text-gray-800">Study Guides</h4>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Level-specific materials</li>
                      <li>• Quick reference cards</li>
                      <li>• Case book studies</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="text-center mt-12">
              <h3 className="text-xl font-bold text-cboa-blue mb-4">
                Ready to Start Your Officiating Journey?
              </h3>
              <div className="flex justify-center">
                <Button 
                  href="/become-a-referee" 
                  size="lg"
                >
                  Apply to Join CBOA
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  )
}