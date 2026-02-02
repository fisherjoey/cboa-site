'use client'

import { useState } from 'react'
import { Controller, useFieldArray } from 'react-hook-form'
import { IconPlus, IconTrash, IconChevronDown, IconChevronUp } from '@tabler/icons-react'

// Constants
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const LEVELS_OF_PLAY = [
  'U11', 'U13', 'U15', 'U17', 'U19',
  'Junior High', 'HS-JV', 'HS-SV',
  'College/University', 'Adult', 'Other'
]

const GENDERS = ['Male', 'Female']

const EVENT_TYPES = ['Exhibition Game(s)', 'League', 'Tournament'] as const

const DISCIPLINE_POLICIES = [
  'CHSAA / Rockyview / Foothills policy',
  'Own Policy (will provide copy)'
]

// Reusable styles
const inputStyles = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cboa-orange focus:border-transparent transition-colors"
const labelStyles = "block text-sm font-semibold text-gray-700 mb-1"
const errorStyles = "text-red-500 text-sm mt-1"

// CheckboxGroup Component
function CheckboxGroup({
  label,
  options,
  value = [],
  onChange,
  error,
  required
}: {
  label: string
  options: string[]
  value?: string[]
  onChange: (value: string[]) => void
  error?: string
  required?: boolean
}) {
  const handleToggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter(v => v !== option))
    } else {
      onChange([...value, option])
    }
  }

  return (
    <div className="mb-4">
      <label className={labelStyles}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
        {options.map(option => (
          <label key={option} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value.includes(option)}
              onChange={() => handleToggle(option)}
              className="w-4 h-4 text-cboa-orange border-gray-300 rounded focus:ring-cboa-orange"
            />
            <span className="text-sm text-gray-700">{option}</span>
          </label>
        ))}
      </div>
      {error && <p className={errorStyles}>{error}</p>}
    </div>
  )
}

// Get event type color
function getEventTypeColor(eventType: string): string {
  return eventType ? 'border-gray-300 bg-gray-50' : 'border-gray-300 bg-white'
}

// Get event type badge color
function getEventTypeBadgeColor(eventType: string): string {
  return 'bg-gray-100 text-gray-800'
}

// League Fields Component
function LeagueFields({ index, control, register, errors }: { index: number; control: any; register: any; errors: any }) {
  return (
    <div className="space-y-4 p-4 bg-white rounded-lg">
      <h5 className="font-semibold text-blue-800">League Details</h5>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`events.${index}.leagueName`} className={labelStyles}>
            League Name <span className="text-red-500">*</span>
          </label>
          <input
            id={`events.${index}.leagueName`}
            type="text"
            {...register(`events.${index}.leagueName`)}
            className={inputStyles}
          />
          {errors?.leagueName && <p className={errorStyles}>{errors.leagueName.message}</p>}
        </div>

        <div>
          <label htmlFor={`events.${index}.leagueStartDate`} className={labelStyles}>
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            id={`events.${index}.leagueStartDate`}
            type="date"
            {...register(`events.${index}.leagueStartDate`)}
            className={inputStyles}
          />
          {errors?.leagueStartDate && <p className={errorStyles}>{errors.leagueStartDate.message}</p>}
        </div>

        <div>
          <label htmlFor={`events.${index}.leagueEndDate`} className={labelStyles}>
            End Date <span className="text-red-500">*</span>
          </label>
          <input
            id={`events.${index}.leagueEndDate`}
            type="date"
            {...register(`events.${index}.leagueEndDate`)}
            className={inputStyles}
          />
          {errors?.leagueEndDate && <p className={errorStyles}>{errors.leagueEndDate.message}</p>}
        </div>
      </div>

      <Controller
        name={`events.${index}.leagueDaysOfWeek`}
        control={control}
        render={({ field }) => (
          <CheckboxGroup
            label="Days of Week"
            options={DAYS_OF_WEEK}
            value={field.value}
            onChange={field.onChange}
            error={errors?.leagueDaysOfWeek?.message}
            required
          />
        )}
      />

      <Controller
        name={`events.${index}.leaguePlayerGender`}
        control={control}
        render={({ field }) => (
          <CheckboxGroup
            label="Player Gender"
            options={GENDERS}
            value={field.value}
            onChange={field.onChange}
            error={errors?.leaguePlayerGender?.message}
            required
          />
        )}
      />

      <Controller
        name={`events.${index}.leagueLevelOfPlay`}
        control={control}
        render={({ field }) => (
          <CheckboxGroup
            label="Level of Play"
            options={LEVELS_OF_PLAY}
            value={field.value}
            onChange={field.onChange}
            error={errors?.leagueLevelOfPlay?.message}
            required
          />
        )}
      />
    </div>
  )
}

// Exhibition Fields Component with multiple games support
function ExhibitionFields({ index, control, register, errors }: { index: number; control: any; register: any; errors: any }) {
  const { fields: gameFields, append: appendGame, remove: removeGame } = useFieldArray({
    control,
    name: `events.${index}.exhibitionGames`,
  })

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg">
      <h5 className="font-semibold text-orange-800">Exhibition Game Details</h5>

      <div>
        <label htmlFor={`events.${index}.exhibitionGameLocation`} className={labelStyles}>
          Game Location <span className="text-red-500">*</span>
        </label>
        <input
          id={`events.${index}.exhibitionGameLocation`}
          type="text"
          {...register(`events.${index}.exhibitionGameLocation`)}
          className={inputStyles}
          placeholder="e.g., Calgary Sports Centre"
        />
        {errors?.exhibitionGameLocation && <p className={errorStyles}>{errors.exhibitionGameLocation.message}</p>}
      </div>

      {/* Multiple Games Section */}
      <div>
        <label className={labelStyles}>
          Game Dates & Times <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Add each game date/time. You can add multiple games for the same event.
        </p>

        <div className="space-y-3">
          {gameFields.map((field, gameIndex) => (
            <div key={field.id} className="flex flex-wrap gap-3 items-start p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex-1 min-w-[140px]">
                <label className="text-xs font-medium text-gray-600">Date</label>
                <input
                  type="date"
                  {...register(`events.${index}.exhibitionGames.${gameIndex}.date`)}
                  className={inputStyles}
                />
                {errors?.exhibitionGames?.[gameIndex]?.date && (
                  <p className={errorStyles}>{errors.exhibitionGames[gameIndex].date.message}</p>
                )}
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="text-xs font-medium text-gray-600">Start Time</label>
                <input
                  type="time"
                  {...register(`events.${index}.exhibitionGames.${gameIndex}.time`)}
                  className={inputStyles}
                />
                {errors?.exhibitionGames?.[gameIndex]?.time && (
                  <p className={errorStyles}>{errors.exhibitionGames[gameIndex].time.message}</p>
                )}
              </div>
              <div className="w-24">
                <label className="text-xs font-medium text-gray-600"># Games</label>
                <input
                  type="number"
                  min="1"
                  {...register(`events.${index}.exhibitionGames.${gameIndex}.numberOfGames`)}
                  className={inputStyles}
                  placeholder="1"
                />
                {errors?.exhibitionGames?.[gameIndex]?.numberOfGames && (
                  <p className={errorStyles}>{errors.exhibitionGames[gameIndex].numberOfGames.message}</p>
                )}
              </div>
              {gameFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeGame(gameIndex)}
                  className="mt-5 p-2 text-red-500 hover:bg-red-100 rounded-md transition-colors"
                  title="Remove game"
                >
                  <IconTrash size={18} />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => appendGame({ date: '', time: '', numberOfGames: '1' })}
          className="mt-3 flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-md transition-colors"
        >
          <IconPlus size={16} />
          Add Another Game Date/Time
        </button>

        {errors?.exhibitionGames && typeof errors.exhibitionGames.message === 'string' && (
          <p className={errorStyles}>{errors.exhibitionGames.message}</p>
        )}
      </div>

      <Controller
        name={`events.${index}.exhibitionPlayerGender`}
        control={control}
        render={({ field }) => (
          <CheckboxGroup
            label="Player Gender"
            options={GENDERS}
            value={field.value}
            onChange={field.onChange}
            error={errors?.exhibitionPlayerGender?.message}
            required
          />
        )}
      />

      <Controller
        name={`events.${index}.exhibitionLevelOfPlay`}
        control={control}
        render={({ field }) => (
          <CheckboxGroup
            label="Level of Play"
            options={LEVELS_OF_PLAY}
            value={field.value}
            onChange={field.onChange}
            error={errors?.exhibitionLevelOfPlay?.message}
            required
          />
        )}
      />
    </div>
  )
}

// Tournament Fields Component
function TournamentFields({ index, control, register, errors }: { index: number; control: any; register: any; errors: any }) {
  return (
    <div className="space-y-4 p-4 bg-white rounded-lg">
      <h5 className="font-semibold text-green-800">Tournament Details</h5>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`events.${index}.tournamentName`} className={labelStyles}>
            Tournament Name <span className="text-red-500">*</span>
          </label>
          <input
            id={`events.${index}.tournamentName`}
            type="text"
            {...register(`events.${index}.tournamentName`)}
            className={inputStyles}
          />
          {errors?.tournamentName && <p className={errorStyles}>{errors.tournamentName.message}</p>}
        </div>

        <div>
          <label htmlFor={`events.${index}.tournamentNumberOfGames`} className={labelStyles}>
            Estimated Number of Games <span className="text-red-500">*</span>
          </label>
          <input
            id={`events.${index}.tournamentNumberOfGames`}
            type="number"
            min="1"
            {...register(`events.${index}.tournamentNumberOfGames`)}
            className={inputStyles}
          />
          {errors?.tournamentNumberOfGames && <p className={errorStyles}>{errors.tournamentNumberOfGames.message}</p>}
        </div>

        <div>
          <label htmlFor={`events.${index}.tournamentStartDate`} className={labelStyles}>
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            id={`events.${index}.tournamentStartDate`}
            type="date"
            {...register(`events.${index}.tournamentStartDate`)}
            className={inputStyles}
          />
          {errors?.tournamentStartDate && <p className={errorStyles}>{errors.tournamentStartDate.message}</p>}
        </div>

        <div>
          <label htmlFor={`events.${index}.tournamentEndDate`} className={labelStyles}>
            End Date <span className="text-red-500">*</span>
          </label>
          <input
            id={`events.${index}.tournamentEndDate`}
            type="date"
            {...register(`events.${index}.tournamentEndDate`)}
            className={inputStyles}
          />
          {errors?.tournamentEndDate && <p className={errorStyles}>{errors.tournamentEndDate.message}</p>}
        </div>
      </div>

      <Controller
        name={`events.${index}.tournamentPlayerGender`}
        control={control}
        render={({ field }) => (
          <CheckboxGroup
            label="Player Gender"
            options={GENDERS}
            value={field.value}
            onChange={field.onChange}
            error={errors?.tournamentPlayerGender?.message}
            required
          />
        )}
      />

      <Controller
        name={`events.${index}.tournamentLevelOfPlay`}
        control={control}
        render={({ field }) => (
          <CheckboxGroup
            label="Level of Play"
            options={LEVELS_OF_PLAY}
            value={field.value}
            onChange={field.onChange}
            error={errors?.tournamentLevelOfPlay?.message}
            required
          />
        )}
      />
    </div>
  )
}

// Event Card Component
function EventCard({
  index,
  control,
  register,
  errors,
  watch,
  remove,
  canRemove,
}: {
  index: number
  control: any
  register: any
  errors: any
  watch: any
  remove: () => void
  canRemove: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const eventType = watch(`events.${index}.eventType`)
  const eventErrors = errors?.events?.[index]

  const getEventTitle = () => {
    if (!eventType) return `Event ${index + 1}`

    if (eventType === 'League') {
      const name = watch(`events.${index}.leagueName`)
      return name ? `${name}` : `Event ${index + 1}: League`
    }
    if (eventType === 'Tournament') {
      const name = watch(`events.${index}.tournamentName`)
      return name ? `${name}` : `Event ${index + 1}: Tournament`
    }
    if (eventType === 'Exhibition Game(s)') {
      const location = watch(`events.${index}.exhibitionGameLocation`)
      return location ? `Exhibition at ${location}` : `Event ${index + 1}: Exhibition`
    }
    return `Event ${index + 1}`
  }

  return (
    <div className={`border-2 rounded-lg overflow-hidden ${eventType ? getEventTypeColor(eventType) : 'border-gray-300 bg-white'}`}>
      {/* Card Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-opacity-80 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-cboa-blue text-white font-bold text-sm">
            {index + 1}
          </span>
          <div>
            <h4 className="font-semibold text-gray-800">{getEventTitle()}</h4>
            {eventType && (
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getEventTypeBadgeColor(eventType)}`}>
                {eventType}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canRemove && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                remove()
              }}
              className="p-2 text-red-500 hover:bg-red-100 rounded-md transition-colors"
              title="Remove event"
            >
              <IconTrash size={18} />
            </button>
          )}
          <button
            type="button"
            className="p-2 text-gray-500 hover:bg-gray-200 rounded-md transition-colors"
          >
            {isExpanded ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Card Content */}
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-gray-200">
          {/* Event Type Selection */}
          <div className="mb-4">
            <label className={labelStyles}>
              Event Type <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {EVENT_TYPES.map(type => (
                <label key={type} className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-white/50 transition-colors bg-white">
                  <input
                    type="radio"
                    value={type}
                    {...register(`events.${index}.eventType`)}
                    className="w-5 h-5 text-cboa-orange border-gray-300 focus:ring-cboa-orange"
                  />
                  <span className="text-gray-700 font-medium">{type}</span>
                </label>
              ))}
            </div>
            {eventErrors?.eventType && <p className={errorStyles}>{eventErrors.eventType.message}</p>}
          </div>

          {/* League Details */}
          {eventType === 'League' && (
            <LeagueFields
              index={index}
              control={control}
              register={register}
              errors={eventErrors}
            />
          )}

          {/* Exhibition Details */}
          {eventType === 'Exhibition Game(s)' && (
            <ExhibitionFields
              index={index}
              control={control}
              register={register}
              errors={eventErrors}
            />
          )}

          {/* Tournament Details */}
          {eventType === 'Tournament' && (
            <TournamentFields
              index={index}
              control={control}
              register={register}
              errors={eventErrors}
            />
          )}
        </div>
      )}
    </div>
  )
}

// Props interface
interface Step4EventsProps {
  register: any
  control: any
  errors: any
  watch: any
}

// Main Step4Events Component
export default function Step4Events({ register, control, errors, watch }: Step4EventsProps) {
  const { fields: eventFields, append: appendEvent, remove: removeEvent } = useFieldArray({
    control,
    name: 'events',
  })

  const events = watch('events')
  const eventCount = events?.length || 0

  const addNewEvent = () => {
    appendEvent({
      eventType: undefined as any,
      leagueDaysOfWeek: [],
      leaguePlayerGender: [],
      leagueLevelOfPlay: [],
      exhibitionPlayerGender: [],
      exhibitionLevelOfPlay: [],
      exhibitionGames: [{ date: '', time: '', numberOfGames: '1' }],
      tournamentPlayerGender: [],
      tournamentLevelOfPlay: [],
    })
  }

  return (
    <div className="space-y-6">
      {/* Events Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-cboa-blue">Events</h3>
          <span className="px-3 py-1 bg-cboa-blue text-white rounded-full text-sm font-medium">
            {eventCount} {eventCount === 1 ? 'Event' : 'Events'}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Add one or more events. Each event will be processed separately but share the same organization and contact information.
        </p>

        <div className="space-y-4">
          {eventFields.map((field, index) => (
            <EventCard
              key={field.id}
              index={index}
              control={control}
              register={register}
              errors={errors}
              watch={watch}
              remove={() => removeEvent(index)}
              canRemove={eventFields.length > 1}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={addNewEvent}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 text-cboa-blue font-semibold bg-blue-50 hover:bg-blue-100 border-2 border-dashed border-blue-300 rounded-lg transition-colors"
        >
          <IconPlus size={20} />
          Add Another Event
        </button>

        {errors.events && typeof errors.events.message === 'string' && (
          <p className={errorStyles}>{errors.events.message}</p>
        )}
      </div>

      {/* Discipline Policy Section */}
      <div>
        <h3 className="text-xl font-bold text-cboa-blue mb-4">Discipline Policy</h3>
        <p className="text-sm text-gray-600 mb-4">
          Which discipline policy will govern your event(s)?
        </p>
        <div className="space-y-3">
          {DISCIPLINE_POLICIES.map(policy => (
            <label key={policy} className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                value={policy}
                {...register('disciplinePolicy')}
                className="w-5 h-5 text-cboa-orange border-gray-300 focus:ring-cboa-orange"
              />
              <span className="text-gray-700">{policy}</span>
            </label>
          ))}
        </div>
        {errors.disciplinePolicy && <p className={errorStyles}>{errors.disciplinePolicy.message}</p>}
      </div>

      {/* Exclusivity Agreement Section */}
      <div>
        <h3 className="text-xl font-bold text-cboa-blue mb-4">Exclusivity Agreement</h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700">
            By checking this box, you agree that the Calgary Basketball Officials Association (CBOA) will be
            the <strong>exclusive provider</strong> of basketball officials for your event(s). This ensures consistent
            quality, coordination, and coverage for all your games.
          </p>
        </div>
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            {...register('agreement')}
            className="w-5 h-5 mt-0.5 text-cboa-orange border-gray-300 rounded focus:ring-cboa-orange"
          />
          <span className="text-gray-700">
            I agree that CBOA will be the exclusive provider of basketball officials for {eventCount === 1 ? 'this event' : 'these events'}. <span className="text-red-500">*</span>
          </span>
        </label>
        {errors.agreement && <p className={errorStyles}>{errors.agreement.message}</p>}
      </div>
    </div>
  )
}
