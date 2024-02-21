import { DynamoDB } from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import dynamoDB from './dynamodb'

const tableName = process.env.DYNAMODB_TABLE

class ServiceError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

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

    const body = JSON.parse(Buffer.from(event.body, 'base64').toString())

    const updateExpressionParts: string[] = []
    const expressionAttributeValues = {}
    const expressionAttributeNames = {}

    if (body.text) {
      updateExpressionParts.push('#text = :text')
      expressionAttributeValues[':text'] = body.text
      expressionAttributeNames['#text'] = 'text'
    }

    if (body.done !== undefined) {
      updateExpressionParts.push('#done = :done')
      expressionAttributeValues[':done'] = body.done
      expressionAttributeNames['#done'] = 'done'
    }

    updateExpressionParts.push('#updatedAt = :updatedAt')
    expressionAttributeValues[':updatedAt'] = new Date().getTime().toString()
    expressionAttributeNames['#updatedAt'] = 'updatedAt'

    const updateExpression = `set ${updateExpressionParts.join(', ')}`

    const params: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: tableName,
      Key: {
        id: id,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    }

    const updatedTask = await dynamoDB.update(params).promise()

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Task updated successfully',
        updatedTask,
      }),
    }
  } catch (error) {
    console.error(error)
    const statusCode = error.statusCode || 500
    const errorMessage =
      error.statusCode !== 500 ? error.message : 'Internal Server Error'
    return {
      statusCode,
      body: JSON.stringify({
        error: errorMessage,
      }),
    }
  }
}
