import { DynamoDB } from 'aws-sdk'

export default class Task {
  tableName: string
  dynamoDB: AWS.DynamoDB.DocumentClient

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
  }

  async list(): Promise<TaskType[]> {
    const params: AWS.DynamoDB.DocumentClient.ScanInput = {
      TableName: this.tableName,
    }

    try {
      const result = await this.dynamoDB.scan(params).promise()

      if (result.Items) {
        return result.Items.map((task: any) => ({
          id: task.id,
          text: task.text,
          done: task.done,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        })) as TaskType[]
      }

      return []
    } catch (error) {
      console.error('Error listing tasks:', error)
      throw error
    }
  }

  async fetch(id: string) {
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

      if (text) {
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
}

type TaskType = {
  id: string
  text: string
  done: string
  createdAt: string
  updatedAt: string
}
