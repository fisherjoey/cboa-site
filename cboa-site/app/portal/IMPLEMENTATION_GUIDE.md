# Portal Error Handling Implementation Guide

This guide shows how to add comprehensive error handling to portal components.

## Overview

We've created a robust error handling system with:

1. **Validation utilities** (`lib/errorHandling.ts`)
2. **Portal-specific validators** (`lib/portalValidation.ts`)
3. **Toast notifications** (`components/Toast.tsx`, `hooks/useToast.ts`)
4. **Enhanced API layer** (`lib/api.ts` with retry logic)
5. **File upload validation** (`lib/fileUpload.ts`)

## Implementation Pattern

### Step 1: Import Required Utilities

```tsx
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/Toast'
import {
  validateResourceForm, // or validateMemberForm, validateAnnouncementForm, etc.
  getFieldError,
  hasErrors,
  formatValidationErrors
} from '@/lib/portalValidation'
import { parseAPIError, sanitize } from '@/lib/errorHandling'
```

### Step 2: Add Toast State

```tsx
export default function YourComponent() {
  const toast = useToast()
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])

  // ... other state
}
```

### Step 3: Add Validation Before Submission

```tsx
const handleCreate = async () => {
  // Clear previous errors
  setValidationErrors([])

  // Validate form data
  const errors = validateResourceForm({
    title: newResource.title,
    description: newResource.description,
    category: newResource.category,
    file: uploadedFile,
    fileUrl: newResource.fileUrl,
    externalLink: newResource.externalLink
  })

  if (hasErrors(errors)) {
    setValidationErrors(errors)
    toast.error('Validation Failed', formatValidationErrors(errors))
    return
  }

  // Sanitize inputs
  const sanitizedData = {
    ...newResource,
    title: sanitize.text(newResource.title || ''),
    description: sanitize.text(newResource.description || ''),
    externalLink: newResource.externalLink ? sanitize.url(newResource.externalLink) : undefined
  }

  try {
    setIsUploading(true)

    // Handle file upload with automatic validation
    let fileUrl = sanitizedData.fileUrl
    if (uploadedFile) {
      try {
        const uploadResult = await uploadFile(uploadedFile)
        fileUrl = uploadResult.url
      } catch (uploadError) {
        toast.error('Upload Failed', parseAPIError(uploadError))
        return
      }
    }

    // Create resource (API has automatic retry logic)
    const created = await resourcesAPI.create({
      ...sanitizedData,
      file_url: fileUrl
    })

    // Success!
    toast.success('Resource Created', 'The resource was successfully added.')

    // Reset form
    setNewResource({ title: '', description: '', category: 'rulebooks' })
    setUploadedFile(null)
    setIsCreating(false)

  } catch (error) {
    toast.error('Failed to Create Resource', parseAPIError(error))
  } finally {
    setIsUploading(false)
  }
}
```

### Step 4: Display Validation Errors in Form

```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Title *
  </label>
  <input
    type="text"
    value={newResource.title}
    onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
      getFieldError(validationErrors, 'title')
        ? 'border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:ring-orange-500'
    }`}
    placeholder="Resource title..."
  />
  {getFieldError(validationErrors, 'title') && (
    <p className="mt-1 text-sm text-red-600">
      {getFieldError(validationErrors, 'title')}
    </p>
  )}
</div>
```

### Step 5: Add Toast Container to Component

```tsx
return (
  <div className="px-4 py-5 sm:p-6">
    <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />

    {/* Rest of your component */}
  </div>
)
```

## Available Validators

### Form Validators
- `validateResourceForm(data)` - Resources page
- `validateAnnouncementForm(data)` - News/Announcements
- `validateMemberForm(data)` - Members page
- `validateActivityForm(data)` - Member activities
- `validateNewsletterForm(data)` - Newsletters

### Field Validators
All available in `validators` from `lib/errorHandling.ts`:
- `validators.required(value, fieldName)`
- `validators.email(value)`
- `validators.phone(value)`
- `validators.url(value)`
- `validators.minLength(value, min, fieldName)`
- `validators.maxLength(value, max, fieldName)`
- `validators.postalCode(value)`
- `validators.fileSize(file, maxSizeMB)`
- `validators.fileType(file, allowedTypes)`
- `validators.date(value)`

### Sanitizers
- `sanitize.text(value)` - Escape HTML for text inputs
- `sanitize.url(value)` - Validate and normalize URLs

## Toast Notification Methods

```tsx
const toast = useToast()

// Success notification (5 seconds)
toast.success('Success!', 'Operation completed successfully.')

// Error notification (7 seconds)
toast.error('Error!', 'Something went wrong.')

// Warning notification (5 seconds)
toast.warning('Warning!', 'Please review this.')

// Info notification (5 seconds)
toast.info('Info', 'Here is some information.')

// Custom duration
toast.success('Saved!', 'Changes saved.', 3000)
```

## API Error Handling

The API layer now automatically:
- Retries GET requests up to 3 times on network errors
- Parses error responses into user-friendly messages
- Throws `AppError` with error codes and status codes
- Handles network timeouts gracefully

```tsx
try {
  const data = await resourcesAPI.getAll()
  // Success - retried automatically if network failed
} catch (error) {
  // Error is already formatted by API layer
  toast.error('Failed to Load', parseAPIError(error))
}
```

## File Upload Validation

The `uploadFile` function now automatically validates:
- File size (max 25MB)
- File type (pdf, doc, docx, xls, xlsx, ppt, pptx, mp4, avi, mov, jpg, jpeg, png)
- File name security (no path traversal)

```tsx
try {
  const result = await uploadFile(file)
  // File is validated before upload
} catch (error) {
  // Detailed validation error message
  toast.error('Upload Failed', parseAPIError(error))
}
```

## Security Best Practices

1. **Always sanitize user inputs** before storing or displaying
2. **Validate on frontend** before sending to backend (prevents unnecessary requests)
3. **Use type-safe validators** to catch issues early
4. **Display specific errors** to help users fix issues
5. **Log errors** for debugging but show friendly messages to users

## Complete Example

See the example implementations in:
- `app/portal/resources/ResourcesClient.tsx` (after updates)
- `app/portal/news/NewsClient.tsx` (after updates)
- `app/portal/members/page.tsx` (after updates)

## Migration Checklist

For each component:
- [ ] Import toast hook and validation utilities
- [ ] Add `validationErrors` state
- [ ] Add validation before form submission
- [ ] Sanitize all text inputs
- [ ] Replace `alert()` calls with `toast` notifications
- [ ] Display inline validation errors
- [ ] Add `<ToastContainer>` to component
- [ ] Replace `console.error` with proper error handling
- [ ] Test all error scenarios

## Testing Error Scenarios

1. **Validation Errors**: Submit forms with invalid data
2. **Network Errors**: Disable network and try operations
3. **File Upload Errors**: Upload files that are too large or wrong type
4. **API Errors**: Test with backend errors (500, 404, etc.)
5. **XSS Attempts**: Try entering HTML/JS in text fields

## Benefits

✅ Consistent error handling across all portal pages
✅ User-friendly error messages instead of technical jargon
✅ Automatic retry for transient network failures
✅ Comprehensive frontend validation to catch issues early
✅ XSS protection through input sanitization
✅ Better UX with toast notifications instead of alerts
✅ Detailed validation feedback for users
✅ Security against path traversal and malicious uploads
