import { toast } from 'sonner'

export const responseCatcher = (error, refreshPage = true) => {
  const status = error?.response?.status || null
  const data = error?.response?.data || {}
  const errorMessage = data.message || data.error || 'An unexpected error occurred'

  switch (status) {
    case 200:
      toast.success('Success')
      break

    case 201:
      toast.success('Resource created successfully')
      break

    case 202:
      toast.success('Request accepted for processing')
      break

    case 204:
      toast.info('No content to display')
      break

    case 206:
      toast.info('Partial content returned')
      break

    case 400:
      toast.error(errorMessage || 'Bad request')
      break

    case 401:
      toast.error(errorMessage || 'Unauthorized access')
      if (refreshPage) {
        try { localStorage.removeItem('token') } catch {}
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
      break

    case 402:
      toast.error('Payment required')
      break

    case 403:
      toast.error(errorMessage || 'Forbidden')
      break

    case 404:
      toast.error(errorMessage || 'Resource not found')
      break

    case 405:
      toast.error('Method not allowed')
      break

    case 408:
      toast.error('Request timeout')
      break

    case 409:
      toast.error('Conflict detected')
      break

    case 410:
      toast.error('Resource permanently removed')
      break

    case 413:
      toast.error('Payload too large')
      break

    case 415:
      toast.error('Unsupported media type')
      break

    case 422: {
      const validationErrors = data.errors
      if (validationErrors && typeof validationErrors === 'object') {
        Object.entries(validationErrors).forEach(([_, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            toast.error(messages[0])
          }
        })
      } else {
        toast.error(errorMessage)
      }
      break
    }

    case 429:
      toast.error('Too many requests – please slow down')
      break

    case 500:
      toast.error(errorMessage || 'Internal server error')
      break

    case 501:
      toast.error('Not implemented on server')
      break

    case 502:
      toast.error('Bad gateway')
      break

    case 503:
      toast.error('Service temporarily unavailable')
      break

    case 504:
      toast.error('Gateway timeout – server took too long to respond')
      break

    default:
      toast.error(status ? errorMessage : 'Network or unknown error occurred')
      break
  }
}
