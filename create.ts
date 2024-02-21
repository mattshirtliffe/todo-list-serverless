import { v4 as uuidv4 } from 'uuid'
import { DynamoDB } from 'aws-sdk'
import dynamoDB from './dynamodb'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

const tableName = process.env.DYNAMODB_TABLE

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!tableName) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'DYNAMODB_TABLE environment variable not defined',
        }),
      }
    }

    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Bad Request: No data provided' }),
      }
    }

    const { text } = JSON.parse(Buffer.from(event.body, 'base64').toString())

    if (!text) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request: Missing required field "text"',
        }),
      }
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
    console.error(error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
      }),
    }
  }
}
