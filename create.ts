import { v4 as uuidv4 } from 'uuid'
import { DynamoDB } from 'aws-sdk'
import dynamoDB from './dynamodb'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { handleErrorResponse } from './lib/error'
import ServiceError from './lib/ServiceError'

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

    const timestamp = new Date().getTime()

    const params: DynamoDB.DocumentClient.PutItemInput = {
      TableName: tableName,
      Item: {
        id: uuidv4(),
        text: text,
        done: false,
        createdAt: timestamp.toString(),
        updatedAt: timestamp.toString(),
      },
    }

    await dynamoDB.put(params).promise()

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Task created successfully' }),
    }
  } catch (error) {
    return handleErrorResponse(error)
  }
}
