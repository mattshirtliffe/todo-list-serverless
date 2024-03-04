import { handler } from '../list'
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb'
import { mockClient } from 'aws-sdk-client-mock'

describe('list Function', () => {
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

  it('should return 200', async () => {
    mockDynamoDBClient.on(ScanCommand).resolves({
      Items: [
        {
          id: { S: '775b765f-bb9e-46aa-9e9e-3861788bc027' },
          text: { S: 'Task 1' },
          done: { BOOL: false },
          createdAt: { S: '2024-02-23T00:00:00.000Z' },
          updatedAt: { S: '2024-02-23T00:00:00.000Z' },
        },
        {
          id: { S: '775b765f-bb9e-46aa-9e9e-3861788bc027' },
          text: { S: 'Task 2' },
          done: { BOOL: false },
          createdAt: { S: '2024-02-23T00:00:00.000Z' },
          updatedAt: { S: '2024-02-23T00:00:00.000Z' },
        },
      ],
    })
    const response = await handler({} as any)
    expect(response.statusCode).toBe(200)
  })
})
