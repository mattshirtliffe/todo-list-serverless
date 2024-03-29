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

    const task = new Task(tableName)
    const result = await task.fetch(id)

    if (!result) {
      throw new ServiceError('Task not found', 404)
    }

    const { text, done } = JSON.parse(
      Buffer.from(event.body, 'base64').toString()
    )

    await task.modify(id, text, done)

    const updatedTask = await task.fetch(id)

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Task updated successfully',
        updatedTask,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  } catch (error) {
    return handleErrorResponse(error)
  }
}
