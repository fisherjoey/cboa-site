# TDD Migration Plan: CMS to Supabase

## Core Principle: Red → Green → Refactor
1. Write test (fails - RED)
2. Write minimal code to pass (GREEN)
3. Refactor for quality (REFACTOR)

## Component Hierarchy (Top → Bottom → Atoms)

```
RuleModificationsPage
├── RuleModificationsController (Business Logic)
│   ├── DataProvider (Data Layer)
│   │   ├── SupabaseAdapter
│   │   └── FileSystemAdapter
│   └── StateManager
│       ├── FilterState
│       ├── SearchState
│       └── CRUDState
└── RuleModificationsView (Presentation)
    ├── HeaderSection
    │   ├── Title (Atom)
    │   └── AddButton (Atom)
    ├── FilterBar
    │   ├── SearchInput (Atom)
    │   └── CategoryFilter (Atom)
    ├── RulesList
    │   └── RuleCard
    │       ├── CategoryBadge (Atom)
    │       ├── DateDisplay (Atom)
    │       ├── ExpandToggle (Atom)
    │       └── ActionButtons (Atom)
    └── EditForm
        ├── TextInput (Atom)
        ├── SelectInput (Atom)
        ├── DateInput (Atom)
        └── MarkdownEditor (Atom)
```

## Atomic Components to Build (Bottom-Up)

### Level 1: Atoms (Pure, Testable, No Dependencies)

#### 1. TextInput Atom
```typescript
// Tests first!
describe('TextInput', () => {
  it('renders with label')
  it('shows value')
  it('calls onChange')
  it('shows error state')
  it('handles disabled state')
})
```

#### 2. CategoryBadge Atom
```typescript
describe('CategoryBadge', () => {
  it('renders category text')
  it('applies correct color for School League')
  it('applies correct color for Club Tournament')
  it('handles unknown categories')
})
```

#### 3. DateDisplay Atom
```typescript
describe('DateDisplay', () => {
  it('formats date correctly')
  it('handles invalid dates')
  it('shows relative time when recent')
})
```

### Level 2: Molecules (Composed Atoms)

#### 4. FilterBar Molecule
```typescript
describe('FilterBar', () => {
  it('renders search input')
  it('renders category buttons')
  it('highlights selected category')
  it('calls onSearch when typing')
  it('calls onCategoryChange when clicked')
})
```

#### 5. RuleCard Molecule
```typescript
describe('RuleCard', () => {
  it('shows collapsed state by default')
  it('expands when clicked')
  it('shows edit buttons for admin')
  it('hides edit buttons for regular users')
  it('renders markdown content when expanded')
})
```

### Level 3: Organisms (Business Logic)

#### 6. DataProvider
```typescript
describe('DataProvider', () => {
  describe('SupabaseAdapter', () => {
    it('fetches all rules')
    it('filters by category')
    it('searches by text')
    it('creates new rule')
    it('updates existing rule')
    it('deletes rule')
    it('handles errors gracefully')
  })

  describe('FileSystemAdapter', () => {
    it('reads from markdown files')
    it('parses frontmatter')
    it('filters in memory')
  })
})
```

#### 7. StateManager
```typescript
describe('StateManager', () => {
  it('initializes with default state')
  it('updates filter state')
  it('updates search state')
  it('tracks editing state')
  it('validates before save')
})
```

## Migration Path (Incremental, Safe)

### Phase 1: Build Atoms (Week 1)
- [ ] Create all atom components with tests
- [ ] No integration yet - pure components
- [ ] 100% test coverage on atoms

### Phase 2: Build Molecules (Week 2)
- [ ] Compose atoms into molecules
- [ ] Test interactions between atoms
- [ ] Mock all external dependencies

### Phase 3: Create Adapters (Week 3)
- [ ] Build SupabaseAdapter with tests
- [ ] Build FileSystemAdapter with tests
- [ ] Create adapter interface for swapping

### Phase 4: Integration (Week 4)
- [ ] Wire up components
- [ ] Add feature flags for gradual rollout
- [ ] A/B test both implementations

## Test Structure

```
__tests__/
├── unit/
│   ├── atoms/
│   │   ├── TextInput.test.tsx
│   │   ├── CategoryBadge.test.tsx
│   │   └── DateDisplay.test.tsx
│   ├── molecules/
│   │   ├── FilterBar.test.tsx
│   │   └── RuleCard.test.tsx
│   └── adapters/
│       ├── SupabaseAdapter.test.ts
│       └── FileSystemAdapter.test.ts
├── integration/
│   ├── RuleModifications.test.tsx
│   └── Announcements.test.tsx
└── e2e/
    ├── create-rule.test.ts
    ├── edit-rule.test.ts
    └── search-filter.test.ts
```

## Testing Tools

```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0",
    "@types/jest": "^29.0.0",
    "msw": "^2.0.0"  // Mock Service Worker for API mocking
  }
}
```

## Example: Building TextInput Atom (TDD)

### Step 1: Write Test (RED)
```typescript
// __tests__/unit/atoms/TextInput.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import TextInput from '@/components/atoms/TextInput'

describe('TextInput Atom', () => {
  it('should render with label', () => {
    render(<TextInput label="Title" value="" onChange={() => {}} />)
    expect(screen.getByText('Title')).toBeInTheDocument()
  })

  it('should display the current value', () => {
    render(<TextInput label="Title" value="Test Rule" onChange={() => {}} />)
    expect(screen.getByDisplayValue('Test Rule')).toBeInTheDocument()
  })

  it('should call onChange when typed', () => {
    const handleChange = jest.fn()
    render(<TextInput label="Title" value="" onChange={handleChange} />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'New Value' } })

    expect(handleChange).toHaveBeenCalledWith('New Value')
  })

  it('should show error state', () => {
    render(<TextInput label="Title" value="" onChange={() => {}} error="Required" />)
    expect(screen.getByText('Required')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500')
  })
})
```

### Step 2: Write Minimal Code (GREEN)
```typescript
// components/atoms/TextInput.tsx
interface TextInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}

export default function TextInput({ label, value, onChange, error, disabled }: TextInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}
```

### Step 3: Refactor
- Add accessibility attributes
- Extract styles to constants
- Add prop validation
- Optimize re-renders

## Success Criteria

1. **100% test coverage** on atoms
2. **90%+ coverage** on molecules
3. **All tests pass** before deployment
4. **No direct Supabase calls** in components
5. **Feature flags** for safe rollout
6. **Rollback plan** if issues arise

## Next Steps

1. Set up Jest and Testing Library
2. Create first atom with tests
3. Follow red-green-refactor strictly
4. Review and iterate

This ensures we build a robust, testable system from the ground up!