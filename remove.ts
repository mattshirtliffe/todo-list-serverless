import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { handleErrorResponse } from './lib/error'
import ServiceError from './lib/ServiceError'
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

    const { id } = event.pathParameters

    const task = new Task(tableName)
    const result = await task.fetch(id)

    if (!result) {
      throw new ServiceError('Task not found', 404)
    }

    await task.delete(id)

    return {
      statusCode: 204,
      body: JSON.stringify({ message: 'Task deleted successfully' }),
    }
  } catch (error) {
    return handleErrorResponse(error)
  }
}
