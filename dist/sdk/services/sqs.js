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
exports.SQSSdk = void 0;
// AWS SDK
const sqs = __importStar(require("@aws-sdk/client-sqs"));
// Response
const response_1 = require("../../models/response");
class SQSSdk {
    /**
     * Create a sdk object for amazon sqs
     * @param config configuration for client
     */
    constructor(config) {
        // Create the params for client
        const params = {
            credentials: config.credentials ? {
                accessKeyId: config.credentials.AccessKeyId,
                expiration: config.credentials.Expiration ? new Date(config.credentials.Expiration) : undefined,
                secretAccessKey: config.credentials.SecretAccessKey,
                sessionToken: config.credentials.SessionToken
            } : undefined,
            region: config.region
        };
        // Create a client for amazon sqs
        this._client = new sqs.SQSClient(params);
    }
    /**
     * Destroy a client for amazon sqs
     */
    destroy() {
        this._client.destroy();
    }
    /**
     * Get a queue arn
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-sqs/interfaces/getqueueattributescommandinput.html
     * @param queueUrl queue url
     * @returns queue arn
     */
    async getQueueArn(queueUrl) {
        try {
            // Create an input to get a queue arn
            const input = {
                AttributeNames: ["QueueArn"],
                QueueUrl: queueUrl
            };
            // Create a command to get a queue arn
            const command = new sqs.GetQueueAttributesCommand(input);
            // Send a command to get a queue arn
            const response = await this._client.send(command);
            // Return
            return response.Attributes ? response.Attributes.QueueArn : "";
        }
        catch (err) {
            return (0, response_1.catchError)(response_1.CODE.ERROR.SQS.QUEUE.GET_ARN, false, queueUrl, err);
        }
    }
    /**
     * Get a queue url
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-sqs/interfaces/getqueueurlcommandinput.html
     * @param queueName queue name
     * @param accountId account id of queue owner
     * @returns queue url
     */
    async getQueueUrl(queueName, accountId) {
        try {
            // Create an input to get a queue url
            const input = {
                QueueName: queueName,
                QueueOwnerAWSAccountId: accountId
            };
            // Create a command to get a queue url
            const command = new sqs.GetQueueUrlCommand(input);
            // Send a command to get a queue url
            const response = await this._client.send(command);
            // Return
            return response.QueueUrl;
        }
        catch (err) {
            return (0, response_1.catchError)(response_1.CODE.ERROR.SQS.QUEUE.GET_URL, false, queueName, err);
        }
    }
}
exports.SQSSdk = SQSSdk;
