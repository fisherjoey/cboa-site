import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SelectInput from '@/components/atoms/SelectInput'

describe('SelectInput Atom', () => {
  const mockOptions = [
    { value: 'school-league', label: 'School League' },
    { value: 'club-tournament', label: 'Club Tournament' },
    { value: 'adult', label: 'Adult' },
  ]

  describe('Rendering', () => {
    it('should render with a label', () => {
      render(
        <SelectInput
          label="Category"
          value=""
          onChange={() => {}}
          options={mockOptions}
        />
      )
      expect(screen.getByText('Category')).toBeInTheDocument()
    })

    it('should render all options', () => {
      render(
        <SelectInput
          label="Category"
          value=""
          onChange={() => {}}
          options={mockOptions}
        />
      )

      const select = screen.getByRole('combobox')
      mockOptions.forEach(option => {
        expect(select).toContainHTML(option.label)
      })
    })

    it('should display the selected value', () => {
      render(
        <SelectInput
          label="Category"
          value="adult"
          onChange={() => {}}
          options={mockOptions}
        />
      )

      const select = screen.getByRole('combobox') as HTMLSelectElement
      expect(select.value).toBe('adult')
    })

    it('should show placeholder when no value selected', () => {
      render(
        <SelectInput
          label="Category"
          value=""
          onChange={() => {}}
          options={mockOptions}
          placeholder="Choose a category..."
        />
      )

      expect(screen.getByText('Choose a category...')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should call onChange when option selected', async () => {
      const handleChange = jest.fn()
      const user = userEvent.setup()

      render(
        <SelectInput
          label="Category"
          value=""
          onChange={handleChange}
          options={mockOptions}
        />
      )

      const select = screen.getByRole('combobox')
      await user.selectOptions(select, 'club-tournament')

      expect(handleChange).toHaveBeenCalledWith('club-tournament')
    })

    it('should not call onChange when disabled', async () => {
      const handleChange = jest.fn()
      const user = userEvent.setup()

      render(
        <SelectInput
          label="Category"
          value=""
          onChange={handleChange}
          options={mockOptions}
          disabled
        />
      )

      const select = screen.getByRole('combobox')
      await user.selectOptions(select, 'adult')

      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe('States', () => {
    it('should show error state', () => {
      render(
        <SelectInput
          label="Category"
          value=""
          onChange={() => {}}
          options={mockOptions}
          error="Please select a category"
        />
      )

      expect(screen.getByText('Please select a category')).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toHaveClass('border-red-500')
    })

    it('should show disabled state', () => {
      render(
        <SelectInput
          label="Category"
          value="adult"
          onChange={() => {}}
          options={mockOptions}
          disabled
        />
      )

      const select = screen.getByRole('combobox')
      expect(select).toBeDisabled()
      expect(select).toHaveClass('bg-gray-50')
    })

    it('should show required indicator', () => {
      render(
        <SelectInput
          label="Category"
          value=""
          onChange={() => {}}
          options={mockOptions}
          required
        />
      )

      expect(screen.getByText('*')).toBeInTheDocument()
      expect(screen.getByText('*')).toHaveClass('text-red-500')
    })
  })

  describe('Option Groups', () => {
    it('should support grouped options', () => {
      const groupedOptions = [
        {
          group: 'School',
          options: [
            { value: 'school-league', label: 'School League' },
            { value: 'school-tournament', label: 'School Tournament' },
          ],
        },
        {
          group: 'Club',
          options: [
            { value: 'club-league', label: 'Club League' },
            { value: 'club-tournament', label: 'Club Tournament' },
          ],
        },
      ]

      render(
        <SelectInput
          label="Category"
          value=""
          onChange={() => {}}
          groupedOptions={groupedOptions}
        />
      )

      // Check that optgroups are rendered
      const select = screen.getByRole('combobox')
      expect(select.innerHTML).toContain('School')
      expect(select.innerHTML).toContain('Club')
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-label', () => {
      render(
        <SelectInput
          label="Category"
          value=""
          onChange={() => {}}
          options={mockOptions}
        />
      )

      const select = screen.getByRole('combobox')
      expect(select).toHaveAttribute('aria-label', 'Category')
    })

    it('should have aria-invalid when error', () => {
      render(
        <SelectInput
          label="Category"
          value=""
          onChange={() => {}}
          options={mockOptions}
          error="Invalid selection"
        />
      )

      const select = screen.getByRole('combobox')
      expect(select).toHaveAttribute('aria-invalid', 'true')
    })

    it('should have aria-required when required', () => {
      render(
        <SelectInput
          label="Category"
          value=""
          onChange={() => {}}
          options={mockOptions}
          required
        />
      )

      const select = screen.getByRole('combobox')
      expect(select).toHaveAttribute('aria-required', 'true')
    })

    it('should have aria-describedby for error message', () => {
      render(
        <SelectInput
          label="Category"
          value=""
          onChange={() => {}}
          options={mockOptions}
          error="Error message"
        />
      )

      const select = screen.getByRole('combobox')
      const errorId = select.getAttribute('aria-describedby')
      expect(errorId).toBeTruthy()

      const errorElement = document.getElementById(errorId!)
      expect(errorElement).toHaveTextContent('Error message')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty options array', () => {
      render(
        <SelectInput
          label="Category"
          value=""
          onChange={() => {}}
          options={[]}
          placeholder="No options available"
        />
      )

      expect(screen.getByText('No options available')).toBeInTheDocument()
    })

    it('should handle options with same value', () => {
      const duplicateOptions = [
        { value: 'same', label: 'Option 1' },
        { value: 'same', label: 'Option 2' },
      ]

      render(
        <SelectInput
          label="Category"
          value="same"
          onChange={() => {}}
          options={duplicateOptions}
        />
      )

      const select = screen.getByRole('combobox') as HTMLSelectElement
      expect(select.value).toBe('same')
    })
  })
})