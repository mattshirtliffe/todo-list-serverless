import { DynamoDB } from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import dynamoDB from './dynamodb'
import ServiceError from './lib/ServiceError'
import { handleErrorResponse } from './lib/error'

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
    const params: DynamoDB.DocumentClient.GetItemInput = {
      Key: { id: event.pathParameters.id },
      TableName: tableName,
    }
    const result = await dynamoDB.get(params).promise()

    if (!result.Item) {
      throw new ServiceError('Task not found', 404)
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    }
  } catch (error) {
    return handleErrorResponse(error)
  }
}
