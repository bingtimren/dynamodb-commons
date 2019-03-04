# dynamodb-commons

A collection of AWS dynamodb utilities and helper functions

## Build and release

To build, simply `tsc`

To release, first `npm login`, then check version and `npm publish`

## Usage

To use the javascript/typescript functions, `npm install dynamodb-commons`

To use the commandline tools, `sudo npm install -g dynamodb-commons`

## (CLI tool) ddb-batchwrite

```
Usage: ddb-batchwrite [options] <aws_profile> <jsonFile> <tableName>
```

**aws_profile** is the AWS CLI configuration profile. Must be provided explicitly. Default profile is "default".

**jsonFile** is a JSON file containing an array of objects to be batch written into the table.

**tableName** is the name of the table

## (function) batch-loop

For Javascript, `require 'dynamodb-commons/batch-loop'` etc.

For Typescript, `import {} from 'dynamodb-commons/batch-loop'` etc.

See source code comments for details.

```
/**
 * write objects into table in batch, automatically separate objects into batches and retry each
 * batch write in a loop if there is unprocessed items
 * @param dbDocClient
 * @param tableName
 * @param items an array of objects to be batch put into table
 * @param maxBatchItems
 * @param maxLoop
 * @param minDelay
 * @param maxDelay
 */
function dbBatchWriteToTable(dbDocClient, tableName, items, maxBatchItems, maxLoop, minDelay, maxDelay)...

/**
 * Do batchwrite in a loop until no unprocessed items left
 * @param dbDocClient - AWS.DynamoDB.DocumentClient
 * @param params - AWS.DynamoDB.DocumentClient.BatchWriteItemInput
 * @param maxLoop - optional, maximum number of loops, default 20
 * @param minDelay - optional, minimum delay in milliseconds, default 500
 * @param maxDelay - optional, maximum delay in milliseconds, default 2500
 * @returns response, either (1) Without unprocessed, signaling finish, or
 *            (2) WITH unprocessed, done maximum loops
 */
function dbBatchWriteLoop(dbDocClient, params, maxLoop, minDelay, maxDelay)...

```