import ServiceError from './ServiceError'

export const handleErrorResponse = (error: ServiceError) => {
  console.error(error)
  const statusCode = error.statusCode || 500
  const errorMessage =
    error.statusCode !== 500 ? error.message : 'Internal Server Error'
  return {
    statusCode,
    body: JSON.stringify({
      error: errorMessage,
    }),
  }
}
