#!/usr/bin/env node
/**
 * Batch put items
 */
import * as program from 'commander'
const {prompt, password, multiline, confirm} = require('async-prompt')
import * as fs from 'fs'
program
    .arguments("<aws_profile> <jsonFile> <tableName>")
    .action(async function(profile:string, filePath:string, tableName:string){
        process.env.AWS_PROFILE=profile
        process.env.AWS_SDK_LOAD_CONFIG = 'true'
        const {dbBatchWriteToTable} = require('./batch-loop')
        const AWS = require('aws-sdk');
        const client = new AWS.DynamoDB.DocumentClient()
        console.log(`AWS_PROFILE=${profile}, jsonFile=${filePath}, tableName=${tableName}`)
        const contentFile = fs.readFileSync(filePath, {encoding:'utf-8'})
        const contentParsed = JSON.parse(contentFile)
        if (!(contentParsed instanceof Array)) {
            console.error("Error: JSON file does not contain an array. Exit.")
            process.exit(1)
        }
        const content:any[] = contentParsed;
        console.log(`Number of records to be batch written into ${tableName}: ${content.length}`)
        
        await dbBatchWriteToTable(client, tableName, content)
        console.log("Done.")
    })
    .parse(process.argv)

