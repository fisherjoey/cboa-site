import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FilterBar from '@/components/molecules/FilterBar'

describe('FilterBar Molecule', () => {
  const defaultProps = {
    searchQuery: '',
    onSearchChange: jest.fn(),
    selectedCategory: '',
    onCategoryChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render search input', () => {
      render(<FilterBar {...defaultProps} />)

      expect(screen.getByLabelText('Search')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Search rules...')).toBeInTheDocument()
    })

    it('should render category select', () => {
      render(<FilterBar {...defaultProps} />)

      expect(screen.getByText('Category')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /all categories/i })).toBeInTheDocument()
    })

    it('should display current search query', () => {
      render(<FilterBar {...defaultProps} searchQuery="test query" />)

      expect(screen.getByDisplayValue('test query')).toBeInTheDocument()
    })

    it('should display selected category', () => {
      render(<FilterBar {...defaultProps} selectedCategory="School League" />)

      const button = screen.getByRole('button')
      expect(button).toHaveTextContent('School League')
    })

    it('should render default categories when opened', async () => {
      const user = userEvent.setup()
      render(<FilterBar {...defaultProps} />)

      // Open the dropdown
      await user.click(screen.getByRole('button'))

      expect(screen.getByText('All Categories')).toBeInTheDocument()
      expect(screen.getByText('School League')).toBeInTheDocument()
      expect(screen.getByText('School Tournament')).toBeInTheDocument()
      expect(screen.getByText('Club League')).toBeInTheDocument()
      expect(screen.getByText('Club Tournament')).toBeInTheDocument()
      expect(screen.getByText('Adult')).toBeInTheDocument()
    })

    it('should render custom categories when provided', async () => {
      const user = userEvent.setup()
      const customCategories = ['Category 1', 'Category 2']
      render(<FilterBar {...defaultProps} categories={customCategories} />)

      // Open the dropdown
      await user.click(screen.getByRole('button'))

      expect(screen.getByText('Category 1')).toBeInTheDocument()
      expect(screen.getByText('Category 2')).toBeInTheDocument()
      expect(screen.queryByText('School League')).not.toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('should call onSearchChange when typing in search input', async () => {
      const handleSearchChange = jest.fn()
      const user = userEvent.setup()

      render(
        <FilterBar
          {...defaultProps}
          onSearchChange={handleSearchChange}
        />
      )

      const searchInput = screen.getByLabelText('Search')
      await user.type(searchInput, 'test')

      expect(handleSearchChange).toHaveBeenCalledTimes(4) // Once for each character
      expect(handleSearchChange).toHaveBeenLastCalledWith('t')
    })

    it('should call onCategoryChange when selecting a category', async () => {
      const handleCategoryChange = jest.fn()
      const user = userEvent.setup()

      render(
        <FilterBar
          {...defaultProps}
          onCategoryChange={handleCategoryChange}
        />
      )

      // Open the dropdown
      await user.click(screen.getByRole('button'))

      // Select an option
      await user.click(screen.getByText('Club Tournament'))

      expect(handleCategoryChange).toHaveBeenCalledWith('Club Tournament')
    })

    it('should handle clearing category selection', async () => {
      const handleCategoryChange = jest.fn()
      const user = userEvent.setup()

      render(
        <FilterBar
          {...defaultProps}
          selectedCategory="School League"
          onCategoryChange={handleCategoryChange}
        />
      )

      // Open the dropdown
      await user.click(screen.getByRole('button'))

      // Select "All Categories" (empty value)
      await user.click(screen.getByText('All Categories'))

      expect(handleCategoryChange).toHaveBeenCalledWith('')
    })
  })

  describe('Responsive Layout', () => {
    it('should use grid layout for inputs', () => {
      render(<FilterBar {...defaultProps} />)

      const container = screen.getByLabelText('Search').closest('.grid')
      expect(container).toHaveClass('grid-cols-1', 'md:grid-cols-2')
    })
  })
})
