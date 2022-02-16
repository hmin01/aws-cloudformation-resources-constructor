"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDynamoDBClient = exports.getDynamoDBTableArn = exports.destroyDyanmoDBClient = void 0;
const dynamodb = __importStar(require("@aws-sdk/client-dynamodb"));
// Set a client for dynamodb
let client;
/**
 * Destroy a client for dynamodb
 */
function destroyDyanmoDBClient() {
    client.destroy();
}
exports.destroyDyanmoDBClient = destroyDyanmoDBClient;
/**
 * Get an arn for dynamodb table
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/classes/describetablecommand.html
 * @param tableName name for dynamodb table
 * @returns arn for dynamodb table
 */
async function getDynamoDBTableArn(tableName) {
    try {
        // Create the input to get arn for dynamodb table
        const input = {
            TableName: tableName
        };
        // Create the command to get arn for dynamodb table
        const command = new dynamodb.DescribeTableCommand(input);
        // Send the command to get url for dynamodb table
        const response = await client.send(command);
        // Result
        if (response.Table && response.Table.TableArn) {
            return response.Table.TableArn;
        }
        else {
            console.error(`[WARNING] Not found dynamodb table (for ${tableName})`);
            return "";
        }
    }
    catch (err) {
        console.error(`[WARNING] Not found dynamodb table (for ${tableName})`);
        return "";
    }
}
exports.getDynamoDBTableArn = getDynamoDBTableArn;
/**
 * Init a client for dynamodb
 */
function initDynamoDBClient() {
    client = new dynamodb.DynamoDBClient({ region: process.env.REGION });
}
exports.initDynamoDBClient = initDynamoDBClient;
