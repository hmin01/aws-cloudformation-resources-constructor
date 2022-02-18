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
exports.LambdaSdk = void 0;
const fs_1 = require("fs");
// AWS SDK
const lambda = __importStar(require("@aws-sdk/client-lambda"));
// Services
const dynamodb_1 = require("./dynamodb");
const sqs_1 = require("./sqs");
// Util
const util_1 = require("../../utils/util");
class LambdaSdk {
    /**
     * Create a client for aws lambda
     * @param config
     */
    constructor(config) {
        // Create a client for aws lambda
        this._client = new lambda.LambdaClient(config);
    }
    /**
     * Check the existing event source mapping
     * @param eventSourceArn arn for evnet source
     * @param functionArn arn for lambda function
     * @returns existence
     */
    async _checkExistingEventSourceMapping(eventSourceArn, functionArn) {
        try {
            // Create an input to get a list of event source mapping
            const input = {
                EventSourceArn: eventSourceArn,
                FunctionName: functionArn
            };
            // Create a command to get a list of event source mapping
            const command = new lambda.ListEventSourceMappingsCommand(input);
            // Send a command to get a list of event source mapping
            const response = await this._client.send(command);
            // Return
            return response.EventSourceMappings && response.EventSourceMappings.length > 0 ? true : false;
        }
        catch (err) {
            console.error(`[ERROR] Failed to get a list of event source mapping (target: ${functionArn})\n-> ${err}`);
            process.exit(12);
        }
    }
    /**
     * Create a function alias
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-lambda/interfaces/createaliascommandinput.html
     * @param functionName function name
     * @param functionVersion function version
     * @param name name for alias
     * @param description description for alias
     */
    async createAlias(functionName, functionVersion, name, description) {
        try {
            // Create an client to create a function alias
            const input = {
                Description: description,
                FunctionName: functionName,
                FunctionVersion: functionVersion,
                Name: name
            };
            // Create a command to create a function alias
            const command = new lambda.CreateAliasCommand(input);
            // Send a command to create a function alias
            await this._client.send(command);
        }
        catch (err) {
            console.error(`[ERROR] Failed to create a funcition alias (target: ${functionName})\n-> ${err}`);
            process.exit(10);
        }
    }
    /**
     * Create the event source mapping
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-lambda/interfaces/createeventsourcemappingcommandinput.html
     * @param config configuration for event source mapping
     */
    async createEventSourceMapping(config) {
        try {
            // Extract a function name and qualifier from function arn
            const functionName = (0, util_1.extractDataFromArn)(config.FunctionArn, "resource");
            const qualifier = (0, util_1.extractDataFromArn)(config.FunctionArn, "qualifier");
            // Get an arn for lambda function
            const functionArn = await this.getFunctionArn(functionName, qualifier);
            // Extract a resource id, service type from arn
            const resourceId = (0, util_1.extractDataFromArn)(config.EventSourceArn, "resource");
            const serviceType = (0, util_1.extractDataFromArn)(config.EventSourceArn, "service");
            // Extract a event source arn
            let eventSourceArn;
            switch (serviceType) {
                case "dynamodb":
                    // Create a sdk client for amazon dynamodb
                    const dynamodb = new dynamodb_1.DynamoDBSdk({ region: process.env.REGION });
                    // Get a queue arn
                    eventSourceArn = await dynamodb.getTableArn(resourceId);
                    // Destroy a sdk client for amazon dynamodb
                    dynamodb.destroy();
                    break;
                case "kinesis":
                    eventSourceArn = config.EventSourceArn;
                    break;
                case "sqs":
                    // Create a sdk client for amazon sqs
                    const sqs = new sqs_1.SQSSdk({ region: process.env.REGION });
                    // Get a queue url
                    const queueUrl = await sqs.getQueueUrl(resourceId);
                    // Get a queue arn
                    eventSourceArn = await sqs.getQueueArn(queueUrl);
                    // Destroy a sdk client for amazon sqs
                    sqs.destroy();
                    break;
                default:
                    eventSourceArn = config.EventSourceArn;
                    break;
            }
            // Check existence
            const existence = await this._checkExistingEventSourceMapping(eventSourceArn, functionArn);
            if (existence) {
                console.warn(`[WARNING] Mapping for these services already exists`);
                return;
            }
            // Create an input to create the event source mapping
            const input = {
                BatchSize: config.BatchSize ? Number(config.BatchSize) : undefined,
                BisectBatchOnFunctionError: config.BisectBatchOnFunctionError,
                Enabled: config.State && (config.State === "Enabled" || config.State === "Creating" || config.State === "Updating") ? true : false,
                EventSourceArn: eventSourceArn,
                FilterCriteria: config.FilterCriteria,
                FunctionName: functionArn,
                FunctionResponseTypes: config.FunctionResponseTypes && config.FunctionResponseTypes.length > 0 ? config.FunctionResponseTypes : undefined,
                MaximumBatchingWindowInSeconds: config.MaximumBatchingWindowInSeconds ? Number(config.MaximumBatchingWindowInSeconds) : undefined,
                MaximumRecordAgeInSeconds: config.MaximumRecordAgeInSeconds ? Number(config.MaximumRecordAgeInSeconds) : undefined,
                MaximumRetryAttempts: config.MaximumRetryAttempts ? Number(config.MaximumRetryAttempts) : undefined,
                ParallelizationFactor: config.ParallelizationFactor ? Number(config.ParallelizationFactor) : undefined,
                TumblingWindowInSeconds: config.TumblingWindowInSeconds ? Number(config.TumblingWindowInSeconds) : undefined
            };
            // Create a command to create the event source mapping
            const command = new lambda.CreateEventSourceMappingCommand(input);
            // Send a command to create the event source mapping
            await this._client.send(command);
        }
        catch (err) {
            console.error(`[ERROR] Failed to create the event source mapping`);
            process.exit(13);
        }
    }
    /**
     * Destroy a client for aws lambda
     * @returns
     */
    destroy() {
        return this._client.destroy();
    }
    /**
     * Get a function arn
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-lambda/interfaces/getfunctionconfigurationcommandinput.html
     * @param functionName function name
     * @param qualifier version or alias for function
     * @returns arn for lambda function
     */
    async getFunctionArn(functionName, qualifier) {
        try {
            // Create an input to get a function arn
            const input = {
                FunctionName: functionName,
                Qualifier: qualifier !== "" ? qualifier : undefined
            };
            // Create a command to get a function arn
            const command = new lambda.GetFunctionConfigurationCommand(input);
            // Create a command to get a function arn
            const response = await this._client.send(command);
            // Return
            return response.FunctionArn ? response.FunctionArn : "";
        }
        catch (err) {
            console.error(`[ERROR] Failed to get a function arn (target: ${functionName})\n-> ${err}`);
            process.exit(11);
        }
    }
    /**
     * Publish the lambda function version
     * @param functionName function name
     * @param description description for version
     * @returns version value
     */
    async publishVersion(functionName, description) {
        try {
            // Create an input to publish the function version
            const input = {
                Description: description,
                FunctionName: functionName
            };
            // Create a command to publish the function version
            const command = new lambda.PublishVersionCommand(input);
            // Send a command to publish the function version
            const response = await this._client.send(command);
            // Return
            return response.Version;
        }
        catch (err) {
            console.error(`[ERROR] Failed to publish the function version (target: ${functionName})\n-> ${err}`);
            process.exit(15);
        }
    }
    /**
     * Update the function code
     * @param functionName function name
     * @param location stored location for code
     */
    async updateCode(functionName, location) {
        try {
            // Load a code file
            const data = await (0, util_1.streamToBuffer)((0, fs_1.createReadStream)(location));
            // Create an input to update the function code
            const input = {
                FunctionName: functionName,
                ZipFile: new Uint8Array(data)
            };
            // Create a command to update the function code
            const command = new lambda.UpdateFunctionCodeCommand(input);
            // Send a command to update the function code
            await this._client.send(command);
            // Wait for update
            await lambda.waitUntilFunctionUpdated({ client: this._client, maxWaitTime: 30, maxDelay: 1, minDelay: 1 }, { FunctionName: functionName });
        }
        catch (err) {
            console.error(`[ERROR] Failed to update the function code (for ${functionName})\n-> ${err}`);
            process.exit(14);
        }
    }
}
exports.LambdaSdk = LambdaSdk;
