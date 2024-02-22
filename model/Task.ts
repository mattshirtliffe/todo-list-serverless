import { v4 as uuidv4 } from 'uuid'
import { DynamoDB } from 'aws-sdk'

import {
  DynamoDBClient,
  ScanCommand,
  ScanCommandInput,
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

    this.dynamoDB = new DynamoDB.DocumentClient(options)
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

  async fetch(id: string): Promise<TaskType | null> {
    try {
      const params: DynamoDB.DocumentClient.GetItemInput = {
        Key: { id },
        TableName: this.tableName,
      }
      const result = await this.dynamoDB.get(params).promise()
      return result.Item as TaskType | null
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
        expressionAttributeValues[':text'] = text
        expressionAttributeNames['#text'] = 'text'
      }

      if (done !== undefined) {
        updateExpressionParts.push('#done = :done')
        expressionAttributeValues[':done'] = done
        expressionAttributeNames['#done'] = 'done'
      }

      updateExpressionParts.push('#updatedAt = :updatedAt')
      expressionAttributeValues[':updatedAt'] = new Date().getTime().toString()
      expressionAttributeNames['#updatedAt'] = 'updatedAt'

      const updateExpression = `set ${updateExpressionParts.join(', ')}`

      const params: DynamoDB.DocumentClient.UpdateItemInput = {
        TableName: this.tableName,
        Key: {
          id: id,
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      }

      const updatedTask = await this.dynamoDB.update(params).promise()
      return updatedTask
    } catch (error) {
      console.error('Error modifying task', error)
      throw error
    }
  }

  async create(text: string) {
    try {
      const timestamp = new Date().getTime()

      const params: DynamoDB.DocumentClient.PutItemInput = {
        TableName: this.tableName,
        Item: {
          id: uuidv4(),
          text: text,
          done: false,
          createdAt: timestamp.toString(),
          updatedAt: timestamp.toString(),
        },
      }

      const results = await this.dynamoDB.put(params).promise()
      return results
    } catch (error) {
      console.error('Error creating task', error)
      throw error
    }
  }

  async delete(id: string) {
    try {
      const deleteParams: DynamoDB.DocumentClient.DeleteItemInput = {
        TableName: this.tableName,
        Key: {
          id,
        },
      }

      await this.dynamoDB.delete(deleteParams).promise()
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
