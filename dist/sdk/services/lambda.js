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
// Response
const response_1 = require("../../models/response");
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
        // Create a client for aws lambda
        this._client = new lambda.LambdaClient(params);
    }
    /**
     * Check the existing alias
     * @param functionName function name
     * @param name name for alias
     * @returns existence
     */
    async _checkExistingAlias(functionName, name) {
        try {
            // Create an input to get an alias
            const input = {
                FunctionName: functionName,
                Name: name
            };
            // Create a command to get an alias
            const command = new lambda.GetAliasCommand(input);
            // Send a command to get an alias
            const response = await this._client.send(command);
            // Process a result
            if (response.AliasArn) {
                return true;
            }
            else {
                return false;
            }
        }
        catch (err) {
            (0, response_1.catchError)(response_1.CODE.ERROR.LAMBDA.FUNCTION.GET_ALIAS, false, functionName, err);
            // Return
            return false;
        }
    }
    /**
     * Check the existing event source mappings
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
            return response.EventSourceMappings ? response.EventSourceMappings : [];
        }
        catch (err) {
            (0, response_1.catchError)(response_1.CODE.ERROR.LAMBDA.FUNCTION.GET_EVENT_SOURCE_MAPPINGS, false, eventSourceArn, err);
            // Return
            return [];
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
            // Check the existing for alias
            const existence = await this._checkExistingAlias(functionName, name);
            if (!existence) {
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
            else {
                console.warn(`[WARNING] That alias already exists`);
            }
        }
        catch (err) {
            (0, response_1.catchError)(response_1.CODE.ERROR.LAMBDA.FUNCTION.CREATE_ALIAS, true, functionName, err);
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
                    const dynamodb = new dynamodb_1.DynamoDBSdk({ region: process.env.TARGET_REGION });
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
                    const sqs = new sqs_1.SQSSdk({ region: process.env.TARGET_REGION });
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
            const eventSourceMappings = await this._checkExistingEventSourceMapping(eventSourceArn, functionArn);
            if (eventSourceMappings.length > 0) {
                console.warn(`[WARNING] Mapping for these services already exists`);
                // Activate the event source mappings
                for (const elem of eventSourceMappings) {
                    // Extract a enabled status
                    const enabled = elem.State === "Disabling" || elem.State === "Disable" || elem.State === "Deleting" ? false : true;
                    // Update an event source mapping
                    await this.updateEventSourceMapping(elem.UUID, { Enabled: enabled });
                }
                // Return
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
            (0, response_1.catchError)(response_1.CODE.ERROR.LAMBDA.FUNCTION.CREATE_EVENT_SOURCE_MAPPING, false, undefined, err);
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
            return (0, response_1.catchError)(response_1.CODE.ERROR.LAMBDA.FUNCTION.GET_ARN, false, functionName, err);
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
            return (0, response_1.catchError)(response_1.CODE.ERROR.LAMBDA.FUNCTION.PUBLISH_VERSION, false, functionName, err);
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
            (0, response_1.catchError)(response_1.CODE.ERROR.LAMBDA.FUNCTION.UPDATE_CODE, false, functionName, err);
        }
    }
    /**
     * Update an event source mapping
     * @param uuid event source mapping uuid
     * @param config configuration for event source mapping
     */
    async updateEventSourceMapping(uuid, config) {
        try {
            // Create an input to update an event source mapping
            const input = {
                BatchSize: config.BatchSize,
                BisectBatchOnFunctionError: config.BisectBatchOnFunctionError,
                Enabled: config.Enabled,
                MaximumBatchingWindowInSeconds: config.MaximumBatchingWindowInSeconds ? Number(config.MaximumBatchingWindowInSeconds) : undefined,
                MaximumRecordAgeInSeconds: config.MaximumRecordAgeInSeconds ? Number(config.MaximumRecordAgeInSeconds) : undefined,
                MaximumRetryAttempts: config.MaximumRetryAttempts ? Number(config.MaximumRetryAttempts) : undefined,
                ParallelizationFactor: config.ParallelizationFactor ? Number(config.ParallelizationFactor) : undefined,
                TumblingWindowInSeconds: config.TumblingWindowInSeconds ? Number(config.TumblingWindowInSeconds) : undefined,
                UUID: uuid,
            };
            // Create a command to update an event source mapping
            const command = new lambda.UpdateEventSourceMappingCommand(input);
            // Send a command to update an event source mapping
            await this._client.send(command);
        }
        catch (err) {
            (0, response_1.catchError)(response_1.CODE.ERROR.LAMBDA.FUNCTION.UPDATE_EVENT_SOURCE_MAPPING, false, uuid, err);
        }
    }
}
exports.LambdaSdk = LambdaSdk;
