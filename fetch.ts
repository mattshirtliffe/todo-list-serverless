import { DynamoDB } from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import dynamoDB from './dynamodb'

const tableName = process.env.DYNAMODB_TABLE

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request: No ID provided in path parameters',
        }),
      }
    }

    if (!tableName) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'DYNAMODB_TABLE environment variable not defined',
        }),
      }
    }
    const params: DynamoDB.DocumentClient.GetItemInput = {
      Key: { id: event.pathParameters.id },
      TableName: tableName,
    }
    const result = await dynamoDB.get(params).promise()

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Task not found',
        }),
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    }
  } catch (error) {
    console.error(error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
      }),
    }
  }
}
