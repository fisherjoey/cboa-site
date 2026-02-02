'use client'

import { IconCheck, IconPencil } from '@tabler/icons-react'
import { UseFormWatch } from 'react-hook-form'

interface Step5ReviewProps {
  watch: UseFormWatch<any>
  onEditStep: (step: number) => void
  eventCount: number
}

// Format date to readable string
const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// Format time to 12-hour format
const formatTime = (timeString: string): string => {
  if (!timeString) return 'N/A'
  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${displayHour}:${minutes} ${ampm}`
}

// Get province full name
const getProvinceName = (code: string): string => {
  const provinces: Record<string, string> = {
    'AB': 'Alberta',
    'BC': 'British Columbia',
    'SK': 'Saskatchewan',
    'MB': 'Manitoba',
    'ON': 'Ontario',
    'QC': 'Quebec',
    'NB': 'New Brunswick',
    'NS': 'Nova Scotia',
    'PE': 'Prince Edward Island',
    'NL': 'Newfoundland and Labrador',
    'NT': 'Northwest Territories',
    'NU': 'Nunavut',
    'YT': 'Yukon',
  }
  return provinces[code] || code
}

export default function Step5Review({ watch, onEditStep, eventCount }: Step5ReviewProps) {
  const organizationName = watch('organizationName')

  const billingContactName = watch('billingContactName')
  const billingEmail = watch('billingEmail')
  const billingPhone = watch('billingPhone')
  const billingAddress = watch('billingAddress')
  const billingCity = watch('billingCity')
  const billingProvince = watch('billingProvince')
  const billingPostalCode = watch('billingPostalCode')

  const eventContactName = watch('eventContactName')
  const eventContactEmail = watch('eventContactEmail')
  const eventContactPhone = watch('eventContactPhone')

  const events = watch('events') || []
  const disciplinePolicy = watch('disciplinePolicy')
  const agreement = watch('agreement')

  return (
    <div className="space-y-6">
      {/* Organization Section */}
      <div className="border border-gray-300 rounded-lg p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-cboa-blue">Organization Information</h3>
          <button
            type="button"
            onClick={() => onEditStep(1)}
            className="flex items-center gap-1 text-sm text-cboa-orange hover:text-orange-700 transition-colors"
          >
            <IconPencil size={16} />
            Edit
          </button>
        </div>
        <div>
          <p className="text-gray-900 font-medium">{organizationName || 'N/A'}</p>
        </div>
      </div>

      {/* Billing Section */}
      <div className="border border-gray-300 rounded-lg p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-cboa-blue">Billing Information</h3>
          <button
            type="button"
            onClick={() => onEditStep(2)}
            className="flex items-center gap-1 text-sm text-cboa-orange hover:text-orange-700 transition-colors"
          >
            <IconPencil size={16} />
            Edit
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Contact Name</p>
            <p className="text-gray-900 font-medium">{billingContactName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-gray-900 font-medium">{billingEmail || 'N/A'}</p>
          </div>
          {billingPhone && (
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-gray-900 font-medium">{billingPhone}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">Address</p>
            <p className="text-gray-900 font-medium">
              {billingAddress || 'N/A'}
              {billingAddress && <br />}
              {billingCity && billingProvince && billingPostalCode && (
                <>
                  {billingCity}, {getProvinceName(billingProvince)} {billingPostalCode}
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Event Contact Section */}
      <div className="border border-gray-300 rounded-lg p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-cboa-blue">Event Contact</h3>
          <button
            type="button"
            onClick={() => onEditStep(3)}
            className="flex items-center gap-1 text-sm text-cboa-orange hover:text-orange-700 transition-colors"
          >
            <IconPencil size={16} />
            Edit
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Contact Name</p>
            <p className="text-gray-900 font-medium">{eventContactName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-gray-900 font-medium">{eventContactEmail || 'N/A'}</p>
          </div>
          {eventContactPhone && (
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-gray-900 font-medium">{eventContactPhone}</p>
            </div>
          )}
        </div>
      </div>

      {/* Events Section */}
      <div className="border border-gray-300 rounded-lg p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-cboa-blue">Events ({eventCount})</h3>
          <button
            type="button"
            onClick={() => onEditStep(4)}
            className="flex items-center gap-1 text-sm text-cboa-orange hover:text-orange-700 transition-colors"
          >
            <IconPencil size={16} />
            Edit
          </button>
        </div>
        <div className="space-y-4">
          {events.map((event: any, index: number) => (
            <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-cboa-blue text-white font-bold text-sm flex-shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 space-y-2">
                  {/* Event Type Badge */}
                  <div>
                    <span className="inline-block px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-medium">
                      {event.eventType || 'N/A'}
                    </span>
                  </div>

                  {/* League Details */}
                  {event.eventType === 'League' && (
                    <>
                      <div>
                        <p className="text-sm text-gray-600">League Name</p>
                        <p className="text-gray-900 font-medium">{event.leagueName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Dates</p>
                        <p className="text-gray-900">
                          {formatDate(event.leagueStartDate)} - {formatDate(event.leagueEndDate)}
                        </p>
                      </div>
                      {event.leagueDaysOfWeek && event.leagueDaysOfWeek.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600">Days of Week</p>
                          <p className="text-gray-900">{event.leagueDaysOfWeek.join(', ')}</p>
                        </div>
                      )}
                      {event.leaguePlayerGender && event.leaguePlayerGender.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600">Gender</p>
                          <p className="text-gray-900">{event.leaguePlayerGender.join(', ')}</p>
                        </div>
                      )}
                      {event.leagueLevelOfPlay && event.leagueLevelOfPlay.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600">Level of Play</p>
                          <p className="text-gray-900">{event.leagueLevelOfPlay.join(', ')}</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Tournament Details */}
                  {event.eventType === 'Tournament' && (
                    <>
                      <div>
                        <p className="text-sm text-gray-600">Tournament Name</p>
                        <p className="text-gray-900 font-medium">{event.tournamentName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Dates</p>
                        <p className="text-gray-900">
                          {formatDate(event.tournamentStartDate)} - {formatDate(event.tournamentEndDate)}
                        </p>
                      </div>
                      {event.tournamentNumberOfGames && (
                        <div>
                          <p className="text-sm text-gray-600">Number of Games</p>
                          <p className="text-gray-900">{event.tournamentNumberOfGames}</p>
                        </div>
                      )}
                      {event.tournamentPlayerGender && event.tournamentPlayerGender.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600">Gender</p>
                          <p className="text-gray-900">{event.tournamentPlayerGender.join(', ')}</p>
                        </div>
                      )}
                      {event.tournamentLevelOfPlay && event.tournamentLevelOfPlay.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600">Level of Play</p>
                          <p className="text-gray-900">{event.tournamentLevelOfPlay.join(', ')}</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Exhibition Details */}
                  {event.eventType === 'Exhibition Game(s)' && (
                    <>
                      <div>
                        <p className="text-sm text-gray-600">Facility/Location</p>
                        <p className="text-gray-900 font-medium">{event.exhibitionGameLocation || 'N/A'}</p>
                      </div>
                      {event.exhibitionGames && event.exhibitionGames.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600">Game Times</p>
                          <div className="mt-1 space-y-1">
                            {event.exhibitionGames.map((game: any, gameIndex: number) => (
                              <p key={gameIndex} className="text-gray-900 text-sm">
                                {formatDate(game.date)} at {formatTime(game.time)}
                                {game.numberOfGames && game.numberOfGames !== '1' && ` (${game.numberOfGames} games)`}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                      {event.exhibitionGames && event.exhibitionGames.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600">Total Number of Games</p>
                          <p className="text-gray-900">
                            {event.exhibitionGames.reduce((sum: number, game: any) => {
                              const num = parseInt(game.numberOfGames || '0', 10)
                              return sum + (isNaN(num) ? 0 : num)
                            }, 0)}
                          </p>
                        </div>
                      )}
                      {event.exhibitionPlayerGender && event.exhibitionPlayerGender.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600">Gender</p>
                          <p className="text-gray-900">{event.exhibitionPlayerGender.join(', ')}</p>
                        </div>
                      )}
                      {event.exhibitionLevelOfPlay && event.exhibitionLevelOfPlay.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600">Level of Play</p>
                          <p className="text-gray-900">{event.exhibitionLevelOfPlay.join(', ')}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agreements Section */}
      <div className="border border-gray-300 rounded-lg p-6 bg-white">
        <h3 className="text-lg font-bold text-cboa-blue mb-4">Agreements & Policies</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <IconCheck size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Discipline Policy</p>
              <p className="text-gray-900 font-medium">{disciplinePolicy || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <IconCheck size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Exclusivity Agreement</p>
              <p className="text-gray-900 font-medium">
                {agreement ? 'Acknowledged' : 'Not acknowledged'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
