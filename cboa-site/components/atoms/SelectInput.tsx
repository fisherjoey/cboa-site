import { useId } from 'react'

interface Option {
  value: string
  label: string
}

interface OptionGroup {
  group: string
  options: Option[]
}

interface SelectInputProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options?: Option[]
  groupedOptions?: OptionGroup[]
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
  className?: string
  name?: string
}

export default function SelectInput({
  label,
  value,
  onChange,
  options = [],
  groupedOptions,
  placeholder,
  error,
  disabled = false,
  required = false,
  className = '',
  name,
}: SelectInputProps) {
  // Generate unique IDs for accessibility
  const selectId = useId()
  const errorId = useId()

  // Handle change events
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!disabled) {
      onChange(e.target.value)
    }
  }

  // Determine select classes based on state
  const selectClasses = [
    'w-full',
    'px-3',
    'py-2',
    'border',
    'rounded-lg',
    'transition-colors',
    'focus:outline-none',
    'focus:ring-2',
    'appearance-none',
    'bg-white',
    'cursor-pointer',
    error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500',
    disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : '',
    className,
  ].filter(Boolean).join(' ')

  // Render options
  const renderOptions = () => {
    if (groupedOptions) {
      return groupedOptions.map((group) => (
        <optgroup key={group.group} label={group.group}>
          {group.options.map((option) => (
            <option key={`${group.group}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </optgroup>
      ))
    }

    return options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))
  }

  // Check if we have any options
  const hasOptions = (options && options.length > 0) || (groupedOptions && groupedOptions.length > 0)

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          name={name || label}
          value={value}
          onChange={handleChange}
          disabled={disabled || !hasOptions}
          required={required}
          className={selectClasses}
          aria-label={label}
          aria-invalid={!!error}
          aria-required={required}
          aria-describedby={error ? errorId : undefined}
        >
          {placeholder && (
            <option value="" disabled={required}>
              {hasOptions ? placeholder : placeholder || 'No options available'}
            </option>
          )}
          {renderOptions()}
        </select>

        {/* Custom arrow icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {error && (
        <p
          id={errorId}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}