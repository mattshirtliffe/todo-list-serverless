import Task from '../model/Task'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

jest.mock('@aws-sdk/client-dynamodb')

describe('Task', () => {
  let task: Task
  let mockSend: jest.Mock

  beforeEach(() => {
    mockSend = jest.fn()
    ;(DynamoDBClient as jest.Mock).mockImplementation(() => ({
      send: mockSend,
    }))
    task = new Task('test-table')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('list', () => {
    it('should return an array of tasks', async () => {
      mockSend.mockResolvedValueOnce({
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

      mockSend.mockResolvedValueOnce({
        Items: [],
      })

      result = await task.list()
      expect(result).toHaveLength(0)
      expect(result).toEqual([])
    })

    it('should return an empty array of tasks', async () => {
      mockSend.mockResolvedValueOnce({
        Items: [],
      })

      const result = await task.list()
      expect(result).toHaveLength(0)
    })
  })

  describe('fetch', () => {
    it('should fetch a task by ID', async () => {
      mockSend.mockResolvedValueOnce({
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
      mockSend.mockResolvedValueOnce({
        Item: null,
      })
      const result = await task.fetch('1')
      expect(result).toBeNull()
    })
  })

  describe('create', () => {
    it('should create a task', async () => {
      await task.create('Do some things 1')
      expect(mockSend).toHaveBeenCalledTimes(1)
    })
  })
})
