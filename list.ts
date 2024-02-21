import { DynamoDB } from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import dynamoDB from './dynamodb'

const tableName = process.env.DYNAMODB_TABLE

console.log(tableName)

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
    console.error(error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
      }),
    }
  }
}
