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

    const params: DynamoDB.DocumentClient.ScanInput = {
      TableName: tableName,
    }
    const result = await dynamoDB.scan(params).promise()

    let items: {
      id: string
      text: string
      done: string
      createdAt: string
      updatedAt: string
    }[] = []

    if (result.Items) {
      items = await result.Items.map((task) => {
        return {
          id: task.id,
          text: task.text,
          done: task.done,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        }
      })
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        total: result.Count,
        items,
      }),
    }
  } catch (error) {
    return handleErrorResponse(error)
  }
}
