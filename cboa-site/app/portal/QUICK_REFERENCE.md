# Error Handling Quick Reference

## Import Everything You Need

```tsx
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/Toast'
import { validateResourceForm, getFieldError, hasErrors, formatValidationErrors } from '@/lib/portalValidation'
import { parseAPIError, sanitize, ValidationError } from '@/lib/errorHandling'
```

## Setup Component

```tsx
export default function YourComponent() {
  const toast = useToast()
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])

  return (
    <div>
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
      {/* Your content */}
    </div>
  )
}
```

## Validate Form

```tsx
const handleSubmit = async () => {
  setValidationErrors([])

  const errors = validateResourceForm(formData)
  if (hasErrors(errors)) {
    setValidationErrors(errors)
    toast.error('Validation Failed', formatValidationErrors(errors))
    return
  }

  // Continue with submission...
}
```

## Show Validation Errors

```tsx
<input
  type="text"
  value={formData.title}
  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
  className={`border rounded ${
    getFieldError(validationErrors, 'title')
      ? 'border-red-500'
      : 'border-gray-300'
  }`}
/>
{getFieldError(validationErrors, 'title') && (
  <p className="text-sm text-red-600">{getFieldError(validationErrors, 'title')}</p>
)}
```

## Sanitize Inputs

```tsx
const sanitizedData = {
  title: sanitize.text(formData.title),
  description: sanitize.text(formData.description),
  url: sanitize.url(formData.url)
}
```

## Handle API Calls

```tsx
try {
  const result = await someAPI.create(data)
  toast.success('Success!', 'Data saved successfully.')
} catch (error) {
  toast.error('Operation Failed', parseAPIError(error))
}
```

## Upload Files

```tsx
try {
  const result = await uploadFile(file)
  toast.success('Uploaded!', `File uploaded: ${result.fileName}`)
} catch (error) {
  toast.error('Upload Failed', parseAPIError(error))
}
```

## Available Validators

| Validator | Usage |
|-----------|-------|
| `validateResourceForm(data)` | Resources |
| `validateAnnouncementForm(data)` | News/Announcements |
| `validateMemberForm(data)` | Members |
| `validateActivityForm(data)` | Activities |
| `validateNewsletterForm(data)` | Newsletters |

## Toast Methods

```tsx
toast.success('Title', 'Message', 3000)  // 3 seconds
toast.error('Title', 'Message')          // 7 seconds (default for errors)
toast.warning('Title', 'Message')        // 5 seconds
toast.info('Title', 'Message')           // 5 seconds
```

## Common Patterns

### Delete Confirmation
```tsx
const handleDelete = async (id: string) => {
  if (!confirm('Are you sure?')) return

  try {
    await someAPI.delete(id)
    toast.success('Deleted', 'Item removed successfully.')
  } catch (error) {
    toast.error('Delete Failed', parseAPIError(error))
  }
}
```

### Update with Sanitization
```tsx
const handleUpdate = async (id: string, updates: any) => {
  const sanitized = {
    title: sanitize.text(updates.title),
    description: sanitize.text(updates.description)
  }

  try {
    await someAPI.update({ id, ...sanitized })
    toast.success('Updated', 'Changes saved.')
  } catch (error) {
    toast.error('Update Failed', parseAPIError(error))
  }
}
```

### Loading State
```tsx
const [isLoading, setIsLoading] = useState(false)

const handleSubmit = async () => {
  setIsLoading(true)
  try {
    await someAPI.create(data)
    toast.success('Done!')
  } catch (error) {
    toast.error('Failed', parseAPIError(error))
  } finally {
    setIsLoading(false)
  }
}
```

## Field Validators

```tsx
import { validators } from '@/lib/errorHandling'

validators.required(value, 'Field Name')
validators.email(value)
validators.phone(value)
validators.url(value)
validators.minLength(value, 5, 'Field Name')
validators.maxLength(value, 100, 'Field Name')
validators.postalCode(value)
validators.fileSize(file, 25)  // 25MB
validators.fileType(file, ['pdf', 'doc'])
validators.date(value)
```

## That's It!

See `IMPLEMENTATION_GUIDE.md` for detailed examples.
See `ResourcesClient.ENHANCED_EXAMPLE.tsx` for working code.
