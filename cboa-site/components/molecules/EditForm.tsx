import { useState } from 'react'
import TextInput from '@/components/atoms/TextInput'
import SelectInput from '@/components/atoms/SelectInput'
import { RuleModification } from '@/lib/adapters/types'

interface EditFormProps {
  rule?: Partial<RuleModification>
  onSubmit: (data: Partial<RuleModification>) => void
  onCancel: () => void
  isCreating?: boolean
}

const CATEGORIES = [
  'School League',
  'School Tournament', 
  'Club League',
  'Club Tournament',
  'Adult',
]

export default function EditForm({
  rule = {},
  onSubmit,
  onCancel,
  isCreating = false,
}: EditFormProps) {
  const [formData, setFormData] = useState<Partial<RuleModification>>({
    title: rule.title || '',
    category: rule.category || '',
    summary: rule.summary || '',
    content: rule.content || '',
    date: rule.date || new Date().toISOString().split('T')[0],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (!formData.summary?.trim()) {
      newErrors.summary = 'Summary is required'
    }

    if (!formData.content?.trim()) {
      newErrors.content = 'Content is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const categoryOptions = CATEGORIES.map(cat => ({ value: cat, label: cat }))

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <TextInput
        label="Title"
        value={formData.title || ''}
        onChange={(value) => setFormData({ ...formData, title: value })}
        error={errors.title}
        required
      />

      <SelectInput
        label="Category"
        value={formData.category || ''}
        onChange={(value) => setFormData({ ...formData, category: value })}
        options={categoryOptions}
        error={errors.category}
        required
      />

      <TextInput
        label="Summary"
        value={formData.summary || ''}
        onChange={(value) => setFormData({ ...formData, summary: value })}
        error={errors.summary}
        required
      />

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Content <span className="text-red-500">*</span>
        </label>
        <textarea
          id="content"
          value={formData.content || ''}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.content ? 'border-red-500' : 'border-gray-300'
          }`}
          rows={10}
          required
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content}</p>
        )}
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          {isCreating ? 'Create' : 'Save'}
        </button>
      </div>
    </form>
  )
}