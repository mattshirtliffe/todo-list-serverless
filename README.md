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

You can invoke your function locally by using the following command:

```bash
serverless invoke local --function hello
```

Which should result in response similar to the following:

```
{
  "statusCode": 200,
  "body": "{\n  \"message\": \"Go Serverless v3.0! Your function executed successfully!\",\n  \"input\": \"\"\n}"
}
```

Alternatively, it is also possible to emulate API Gateway and Lambda locally by using `serverless-offline` plugin. In order to do that, execute the following command:

```bash
serverless plugin install -n serverless-offline
```

It will add the `serverless-offline` plugin to `devDependencies` in `package.json` file as well as will add it to `plugins` in `serverless.yml`.

After installation, you can start local emulation with:

```
serverless offline
```

To learn more about the capabilities of `serverless-offline`, please refer to its [GitHub repository](https://github.com/dherault/serverless-offline).
