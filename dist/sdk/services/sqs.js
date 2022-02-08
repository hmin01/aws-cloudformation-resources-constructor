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
exports.initSqsClient = exports.getSqsQueueArn = exports.destroySqsClient = void 0;
const sqs = __importStar(require("@aws-sdk/client-sqs"));
// Set a client for sqs
let client;
/**
 * Destroy a client for sqs
 */
function destroySqsClient() {
    client.destroy();
}
exports.destroySqsClient = destroySqsClient;
/**
 * Get an arn for sqs queue
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-sqs/classes/getqueueurlcommand.html
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-sqs/classes/getqueueattributescommand.html
 * @param queueName name for sqs queue
 * @returns arn for sqs queue
 */
async function getSqsQueueArn(queueName, accountId) {
    // Create the input to get url for sqs queue
    const inputForUrl = {
        QueueName: queueName,
        QueueOwnerAWSAccountId: accountId
    };
    // Create the command to get url for sqs queue
    const cmdForUrl = new sqs.GetQueueUrlCommand(inputForUrl);
    // Send the command to get url for sqs queue
    const resForUrl = await client.send(cmdForUrl);
    // Result
    const queueUrl = resForUrl.QueueUrl;
    if (queueUrl === undefined) {
        console.error(`[WARNING] Not found sqs queue (for ${queueName})`);
        return "";
    }
    // Create the input to get arn for sqs queue
    const inputForArn = {
        AttributeNames: ["QueueArn"],
        QueueUrl: queueUrl
    };
    // Create the command to get arn for sqs queue
    const cmdForArn = new sqs.GetQueueAttributesCommand(inputForArn);
    // Send command to get arn for sqs queue
    const resForArn = await client.send(cmdForArn);
    // Result
    if (resForArn.Attributes !== undefined && resForArn.Attributes.QueueArn !== undefined) {
        return resForArn.Attributes.QueueArn;
    }
    else {
        console.error(`[WARNING] Not found sqs queue (for ${queueName})`);
        return "";
    }
}
exports.getSqsQueueArn = getSqsQueueArn;
/**
 * Init a client for sqs
 */
function initSqsClient() {
    client = new sqs.SQSClient({ region: process.env.REGION });
}
exports.initSqsClient = initSqsClient;
