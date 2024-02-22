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

    if (!event.body) {
      throw new ServiceError('Bad Request: No data provided', 400)
    }

    const { text } = JSON.parse(Buffer.from(event.body, 'base64').toString())

    if (!text) {
      throw new ServiceError('Bad Request: Missing required field "text"', 400)
    }

    const task = new Task(tableName)
    await task.create(text)

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Task created successfully' }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  } catch (error) {
    return handleErrorResponse(error)
  }
}
