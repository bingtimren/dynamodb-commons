// import entire SDK
import AWS = require('aws-sdk');

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
export async function dbBatchWriteToTable(
    dbDocClient: AWS.DynamoDB.DocumentClient,    
    tableName: string,
    items: object[],
    maxBatchItems = 25,
    maxLoop: number = 20,
    minDelay: number = 500,
    maxDelay: number = 2500    
){
    const writes : AWS.DynamoDB.DocumentClient.WriteRequests = []
    const request:AWS.DynamoDB.DocumentClient.BatchWriteItemInput = {
        RequestItems:{
            [tableName]:writes
        }
    }
    const cloneArray = items.slice(0)
    while (cloneArray.length > 0) {
        writes.length = 0 // clear the array
        let batch = cloneArray.splice(0, maxBatchItems) // get the batch
        for (let o of batch) {
            writes.push({PutRequest:{Item:o}})
        }
        let res = await dbBatchWriteLoop(dbDocClient,request,maxLoop,minDelay,maxDelay)
        if (res.UnprocessedItems!==undefined && Object.keys(res.UnprocessedItems).length>0) {
            throw {
                error: "Still UnprocessedItems after loop",
                lastBatchWriteResponse: res
            }
        }
    }
}

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
export async function dbBatchWriteLoop(
    dbDocClient: AWS.DynamoDB.DocumentClient,
    params: AWS.DynamoDB.DocumentClient.BatchWriteItemInput,
    maxLoop: number = 20,
    minDelay: number = 500,
    maxDelay: number = 2500): Promise<AWS.DynamoDB.DocumentClient.BatchWriteItemOutput> {
    let batchWriteResp : AWS.DynamoDB.DocumentClient.BatchWriteItemOutput|undefined = undefined
    try {
        batchWriteResp = await dbDocClient.batchWrite(params).promise();
        let loop:number = 0
        do {
            let unprocessed = batchWriteResp.UnprocessedItems
            loop += 1
            // return, if no more unprocessed items, or this is the last loop
            if ((unprocessed === undefined || Object.keys(unprocessed).length === 0) || (loop === maxLoop)) {
                return batchWriteResp
            }
            // prepare to retry
            params = { RequestItems: unprocessed }
            // delay a random time 
            const delay = Math.floor(Math.random() * (maxDelay - minDelay) + minDelay)
            await new Promise(resolve => setTimeout(resolve, delay));
        } while(true);
    } catch (error) {
        throw {
            error: error,
            lastBatchWriteResponse: batchWriteResp
        }
    }

}


