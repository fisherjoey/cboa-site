import TextInput from '@/components/atoms/TextInput'
import SelectInput from '@/components/atoms/SelectInput'

interface FilterBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedCategory: string
  onCategoryChange: (value: string) => void
  categories?: string[]
}

const DEFAULT_CATEGORIES = [
  'School League',
  'School Tournament',
  'Club League',
  'Club Tournament',
  'Adult',
]

export default function FilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories = DEFAULT_CATEGORIES,
}: FilterBarProps) {
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map(cat => ({ value: cat, label: cat })),
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="Search"
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search rules..."
        />
        
        <SelectInput
          label="Category"
          value={selectedCategory}
          onChange={onCategoryChange}
          options={categoryOptions}
        />
      </div>
    </div>
  )
}