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
      
      expect(screen.getByLabelText('Category')).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('should display current search query', () => {
      render(<FilterBar {...defaultProps} searchQuery="test query" />)
      
      expect(screen.getByDisplayValue('test query')).toBeInTheDocument()
    })

    it('should display selected category', () => {
      render(<FilterBar {...defaultProps} selectedCategory="School League" />)
      
      const select = screen.getByRole('combobox') as HTMLSelectElement
      expect(select.value).toBe('School League')
    })

    it('should render default categories', () => {
      render(<FilterBar {...defaultProps} />)
      
      const select = screen.getByRole('combobox')
      expect(select).toContainHTML('All Categories')
      expect(select).toContainHTML('School League')
      expect(select).toContainHTML('School Tournament')
      expect(select).toContainHTML('Club League')
      expect(select).toContainHTML('Club Tournament')
      expect(select).toContainHTML('Adult')
    })

    it('should render custom categories when provided', () => {
      const customCategories = ['Category 1', 'Category 2']
      render(<FilterBar {...defaultProps} categories={customCategories} />)
      
      const select = screen.getByRole('combobox')
      expect(select).toContainHTML('Category 1')
      expect(select).toContainHTML('Category 2')
      expect(select).not.toContainHTML('School League')
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
      
      const categorySelect = screen.getByLabelText('Category')
      await user.selectOptions(categorySelect, 'Club Tournament')
      
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
      
      const categorySelect = screen.getByLabelText('Category')
      await user.selectOptions(categorySelect, '')
      
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