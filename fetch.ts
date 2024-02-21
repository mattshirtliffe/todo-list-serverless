import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import ServiceError from './lib/ServiceError'
import { handleErrorResponse } from './lib/error'
import Task from './model/Task'

const tableName = process.env.DYNAMODB_TABLE

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!tableName) {
      throw new ServiceError(
        'DYNAMODB_TABLE environment variable not defined',
        500
      )
    }

    if (!event.pathParameters || !event.pathParameters.id) {
      throw new ServiceError(
        'Bad Request: No ID provided in path parameters',
        400
      )
    }

    const task = new Task(tableName)
    const result = await task.fetch(event.pathParameters.id)

    if (!result) {
      throw new ServiceError('Task not found', 404)
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    }
  } catch (error) {
    return handleErrorResponse(error)
  }
}
