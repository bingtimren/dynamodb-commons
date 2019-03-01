// import entire SDK
import AWS = require('aws-sdk');

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
export async function dbBatchWriteLoop (
    dbDocClient:AWS.DynamoDB.DocumentClient, 
    params:AWS.DynamoDB.DocumentClient.BatchWriteItemInput, 
    maxLoop:number  = 20, 
    minDelay:number =500, 
    maxDelay:number =2500) : Promise<AWS.DynamoDB.DocumentClient.BatchWriteItemOutput|undefined>
    {
    let batchWriteResp: AWS.DynamoDB.DocumentClient.BatchWriteItemOutput|undefined = undefined
    for (var i=0; i<maxLoop; i++){
        // error will be thrown
        try {
            batchWriteResp = await dbDocClient.batchWrite(params).promise()
        let unprocessed = batchWriteResp.UnprocessedItems
        // return, if no more unprocessed items, or this is the last loop
        if ((unprocessed===undefined || Object.keys(unprocessed).length===0) || (i+1===maxLoop)) {
            return batchWriteResp
        }
        // prepare to retry
        params = {RequestItems:unprocessed}
        // delay a random time 
        const delay = Math.floor(Math.random() * (maxDelay - minDelay) + minDelay)
        await new Promise(resolve => setTimeout(resolve, delay));
        } catch (error){
            throw {
                error: error,
                lastBatchWriteResponse : batchWriteResp
            } 
        }
    }
}


