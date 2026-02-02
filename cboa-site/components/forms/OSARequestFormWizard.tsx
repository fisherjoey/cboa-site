'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { IconCheck, IconAlertCircle, IconLoader2, IconArrowLeft, IconArrowRight } from '@tabler/icons-react'

// Import wizard components
import ProgressIndicator from './wizard/ProgressIndicator'
import Step1Organization from './wizard/Step1Organization'
import Step2Billing from './wizard/Step2Billing'
import Step3EventContact from './wizard/Step3EventContact'
import Step4Events from './wizard/Step4Events'
import Step5Review from './wizard/Step5Review'

// ============================================
// Constants
// ============================================

const PROVINCES = [
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'ON', label: 'Ontario' },
  { value: 'QC', label: 'Quebec' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
  { value: 'YT', label: 'Yukon' },
]

const STORAGE_KEY = 'osa-form-draft'

// ============================================
// Validation Schemas
// ============================================

const PHONE_REGEX = /^(\+1[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}$/
const POSTAL_CODE_REGEX = /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/i

const phoneSchema = z.string()
  .optional()
  .refine(
    (val) => !val || val.trim() === '' || PHONE_REGEX.test(val.replace(/\s/g, '')),
    { message: 'Please enter a valid phone number' }
  )

const postalCodeSchema = z.string()
  .min(1, 'Postal code is required')
  .refine(
    (val) => POSTAL_CODE_REGEX.test(val.trim()),
    { message: 'Please enter a valid postal code' }
  )

const exhibitionGameSchema = z.object({
  date: z.string()
    .min(1, 'Date is required')
    .refine(
      (val) => {
        if (!val) return true
        const selectedDate = new Date(val)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return selectedDate >= today
      },
      { message: 'Date cannot be in the past' }
    ),
  time: z.string().min(1, 'Time is required'),
  numberOfGames: z.string()
    .min(1, 'Number of games is required')
    .refine(
      (val) => {
        const num = parseInt(val, 10)
        return !isNaN(num) && num >= 1 && num <= 50
      },
      { message: 'Enter a valid number (1-50)' }
    ),
})

const EVENT_TYPES = ['Exhibition Game(s)', 'League', 'Tournament'] as const

const eventSchema = z.object({
  eventType: z.enum(EVENT_TYPES, { message: 'Please select an event type' }),
  leagueName: z.string().optional(),
  leagueStartDate: z.string().optional(),
  leagueEndDate: z.string().optional(),
  leagueDaysOfWeek: z.array(z.string()).optional(),
  leaguePlayerGender: z.array(z.string()).optional(),
  leagueLevelOfPlay: z.array(z.string()).optional(),
  exhibitionGameLocation: z.string().optional(),
  exhibitionPlayerGender: z.array(z.string()).optional(),
  exhibitionLevelOfPlay: z.array(z.string()).optional(),
  exhibitionGames: z.array(exhibitionGameSchema).optional(),
  tournamentName: z.string().optional(),
  tournamentStartDate: z.string().optional(),
  tournamentEndDate: z.string().optional(),
  tournamentNumberOfGames: z.string().optional(),
  tournamentPlayerGender: z.array(z.string()).optional(),
  tournamentLevelOfPlay: z.array(z.string()).optional(),
}).superRefine((data, ctx) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (data.eventType === 'League') {
    if (!data.leagueName || data.leagueName.trim().length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'League name is required (min 2 characters)', path: ['leagueName'] })
    }
    if (!data.leagueStartDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Start date is required', path: ['leagueStartDate'] })
    } else {
      const startDate = new Date(data.leagueStartDate)
      if (startDate < today) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Start date cannot be in the past', path: ['leagueStartDate'] })
      }
    }
    if (!data.leagueEndDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'End date is required', path: ['leagueEndDate'] })
    } else if (data.leagueStartDate) {
      const startDate = new Date(data.leagueStartDate)
      const endDate = new Date(data.leagueEndDate)
      if (endDate < startDate) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'End date must be on or after start date', path: ['leagueEndDate'] })
      }
    }
    if (!data.leagueDaysOfWeek?.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select at least one day', path: ['leagueDaysOfWeek'] })
    }
    if (!data.leaguePlayerGender?.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select player gender', path: ['leaguePlayerGender'] })
    }
    if (!data.leagueLevelOfPlay?.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select level of play', path: ['leagueLevelOfPlay'] })
    }
  }

  if (data.eventType === 'Exhibition Game(s)') {
    if (!data.exhibitionGameLocation || data.exhibitionGameLocation.trim().length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Game location is required (min 2 characters)', path: ['exhibitionGameLocation'] })
    }
    if (!data.exhibitionGames?.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'At least one game is required', path: ['exhibitionGames'] })
    }
    if (!data.exhibitionPlayerGender?.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select player gender', path: ['exhibitionPlayerGender'] })
    }
    if (!data.exhibitionLevelOfPlay?.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select level of play', path: ['exhibitionLevelOfPlay'] })
    }
  }

  if (data.eventType === 'Tournament') {
    if (!data.tournamentName || data.tournamentName.trim().length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Tournament name is required (min 2 characters)', path: ['tournamentName'] })
    }
    if (!data.tournamentStartDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Start date is required', path: ['tournamentStartDate'] })
    } else {
      const startDate = new Date(data.tournamentStartDate)
      if (startDate < today) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Start date cannot be in the past', path: ['tournamentStartDate'] })
      }
    }
    if (!data.tournamentEndDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'End date is required', path: ['tournamentEndDate'] })
    } else if (data.tournamentStartDate) {
      const startDate = new Date(data.tournamentStartDate)
      const endDate = new Date(data.tournamentEndDate)
      if (endDate < startDate) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'End date must be on or after start date', path: ['tournamentEndDate'] })
      }
    }
    if (!data.tournamentNumberOfGames) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Estimated number of games is required', path: ['tournamentNumberOfGames'] })
    } else {
      const num = parseInt(data.tournamentNumberOfGames, 10)
      if (isNaN(num) || num < 1 || num > 500) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Enter a valid number (1-500)', path: ['tournamentNumberOfGames'] })
      }
    }
    if (!data.tournamentPlayerGender?.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select player gender', path: ['tournamentPlayerGender'] })
    }
    if (!data.tournamentLevelOfPlay?.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select level of play', path: ['tournamentLevelOfPlay'] })
    }
  }
})

const osaFormSchema = z.object({
  organizationName: z.string()
    .min(2, 'Organization name is required (min 2 characters)')
    .max(100, 'Organization name is too long (max 100 characters)'),
  billingContactName: z.string()
    .min(2, 'Billing contact name is required (min 2 characters)')
    .max(100, 'Name is too long (max 100 characters)'),
  billingEmail: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email is too long'),
  billingPhone: phoneSchema,
  billingAddress: z.string()
    .min(5, 'Billing address is required (min 5 characters)')
    .max(200, 'Address is too long (max 200 characters)'),
  billingCity: z.string()
    .min(2, 'City is required (min 2 characters)')
    .max(100, 'City name is too long'),
  billingProvince: z.string().min(1, 'Province is required'),
  billingPostalCode: postalCodeSchema,
  eventContactName: z.string()
    .min(2, 'Event contact name is required (min 2 characters)')
    .max(100, 'Name is too long (max 100 characters)'),
  eventContactEmail: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email is too long'),
  eventContactPhone: phoneSchema,
  events: z.array(eventSchema).min(1, 'At least one event is required'),
  disciplinePolicy: z.string().min(1, 'Please select a discipline policy'),
  agreement: z.boolean().refine(val => val === true, 'You must agree to the exclusivity agreement'),
})

type OSAFormData = z.infer<typeof osaFormSchema>

// ============================================
// Field groups for per-step validation
// ============================================

const STEP_FIELDS: Record<number, (keyof OSAFormData)[]> = {
  1: ['organizationName'],
  2: ['billingAddress', 'billingCity', 'billingProvince', 'billingPostalCode', 'billingContactName', 'billingEmail', 'billingPhone'],
  3: ['eventContactName', 'eventContactEmail', 'eventContactPhone'],
  4: ['events', 'disciplinePolicy', 'agreement'],
  5: [], // Review step - no validation needed
}

// ============================================
// Default form values
// ============================================

const getDefaultValues = (): OSAFormData => ({
  organizationName: '',
  billingContactName: '',
  billingEmail: '',
  billingPhone: '',
  billingAddress: '',
  billingCity: '',
  billingProvince: 'AB',
  billingPostalCode: '',
  eventContactName: '',
  eventContactEmail: '',
  eventContactPhone: '',
  events: [{
    eventType: undefined as any,
    leagueDaysOfWeek: [],
    leaguePlayerGender: [],
    leagueLevelOfPlay: [],
    exhibitionPlayerGender: [],
    exhibitionLevelOfPlay: [],
    exhibitionGames: [{ date: '', time: '', numberOfGames: '1' }],
    tournamentPlayerGender: [],
    tournamentLevelOfPlay: [],
  }],
  disciplinePolicy: '',
  agreement: false,
})

// ============================================
// Main Wizard Component
// ============================================

export default function OSARequestFormWizard() {
  const router = useRouter()
  const formRef = useRef<HTMLDivElement>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    control,
    trigger,
    getValues,
    reset,
    formState: { errors }
  } = useForm<OSAFormData>({
    resolver: zodResolver(osaFormSchema),
    defaultValues: getDefaultValues(),
    mode: 'onTouched',
  })

  const events = watch('events')
  const eventCount = events?.length || 0

  // ============================================
  // localStorage persistence
  // ============================================

  // Load saved form data on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.formData) {
          reset(parsed.formData)
        }
        if (parsed.currentStep) {
          setCurrentStep(parsed.currentStep)
        }
      }
    } catch (e) {
      console.error('Failed to load saved form data:', e)
    }
    setIsHydrated(true)
  }, [reset])

  // Save form data on changes
  const saveToStorage = useCallback(() => {
    if (!isHydrated) return
    try {
      const data = {
        formData: getValues(),
        currentStep,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error('Failed to save form data:', e)
    }
  }, [getValues, currentStep, isHydrated])

  // Auto-save on step change and form changes
  useEffect(() => {
    if (isHydrated) {
      saveToStorage()
    }
  }, [currentStep, saveToStorage, isHydrated])

  // Save form data periodically (every 5 seconds while typing)
  useEffect(() => {
    if (!isHydrated) return
    const interval = setInterval(saveToStorage, 5000)
    return () => clearInterval(interval)
  }, [saveToStorage, isHydrated])

  // Clear storage on successful submit
  const clearStorage = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      console.error('Failed to clear storage:', e)
    }
  }

  // ============================================
  // Navigation handlers
  // ============================================

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 5) {
      setCurrentStep(step)
      scrollToForm()
    }
  }

  const handleNext = async () => {
    // Validate current step fields
    const fieldsToValidate = STEP_FIELDS[currentStep]
    const isValid = await trigger(fieldsToValidate)

    if (isValid) {
      saveToStorage()
      setCurrentStep(prev => Math.min(prev + 1, 5))
      scrollToForm()
    }
  }

  const handleBack = () => {
    saveToStorage()
    setCurrentStep(prev => Math.max(prev - 1, 1))
    scrollToForm()
  }

  // ============================================
  // Form submission
  // ============================================

  const onSubmit = async (data: OSAFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const payload = {
        organizationName: data.organizationName,
        billingContactName: data.billingContactName,
        billingEmail: data.billingEmail,
        billingPhone: data.billingPhone,
        billingAddress: data.billingAddress,
        billingCity: data.billingCity,
        billingProvince: data.billingProvince,
        billingPostalCode: data.billingPostalCode,
        eventContactName: data.eventContactName,
        eventContactEmail: data.eventContactEmail,
        eventContactPhone: data.eventContactPhone,
        disciplinePolicy: data.disciplinePolicy,
        agreement: data.agreement,
        submissionTime: new Date().toISOString(),
        events: data.events.map((event, idx) => ({
          eventIndex: idx + 1,
          eventType: event.eventType,
          leagueName: event.leagueName,
          leagueStartDate: event.leagueStartDate,
          leagueEndDate: event.leagueEndDate,
          leagueDaysOfWeek: event.leagueDaysOfWeek?.join(', '),
          leaguePlayerGender: event.leaguePlayerGender?.join(', '),
          leagueLevelOfPlay: event.leagueLevelOfPlay?.join(', '),
          exhibitionGameLocation: event.exhibitionGameLocation,
          exhibitionGames: event.exhibitionGames,
          exhibitionPlayerGender: event.exhibitionPlayerGender?.join(', '),
          exhibitionLevelOfPlay: event.exhibitionLevelOfPlay?.join(', '),
          tournamentName: event.tournamentName,
          tournamentStartDate: event.tournamentStartDate,
          tournamentEndDate: event.tournamentEndDate,
          tournamentNumberOfGames: event.tournamentNumberOfGames,
          tournamentPlayerGender: event.tournamentPlayerGender?.join(', '),
          tournamentLevelOfPlay: event.tournamentLevelOfPlay?.join(', '),
        })),
      }

      const response = await fetch('/.netlify/functions/osa-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit form')
      }

      clearStorage()
      router.push('/get-officials/success')
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ============================================
  // Render
  // ============================================

  // Don't render until hydrated to avoid mismatch
  if (!isHydrated) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <IconLoader2 className="animate-spin text-cboa-orange" size={32} />
        </div>
      </Card>
    )
  }

  return (
    <div ref={formRef}>
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Progress Indicator */}
        <ProgressIndicator
          currentStep={currentStep}
          onStepClick={(step) => {
            // Only allow clicking on completed steps
            if (step < currentStep) {
              goToStep(step)
            }
          }}
        />

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 1 && (
            <Step1Organization
              register={register}
              errors={errors}
            />
          )}

          {currentStep === 2 && (
            <Step2Billing
              register={register}
              control={control}
              errors={errors}
            />
          )}

          {currentStep === 3 && (
            <Step3EventContact
              register={register}
              control={control}
              errors={errors}
            />
          )}

          {currentStep === 4 && (
            <Step4Events
              register={register}
              control={control}
              errors={errors}
              watch={watch}
            />
          )}

          {currentStep === 5 && (
            <Step5Review
              watch={watch}
              onEditStep={goToStep}
              eventCount={eventCount}
            />
          )}
        </div>

        {/* Submit Error */}
        {submitError && currentStep === 5 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <IconAlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-red-700">Submission Error</p>
              <p className="text-red-600 text-sm">{submitError}</p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          {/* Back Button */}
          {currentStep > 1 && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
              className="sm:order-1"
            >
              <IconArrowLeft size={18} className="mr-2" />
              Back
            </Button>
          )}

          {/* Spacer for desktop */}
          {currentStep > 1 && <div className="hidden sm:block flex-1 sm:order-2" />}

          {/* Next/Submit Button */}
          {currentStep < 5 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="sm:order-3 sm:ml-auto"
            >
              Next
              <IconArrowRight size={18} className="ml-2" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="lg"
              className="sm:order-3 sm:ml-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <IconLoader2 className="animate-spin mr-2" size={20} />
                  Submitting...
                </>
              ) : (
                <>
                  <IconCheck className="mr-2" size={20} />
                  Submit {eventCount} {eventCount === 1 ? 'Event' : 'Events'}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Privacy Notice */}
        <p className="text-xs text-gray-500 text-center">
          Your information will be used to process your officiating services request and will be stored securely.
          Contact <a href="mailto:scheduler@cboa.ca" className="text-cboa-orange hover:text-cboa-blue">scheduler@cboa.ca</a> with any questions.
        </p>
      </form>
    </Card>
    </div>
  )
}
