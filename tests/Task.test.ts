import Task from '../model/Task'
import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb'
import { mockClient } from 'aws-sdk-client-mock'
import 'aws-sdk-client-mock-jest'

const mockUuid = '775b765f-bb9e-46aa-9e9e-3861788bc027'

jest.mock('uuid', () => ({
  v4: jest.fn(() => mockUuid),
}))

describe('Task', () => {
  let task: Task
  let mockDynamoDBClient

  beforeEach(() => {
    mockDynamoDBClient = mockClient(DynamoDBClient)
    task = new Task('test-table')
  })

  afterEach(() => {
    mockDynamoDBClient.reset()
    jest.clearAllMocks()
  })

  describe('list', () => {
    it('should return an array of tasks', async () => {
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
            id: { S: 'f79ff465-9303-4463-b99f-249e1193bd1e' },
            text: { S: 'Task 2' },
            done: { BOOL: false },
            createdAt: { S: '2024-02-23T00:00:00.000Z' },
            updatedAt: { S: '2024-02-23T00:00:00.000Z' },
          },
        ],
      })

      let result = await task.list()
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('775b765f-bb9e-46aa-9e9e-3861788bc027')
      expect(result[1].id).toBe('f79ff465-9303-4463-b99f-249e1193bd1e')
    })

    it('should return an empty array of tasks', async () => {
      mockDynamoDBClient.on(ScanCommand).resolves({
        Items: [],
      })

      const result = await task.list()
      expect(result).toHaveLength(0)
    })
  })

  describe('fetch', () => {
    it('should fetch a task by ID', async () => {
      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: {
          id: { S: '775b765f-bb9e-46aa-9e9e-3861788bc027' },
          text: { S: 'Task 1' },
          done: { BOOL: false },
          createdAt: { S: '2024-02-23T00:00:00.000Z' },
          updatedAt: { S: '2024-02-23T00:00:00.000Z' },
        },
      })

      const result = await task.fetch('1')
      expect(result).not.toBeNull()
    })

    it('should fetch a task by ID but fail', async () => {
      mockDynamoDBClient.on(GetItemCommand).resolves({
        Item: null,
      })
      const result = await task.fetch('1')
      expect(result).toBeNull()
    })
  })

  describe('create', () => {
    it('should create a task', async () => {
      const mockDate = new Date('2024-02-23T00:00:00.000Z')
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate)

      await task.create('Do some things 1')
      expect(mockDynamoDBClient).toHaveReceivedCommand(PutItemCommand)
      expect(mockDynamoDBClient).toHaveReceivedCommandWith(PutItemCommand, {
        Item: {
          createdAt: { S: '1708646400000' },
          done: { BOOL: false },
          id: { S: '775b765f-bb9e-46aa-9e9e-3861788bc027' },
          text: { S: 'Do some things 1' },
          updatedAt: { S: '1708646400000' },
        },
        TableName: 'test-table',
      })
    })
  })

  describe('modify', () => {
    it('should modify a task', async () => {
      mockDynamoDBClient.on(UpdateItemCommand).resolves({
        Item: {
          id: { S: '775b765f-bb9e-46aa-9e9e-3861788bc027' },
          text: { S: 'Do some things 2' },
          done: { BOOL: true },
          createdAt: { S: '2024-02-23T00:00:00.000Z' },
          updatedAt: { S: '2024-02-23T00:00:00.000Z' },
        },
      })

      const mockDate = new Date('2024-02-23T00:00:00.000Z')
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate)

      const params = task.buildModifyInput(
        '775b765f-bb9e-46aa-9e9e-3861788bc027',
        'Do some things 2',
        true
      )
      const response = await task.modify(
        '775b765f-bb9e-46aa-9e9e-3861788bc027',
        'Do some things 2',
        true
      )

      expect(response).toEqual({
        Item: {
          id: { S: '775b765f-bb9e-46aa-9e9e-3861788bc027' },
          text: { S: 'Do some things 2' },
          done: { BOOL: true },
          createdAt: { S: '2024-02-23T00:00:00.000Z' },
          updatedAt: { S: '2024-02-23T00:00:00.000Z' },
        },
      })
      expect(mockDynamoDBClient).toHaveReceivedCommand(UpdateItemCommand)
      expect(mockDynamoDBClient).toHaveReceivedCommandWith(
        UpdateItemCommand,
        params
      )
    })
  })

  describe('remove', () => {
    it('should delete a task', async () => {
      await task.delete('775b765f-bb9e-46aa-9e9e-3861788bc027')
      expect(mockDynamoDBClient).toHaveReceivedCommandWith(DeleteItemCommand, {
        TableName: 'test-table',
        Key: {
          id: {
            S: '775b765f-bb9e-46aa-9e9e-3861788bc027',
          },
        },
      })
    })
  })
})
