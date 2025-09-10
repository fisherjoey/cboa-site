'use client'

import { useState } from 'react'
import Hero from '@/components/content/Hero'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import ElevateCTA from '@/components/ui/ElevateCTA'
import { IconBallBasketball, IconCalendar, IconTrophy, IconCheck } from '@tabler/icons-react'

export default function GetOfficialsPage() {
  const [eventType, setEventType] = useState('')
  const [formData, setFormData] = useState({
    // Organization Info
    organizationName: '',
    
    // Billing Info
    billingContactName: '',
    billingEmail: '',
    billingAddress: '',
    city: '',
    province: 'Alberta',
    postalCode: '',
    paymentAgreed: false,
    
    // Event Contact
    eventContactName: '',
    eventContactEmail: '',
    
    // Event Details
    eventType: '',
    
    // League specific
    leagueName: '',
    leagueStartDate: '',
    leagueEndDate: '',
    leagueGender: '',
    leagueLevel: '',
    
    // Tournament specific
    tournamentName: '',
    tournamentDates: '',
    tournamentGender: '',
    tournamentLevel: '',
    
    // Exhibition specific
    exhibitionDate: '',
    exhibitionGender: '',
    exhibitionLevel: '',
    numberOfGames: '',
    
    // Policy
    disciplinePolicy: '',
    exclusivityAgreed: false,
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
      alert('Thank you for your request! Our scheduling team will contact you shortly.')
    } catch (error) {
      alert('Error submitting form. Please try again.')
    }
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }
  
  const levelOptions = [
    'U11', 'U13', 'U15', 'U17', 'U19',
    'Jr. High', 'High School - Junior Varsity', 'High School - Varsity',
    'College / University', 'Adult', 'Other'
  ]
  
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
                  body for all basketball played in the province, the Alberta Basketball Association (ABA).
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
            <Card>
              <form 
                name="officials-request"
                method="POST"
                data-netlify="true"
                netlify-honeypot="bot-field"
                onSubmit={handleSubmit}
              >
                <input type="hidden" name="form-name" value="officials-request" />
                <input type="hidden" name="bot-field" />
                {/* Organization Information */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-cboa-blue mb-4">Organization Information</h3>
                  <div className="mb-4">
                    <label htmlFor="organizationName" className="block text-sm font-semibold text-gray-700 mb-2">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      id="organizationName"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
                    />
                  </div>
                </div>
                
                {/* Billing Information */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-cboa-blue mb-4">Billing Information</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    To secure CBOA services, we require accurate billing contact information. 
                    Payment is due within 30 days of invoice date. For events starting after April 1st, 
                    payment is required in advance.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="billingContactName" className="block text-sm font-semibold text-gray-700 mb-2">
                        Billing Contact Name *
                      </label>
                      <input
                        type="text"
                        id="billingContactName"
                        name="billingContactName"
                        value={formData.billingContactName}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
                      />
                    </div>
                    <div>
                      <label htmlFor="billingEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                        Billing Email *
                      </label>
                      <input
                        type="email"
                        id="billingEmail"
                        name="billingEmail"
                        value={formData.billingEmail}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="billingAddress" className="block text-sm font-semibold text-gray-700 mb-2">
                      Billing Address *
                    </label>
                    <input
                      type="text"
                      id="billingAddress"
                      name="billingAddress"
                      value={formData.billingAddress}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
                      />
                    </div>
                    <div>
                      <label htmlFor="province" className="block text-sm font-semibold text-gray-700 mb-2">
                        Province *
                      </label>
                      <select
                        id="province"
                        name="province"
                        value={formData.province}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
                      >
                        <option value="Alberta">Alberta</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-semibold text-gray-700 mb-2">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 border-l-4 border-cboa-orange p-4">
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        name="paymentAgreed"
                        checked={formData.paymentAgreed}
                        onChange={handleChange}
                        required
                        className="mr-2 mt-1"
                      />
                      <span className="text-sm">
                        I agree to pay the CBOA the full amount within thirty days of the invoice date. 
                        For events starting on or after April 1st, I understand payment is required in advance.
                      </span>
                    </label>
                  </div>
                </div>
                
                {/* Event Contact */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-cboa-blue mb-4">Event Contact</h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="eventContactName" className="block text-sm font-semibold text-gray-700 mb-2">
                        Event Contact Name *
                      </label>
                      <input
                        type="text"
                        id="eventContactName"
                        name="eventContactName"
                        value={formData.eventContactName}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
                      />
                    </div>
                    <div>
                      <label htmlFor="eventContactEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                        Event Contact Email *
                      </label>
                      <input
                        type="email"
                        id="eventContactEmail"
                        name="eventContactEmail"
                        value={formData.eventContactEmail}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Event Type */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-cboa-blue mb-4">Event Details</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Event Type *
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="eventType"
                          value="exhibition"
                          onChange={(e) => {
                            handleChange(e)
                            setEventType('exhibition')
                          }}
                          required
                          className="mr-2"
                        />
                        <span>Exhibition Game(s)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="eventType"
                          value="league"
                          onChange={(e) => {
                            handleChange(e)
                            setEventType('league')
                          }}
                          required
                          className="mr-2"
                        />
                        <span>League</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="eventType"
                          value="tournament"
                          onChange={(e) => {
                            handleChange(e)
                            setEventType('tournament')
                          }}
                          required
                          className="mr-2"
                        />
                        <span>Tournament</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* League Details */}
                  {eventType === 'league' && (
                    <div className="bg-gray-50 rounded-lg p-4 mt-4">
                      <h4 className="font-bold text-cboa-blue mb-3">League Details</h4>
                      <div className="mb-4">
                        <label htmlFor="leagueName" className="block text-sm font-semibold text-gray-700 mb-2">
                          League Name *
                        </label>
                        <input
                          type="text"
                          id="leagueName"
                          name="leagueName"
                          value={formData.leagueName}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor="leagueStartDate" className="block text-sm font-semibold text-gray-700 mb-2">
                            Start Date *
                          </label>
                          <input
                            type="date"
                            id="leagueStartDate"
                            name="leagueStartDate"
                            value={formData.leagueStartDate}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
                          />
                        </div>
                        <div>
                          <label htmlFor="leagueEndDate" className="block text-sm font-semibold text-gray-700 mb-2">
                            End Date *
                          </label>
                          <input
                            type="date"
                            id="leagueEndDate"
                            name="leagueEndDate"
                            value={formData.leagueEndDate}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="leagueGender" className="block text-sm font-semibold text-gray-700 mb-2">
                            Player Gender *
                          </label>
                          <select
                            id="leagueGender"
                            name="leagueGender"
                            value={formData.leagueGender}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
                          >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="mixed">Mixed</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="leagueLevel" className="block text-sm font-semibold text-gray-700 mb-2">
                            Level of Play *
                          </label>
                          <select
                            id="leagueLevel"
                            name="leagueLevel"
                            value={formData.leagueLevel}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
                          >
                            <option value="">Select level</option>
                            {levelOptions.map(level => (
                              <option key={level} value={level}>{level}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Tournament Details */}
                  {eventType === 'tournament' && (
                    <div className="bg-gray-50 rounded-lg p-4 mt-4">
                      <h4 className="font-bold text-cboa-blue mb-3">Tournament Details</h4>
                      <div className="mb-4">
                        <label htmlFor="tournamentName" className="block text-sm font-semibold text-gray-700 mb-2">
                          Tournament Name *
                        </label>
                        <input
                          type="text"
                          id="tournamentName"
                          name="tournamentName"
                          value={formData.tournamentName}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="tournamentDates" className="block text-sm font-semibold text-gray-700 mb-2">
                          Tournament Dates *
                        </label>
                        <input
                          type="text"
                          id="tournamentDates"
                          name="tournamentDates"
                          value={formData.tournamentDates}
                          onChange={handleChange}
                          required
                          placeholder="e.g., March 15-17, 2024"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="tournamentGender" className="block text-sm font-semibold text-gray-700 mb-2">
                            Player Gender *
                          </label>
                          <select
                            id="tournamentGender"
                            name="tournamentGender"
                            value={formData.tournamentGender}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
                          >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="mixed">Mixed</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="tournamentLevel" className="block text-sm font-semibold text-gray-700 mb-2">
                            Level of Play *
                          </label>
                          <select
                            id="tournamentLevel"
                            name="tournamentLevel"
                            value={formData.tournamentLevel}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
                          >
                            <option value="">Select level</option>
                            {levelOptions.map(level => (
                              <option key={level} value={level}>{level}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Exhibition Details */}
                  {eventType === 'exhibition' && (
                    <div className="bg-gray-50 rounded-lg p-4 mt-4">
                      <h4 className="font-bold text-cboa-blue mb-3">Exhibition Game Details</h4>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor="exhibitionDate" className="block text-sm font-semibold text-gray-700 mb-2">
                            Game Date *
                          </label>
                          <input
                            type="date"
                            id="exhibitionDate"
                            name="exhibitionDate"
                            value={formData.exhibitionDate}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
                          />
                        </div>
                        <div>
                          <label htmlFor="numberOfGames" className="block text-sm font-semibold text-gray-700 mb-2">
                            Number of Games *
                          </label>
                          <input
                            type="number"
                            id="numberOfGames"
                            name="numberOfGames"
                            value={formData.numberOfGames}
                            onChange={handleChange}
                            required
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="exhibitionGender" className="block text-sm font-semibold text-gray-700 mb-2">
                            Player Gender *
                          </label>
                          <select
                            id="exhibitionGender"
                            name="exhibitionGender"
                            value={formData.exhibitionGender}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
                          >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="mixed">Mixed</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="exhibitionLevel" className="block text-sm font-semibold text-gray-700 mb-2">
                            Level of Play *
                          </label>
                          <select
                            id="exhibitionLevel"
                            name="exhibitionLevel"
                            value={formData.exhibitionLevel}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
                          >
                            <option value="">Select level</option>
                            {levelOptions.map(level => (
                              <option key={level} value={level}>{level}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Scheduling Information */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-cboa-blue mb-4">Scheduling Information</h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-3">
                      A member of the CBOA Scheduling and Assigning team will contact you after receiving your request. 
                      For best results, please provide your schedule in spreadsheet format for easy import into our 
                      assigning software.
                    </p>
                    <p className="text-sm text-gray-600">
                      Questions? Email: <a href="mailto:scheduler@cboa.ca" className="text-cboa-orange hover:text-cboa-blue">scheduler@cboa.ca</a>
                    </p>
                  </div>
                </div>
                
                {/* Discipline Policy */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-cboa-blue mb-4">Discipline Policy</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    To supply referees to your basketball event, CBOA requires that you have an enforceable supplemental 
                    discipline policy documented and made available to all participants and the CBOA. Your policy must be 
                    at minimum the equivalent of section 17.1 of the Calgary High School Athletic Association policy.
                  </p>
                  <p className="text-xs text-gray-600 mb-4">
                    Reference: <a href="http://www.calgaryhighschoolsports.ca/files/policy_17-violations_of_the_constitution-december_2018.docx" 
                    className="text-cboa-orange hover:text-cboa-blue" target="_blank" rel="noopener noreferrer">
                      CHSAA Policy Section 17.1
                    </a>
                  </p>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Discipline Policy *
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="disciplinePolicy"
                          value="chsaa"
                          onChange={handleChange}
                          required
                          className="mr-2"
                        />
                        <span>CHSAA / Rockyview / Foothills policy</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="disciplinePolicy"
                          value="own"
                          onChange={handleChange}
                          required
                          className="mr-2"
                        />
                        <span>Own Policy (will provide copy)</span>
                      </label>
                    </div>
                  </div>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <p className="text-sm text-gray-700">
                      <strong>Important:</strong> CBOA requires that all facilities where games are played have a member 
                      of the event organizing group present and available to address any situations that arise outside 
                      the purview of the game officials.
                    </p>
                  </div>
                </div>
                
                {/* Exclusivity Agreement */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-cboa-blue mb-4">Service Agreement</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-4">
                      Thank you for selecting the Calgary Basketball Officials Association (CBOA) as your choice for your 
                      basketball event held in the greater Calgary area. As the sole provincial and nationally certified 
                      basketball referee organization in the greater Calgary area, we look forward to providing you the 
                      services of our trained and qualified member officials to assist in making your event a success.
                    </p>
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        name="exclusivityAgreed"
                        checked={formData.exclusivityAgreed}
                        onChange={handleChange}
                        required
                        className="mr-2 mt-1"
                      />
                      <span className="text-sm">
                        <strong>Exclusivity Agreement:</strong> I agree that the Calgary Basketball Officials Association 
                        will be the sole and exclusive organization supplying basketball referees to our exhibition, 
                        tournament, and/or league games for the duration of our event.
                      </span>
                    </label>
                  </div>
                </div>
                
                <Button type="submit" size="lg" className="w-full">
                  Submit Request for Officials
                </Button>
              </form>
            </Card>
            
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