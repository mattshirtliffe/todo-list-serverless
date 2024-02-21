import { DynamoDB } from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import dynamoDB from './dynamodb'

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

    if (!event.pathParameters || !event.pathParameters.id) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request: No ID provided in path parameters',
        }),
      }
    }

    const id = event.pathParameters.id

    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Bad Request: No data provided' }),
      }
    }

    const body = JSON.parse(Buffer.from(event.body, 'base64').toString())

    if (!body.text) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request: Missing required field "text"',
        }),
      }
    }

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
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
      }),
    }
  }
}
