import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import ServiceError from './lib/ServiceError'
import { handleErrorResponse } from './lib/error'
import Task from './model/Task'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const tableName = process.env.DYNAMODB_TABLE
    if (!tableName) {
      throw new ServiceError(
        'DYNAMODB_TABLE environment variable not defined',
        500
      )
    }

    const task = new Task(tableName)
    const tasks = await task.list()

    return {
      statusCode: 200,
      body: JSON.stringify({
        tasks,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  } catch (error) {
    return handleErrorResponse(error)
  }
}
