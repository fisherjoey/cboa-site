# Migration Checklist - Applying Error Handling to Existing Components

## Components to Update

### 1. ✅ ResourcesClient (High Priority)
**File**: `app/portal/resources/ResourcesClient.tsx`

**Current Issues**:
- Uses `alert()` for errors (lines 154, 197, 225, 236)
- No form validation before submission
- No input sanitization
- Basic file upload validation only

**Changes Needed**:
- [ ] Add toast hook and ToastContainer
- [ ] Add validationErrors state
- [ ] Validate form in handleCreate (lines 138-202)
- [ ] Sanitize title, description, externalLink
- [ ] Replace all alert() with toast.error()
- [ ] Add inline validation error display
- [ ] Show file size/type requirements

**Lines to Update**: 138-239

---

### 2. ✅ NewsClient (High Priority)
**File**: `app/portal/news/NewsClient.tsx`

**Current Issues**:
- Uses `alert()` for errors (lines 92, 106, 117)
- No form validation (title, content, author required)
- No input sanitization
- Content could contain XSS

**Changes Needed**:
- [ ] Add toast hook and ToastContainer
- [ ] Add validationErrors state
- [ ] Use validateAnnouncementForm() before submission
- [ ] Sanitize title, content, author
- [ ] Replace all alert() with toast notifications
- [ ] Add inline validation errors
- [ ] Validate markdown content

**Lines to Update**: 69-120

---

### 3. ✅ MembersPage (High Priority)
**File**: `app/portal/members/page.tsx`

**Current Issues**:
- Uses `alert()` for errors (lines 169, 186, 216, 237)
- No email validation
- No phone number validation
- No postal code validation

**Changes Needed**:
- [ ] Add toast hook and ToastContainer
- [ ] Add validationErrors state
- [ ] Use validateMemberForm() in handleSaveMember (line 149)
- [ ] Use validateActivityForm() in handleSaveActivity (line 202)
- [ ] Sanitize all text inputs
- [ ] Replace all alert() with toast notifications
- [ ] Add inline validation for email, phone, postal code

**Lines to Update**: 149-239

---

### 4. ⚠️ TheBounceClient (Medium Priority)
**File**: `app/portal/the-bounce/TheBounceClient.tsx`

**Needs Review** - Check for:
- Form validation for newsletter uploads
- File type validation (should only be PDF)
- Error handling for PDF load failures
- Alert() usage

---

### 5. ⚠️ RuleModificationsClient (Medium Priority)
**File**: `app/portal/rule-modifications/RuleModificationsClient.tsx`

**Needs Review** - Check for:
- Form validation
- Alert() usage
- Error handling for rule CRUD operations

---

### 6. 📅 CalendarPage (Low Priority)
**File**: `app/portal/calendar/page.tsx`

**Needs Review** - Check for:
- Event form validation
- Date validation
- Alert() usage

---

### 7. 👤 ProfilePage (Low Priority)
**File**: `app/portal/profile/page.tsx`

**Needs Review** - Check for:
- Profile update validation
- Email/phone validation
- Alert() usage

---

## Step-by-Step Migration Guide

### For Each Component:

#### Step 1: Add Imports (Top of file)
```tsx
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/Toast'
import {
  validateResourceForm,  // or appropriate validator
  getFieldError,
  hasErrors,
  formatValidationErrors
} from '@/lib/portalValidation'
import { parseAPIError, sanitize, ValidationError } from '@/lib/errorHandling'
```

#### Step 2: Add State (Inside component)
```tsx
const toast = useToast()
const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
```

#### Step 3: Update Submit Handler
```tsx
const handleSubmit = async () => {
  // Clear previous errors
  setValidationErrors([])

  // Validate
  const errors = validateResourceForm(formData)
  if (hasErrors(errors)) {
    setValidationErrors(errors)
    toast.error('Validation Failed', formatValidationErrors(errors))
    return
  }

  // Sanitize
  const sanitizedData = {
    title: sanitize.text(formData.title),
    description: sanitize.text(formData.description),
    url: sanitize.url(formData.url)
  }

  // Submit
  try {
    await api.create(sanitizedData)
    toast.success('Success!', 'Item created successfully.')
    // Reset form
  } catch (error) {
    toast.error('Operation Failed', parseAPIError(error))
  }
}
```

#### Step 4: Add Inline Validation to Form Fields
```tsx
<input
  type="text"
  value={formData.title}
  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
  className={`border rounded ${
    getFieldError(validationErrors, 'title')
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:ring-blue-500'
  }`}
/>
{getFieldError(validationErrors, 'title') && (
  <p className="mt-1 text-sm text-red-600">
    {getFieldError(validationErrors, 'title')}
  </p>
)}
```

#### Step 5: Replace All alert() Calls
```tsx
// Before:
alert('Failed to save. Please try again.')

// After:
toast.error('Save Failed', 'Please check your inputs and try again.')
```

#### Step 6: Add ToastContainer to JSX
```tsx
return (
  <div>
    <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
    {/* Rest of component */}
  </div>
)
```

---

## Testing Checklist

For each migrated component:

### Validation Tests
- [ ] Submit empty form - should show validation errors
- [ ] Enter invalid email - should show email error
- [ ] Enter invalid phone - should show phone error
- [ ] Enter too short text - should show length error
- [ ] Enter too long text - should show length error
- [ ] Upload oversized file - should show size error
- [ ] Upload wrong file type - should show type error

### API Error Tests
- [ ] Disconnect network - should show network error and retry
- [ ] Trigger 500 error - should show server error
- [ ] Trigger 404 error - should show not found error
- [ ] Test successful create - should show success toast
- [ ] Test successful update - should show success toast
- [ ] Test successful delete - should show success toast

### XSS Protection Tests
- [ ] Enter `<script>alert('xss')</script>` in text field
- [ ] Enter `javascript:alert('xss')` in URL field
- [ ] Enter HTML tags in description
- [ ] All should be properly escaped/blocked

### UX Tests
- [ ] Toast appears in correct position (top-right)
- [ ] Toast auto-dismisses after appropriate time
- [ ] Toast can be manually dismissed
- [ ] Multiple toasts stack properly
- [ ] Inline errors appear next to fields
- [ ] Inline errors clear when fixed
- [ ] Loading states work correctly

---

## Priority Order

1. **Week 1**: ResourcesClient (most complex, good reference)
2. **Week 2**: NewsClient + MembersPage (high user impact)
3. **Week 3**: TheBounceClient + RuleModificationsClient
4. **Week 4**: CalendarPage + ProfilePage + any remaining

---

## Rollback Plan

If issues are found:
1. The new utilities don't break existing code
2. Components can be updated one at a time
3. Old code continues to work (just less polished)
4. Simply don't import/use the new utilities to keep old behavior

---

## Success Metrics

- ✅ Zero `alert()` calls in portal code
- ✅ Zero `console.error()` without user feedback
- ✅ All forms have validation
- ✅ All text inputs are sanitized
- ✅ All API errors show friendly messages
- ✅ File uploads have size/type validation
- ✅ Network errors automatically retry
- ✅ Users see helpful error messages

---

## Questions During Migration?

1. Check `QUICK_REFERENCE.md` for syntax
2. Check `IMPLEMENTATION_GUIDE.md` for patterns
3. Check `ResourcesClient.ENHANCED_EXAMPLE.tsx` for working code
4. Check `lib/errorHandling.ts` JSDoc comments for validator details
