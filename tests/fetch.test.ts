import { handler } from '../fetch'
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb'
import { mockClient } from 'aws-sdk-client-mock'

describe('fetch Function', () => {
  let mockDynamoDBClient

  beforeEach(() => {
    mockDynamoDBClient = mockClient(DynamoDBClient)
  })

  afterEach(() => {
    process.env.DYNAMODB_TABLE = 'test-table'
    mockDynamoDBClient.reset()
    jest.clearAllMocks()
  })

  it('should return 500 if DYNAMODB_TABLE environment variable is not defined', async () => {
    delete process.env.DYNAMODB_TABLE
    const response = await handler({} as any)
    expect(response.statusCode).toBe(500)
  })

  it('should return 400 if no ID is provided in path parameters', async () => {
    const response = await handler({ pathParameters: {} } as any)
    expect(response.statusCode).toBe(400)
  })

  it('should return 404 if task is not found', async () => {
    mockDynamoDBClient.on(GetItemCommand).resolves({ Item: null })

    const response = await handler({ pathParameters: { id: '2' } } as any)
    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual(JSON.stringify({ error: 'Task not found' }))
  })

  it('should return 200', async () => {
    mockDynamoDBClient.on(GetItemCommand).resolves({
      Item: {
        id: { S: '775b765f-bb9e-46aa-9e9e-3861788bc027' },
        text: { S: 'Task 1' },
        done: { BOOL: false },
        createdAt: { S: '2024-02-23T00:00:00.000Z' },
        updatedAt: { S: '2024-02-23T00:00:00.000Z' },
      },
    })
    const response = await handler({
      pathParameters: { id: '775b765f-bb9e-46aa-9e9e-3861788bc027' },
    } as any)
    expect(response.statusCode).toBe(200)
  })
})
