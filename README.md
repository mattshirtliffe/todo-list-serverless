# Serverless Framework Todo List Node HTTP API on AWS

A Todo list API with Node.js and TypeScript running on AWS Lambda, API Gateway and Dynamodb using the Serverless Framework.

## Usage

### Deployment

```
$ serverless deploy --aws-profile <yourprofile>
```

After deploying, you should see output similar to:

```bash
✔ Service deployed to stack todo-list-dev (82s)

endpoints:
  GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/
  POST - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/tasks
  GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/tasks
  GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/tasks/{id}
  PUT - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/tasks/{id}
functions:
  api: todo-list-dev-api (18 MB)
  create: todo-list-dev-create (18 MB)
  list: todo-list-dev-list (18 MB)
  fetch: todo-list-dev-fetch (18 MB)
  modify: todo-list-dev-modify (18 MB)
```

### Invocation

After successful deployment, you can call the created application via HTTP:

```bash
curl https://xxxxxxx.execute-api.us-east-1.amazonaws.com/
```

Which should result in response similar to the following (removed `input` content for brevity):

```json
{
  "message": "Go Serverless v2.0! Your function executed successfully!",
  "input": {
    ...
  }
}
```

### Local development

You can bring up a local development environment using the following command:

```bash
docker compose up

aws dynamodb create-table --endpoint-url http://localhost:8000 --region localhost --cli-input-json file://create-table.json

serverless offline start --aws-profile sso
```

This will start up Docker with Dynamodb, create the task table, and then start the API offline.
