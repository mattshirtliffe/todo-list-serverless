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

    const id = event.pathParameters.id

    if (!event.body) {
      throw new ServiceError('Bad Request: No body provided', 400)
    }

    const { text, done } = JSON.parse(
      Buffer.from(event.body, 'base64').toString()
    )

    const task = new Task(tableName)
    const updatedTask = await task.modify(id, text, done)

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Task updated successfully',
        updatedTask,
      }),
    }
  } catch (error) {
    return handleErrorResponse(error)
  }
}
