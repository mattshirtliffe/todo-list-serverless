import { v4 as uuidv4 } from 'uuid'

import {
  DeleteItemCommand,
  DeleteItemCommandInput,
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandInput,
  PutItemCommand,
  PutItemCommandInput,
  ScanCommand,
  ScanCommandInput,
  UpdateItemCommand,
  UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb'

export default class Task {
  tableName: string
  dynamoDB: AWS.DynamoDB.DocumentClient

  dynamoDBClient: DynamoDBClient

  constructor(tableName: string) {
    this.tableName = tableName
    let options = {}

    // Check if running offline and configure options accordingly
    if (process.env.IS_OFFLINE) {
      options = {
        region: 'localhost',
        endpoint: 'http://localhost:8000',
      }
    }

    this.dynamoDBClient = new DynamoDBClient(options)
  }

  async list() {
    try {
      const params: ScanCommandInput = {
        TableName: this.tableName,
      }

      const command = new ScanCommand(params)
      const response = await this.dynamoDBClient.send(command)
      return response.Items
    } catch (error) {
      console.error('Error listing tasks:', error)
      throw error
    }
  }

  async fetch(id: string) {
    try {
      const params: GetItemCommandInput = {
        TableName: this.tableName,
        Key: {
          id: {
            S: id,
          },
        },
      }
      const command = new GetItemCommand(params)
      const response = await this.dynamoDBClient.send(command)
      return response.Item
    } catch (error) {
      console.error('Error fetching tasks', error)
      throw error
    }
  }

  async modify(id: string, text?: string, done?: boolean) {
    try {
      const updateExpressionParts: string[] = []
      const expressionAttributeValues = {}
      const expressionAttributeNames = {}

      if (text !== undefined) {
        updateExpressionParts.push('#text = :text')
        expressionAttributeValues[':text'] = { S: text }
        expressionAttributeNames['#text'] = 'text'
      }

      if (done !== undefined) {
        updateExpressionParts.push('#done = :done')
        expressionAttributeValues[':done'] = { BOOL: done }
        expressionAttributeNames['#done'] = 'done'
      }

      updateExpressionParts.push('#updatedAt = :updatedAt')
      expressionAttributeValues[':updatedAt'] = {
        S: new Date().getTime().toString(),
      }
      expressionAttributeNames['#updatedAt'] = 'updatedAt'

      const updateExpression = `set ${updateExpressionParts.join(', ')}`

      const params: UpdateItemCommandInput = {
        TableName: this.tableName,
        Key: {
          id: {
            S: id,
          },
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      }

      const command = new UpdateItemCommand(params)
      const response = await this.dynamoDBClient.send(command)
      return response
    } catch (error) {
      console.error('Error modifying task', error)
      console.error(error.stack)
      throw error
    }
  }

  async create(text: string) {
    try {
      const timestamp = new Date().getTime()
      const params: PutItemCommandInput = {
        TableName: this.tableName,
        Item: {
          id: {
            S: uuidv4(),
          },
          text: {
            S: text,
          },
          done: {
            BOOL: false,
          },
          createdAt: {
            S: timestamp.toString(),
          },
          updatedAt: {
            S: timestamp.toString(),
          },
        },
      }

      const command = new PutItemCommand(params)
      await this.dynamoDBClient.send(command)
    } catch (error) {
      console.error('Error creating task', error)
      throw error
    }
  }

  async delete(id: string) {
    try {
      const params: DeleteItemCommandInput = {
        TableName: this.tableName,
        Key: {
          id: {
            S: id,
          },
        },
      }

      const command = new DeleteItemCommand(params)
      await this.dynamoDBClient.send(command)
    } catch (error) {
      console.error('Error deleting task', error)
      throw error
    }
  }
}

export type TaskType = {
  id: string
  text: string
  done: string
  createdAt: string
  updatedAt: string
}
