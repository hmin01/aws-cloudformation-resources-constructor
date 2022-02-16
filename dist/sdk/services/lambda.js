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
exports.setEventSourceMapping = exports.publishVersion = exports.initLambdaClient = exports.getLambdaFunctionArn = exports.destroyLambdaClient = exports.createAlias = void 0;
const lambda = __importStar(require("@aws-sdk/client-lambda"));
// Services
const dynamodb_1 = require("./dynamodb");
const sqs_1 = require("./sqs");
// Util
const util_1 = require("../../utils/util");
// Set a client for lambda
let client;
// Set the version mapping
const versionMapping = {};
/**
 * Create an alias for lambda function
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-lambda/classes/createaliascommand.html
 * @param config configuration for alias of lambda function
 */
async function createAlias(config) {
    // Extract the configuration
    const version = versionMapping[config.FunctionVersion];
    if (version !== undefined && version.FunctionName !== undefined) {
        // Create the input to create alias
        const input = {
            Description: config.Description,
            FunctionName: version.FunctionName,
            FunctionVersion: version.Version,
            Name: config.Name
        };
        // Create the command to create alias
        const command = new lambda.CreateAliasCommand(input);
        // Send the command to create alias
        const response = await client.send(command);
        // Result
        if (response.AliasArn !== undefined) {
            console.info(`[NOTICE] Create alias (for ${version.FunctionName} / ${response.Name})`);
        }
        else {
            console.error(`[ERROR] Failed to create alias (for ${version.FunctionName})`);
            process.exit(1);
        }
    }
}
exports.createAlias = createAlias;
/**
 * Destroy a client for lambda
 */
function destroyLambdaClient() {
    client.destroy();
}
exports.destroyLambdaClient = destroyLambdaClient;
/**
 * Extract the stored location for lambda code
 * @param location location path (for s3 uri)
 * @returns s3 bucket name and key or undefined
 */
function extractStoredLocation(location) {
    const regex = new RegExp("^s3://");
    if (regex.test(location)) {
        // Extract a bucket name and key
        const split = location.replace(/^s3:\/\//g, "").split("/");
        const bucketName = split[0];
        const key = split.slice(1).join("/");
        // Return
        return { bucketName, key };
    }
    else {
        return undefined;
    }
}
/**
 * Get an arn for lambda function
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-lambda/classes/getfunctionconfigurationcommand.html
 * @param functionName name for lambda function
 * @param qualifier version or alias for lambda function
 */
async function getLambdaFunctionArn(functionName, qualifier) {
    try {
        // Create the input to get arn for lambda function
        const input = {
            FunctionName: functionName,
            Qualifier: qualifier
        };
        // Create the command to get arn for lambda function
        const command = new lambda.GetFunctionConfigurationCommand(input);
        // Send the command to get arn for lambda function
        const response = await client.send(command);
        // Result
        if (response && response.FunctionArn) {
            return response.FunctionArn;
        }
        else {
            console.error(`[WARNING] Not found lambda function (for ${functionName})`);
            return "";
        }
    }
    catch (err) {
        console.error(`[WARNING] Not found lambda function (for ${functionName})`);
        return "";
    }
}
exports.getLambdaFunctionArn = getLambdaFunctionArn;
/**
 * Init a client for lambda
 */
function initLambdaClient() {
    client = new lambda.LambdaClient({ region: process.env.REGION });
}
exports.initLambdaClient = initLambdaClient;
/**
 * Create the version (and update lambda function)
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-lambda/classes/publishversioncommand.html
 * @param config configuration for version of lambda function
 */
async function publishVersion(config) {
    // Extract the stored location (s3 location)
    const storedLocation = config.StoredLocation !== undefined ? extractStoredLocation(config.StoredLocation) : undefined;
    if (config.Version !== "$LATEST" && storedLocation !== undefined) {
        // Create the properties to update lambda function code
        const updateProps = {
            FunctionName: config.FunctionName,
            S3Bucket: storedLocation.bucketName,
            S3Key: storedLocation.key
        };
        // Create the command to update lambda function code
        const updateCommand = new lambda.UpdateFunctionCodeCommand(updateProps);
        // Send command to update function code
        const updateResponse = await client.send(updateCommand);
        // Result
        if (updateResponse.FunctionName !== undefined) {
            console.info(`[NOTICE] Update lambda function code (${updateResponse.FunctionName})`);
        }
        else {
            console.error(`[ERROR] Failed to update lambda function code`);
            process.exit(1);
        }
        // Delay
        await (0, util_1.delay)(1500);
        // Create the input to publish version
        const publishProps = {
            FunctionName: updateResponse.FunctionName,
            Description: config.Description !== undefined && config.Description !== "" ? config.Description : undefined
        };
        // Create the command to publish version
        const publishCommand = new lambda.PublishVersionCommand(publishProps);
        // Send command to publish version
        const publishResponse = await client.send(publishCommand);
        // Result
        if (publishResponse.FunctionName !== undefined) {
            console.info(`[NOTICE] Publish version (for ${publishResponse.FunctionName}:${publishResponse.Version})`);
            versionMapping[config.Version] = publishResponse;
        }
        else {
            console.error(`[ERROR] Failed to publish version`);
            process.exit(1);
        }
    }
}
exports.publishVersion = publishVersion;
/**
 * Set the event source mapping
 * @param config configuration for event source mapping
 */
async function setEventSourceMapping(config) {
    // Extract a event source arn
    let eventSourceArn;
    // Extract a service type and resource id from arn
    const serviceType = (0, util_1.extractDataFromArn)(config.EventSourceArn, "service");
    let resourceId = (0, util_1.extractDataFromArn)(config.EventSourceArn, "resource");
    switch (serviceType) {
        case "dynamodb":
            eventSourceArn = await (0, dynamodb_1.getDynamoDBTableArn)(resourceId);
            break;
        case "kinesis":
            // Progress
            eventSourceArn = config.EventSourceArn;
            break;
        case "sqs":
            eventSourceArn = await (0, sqs_1.getSqsQueueArn)(resourceId);
            break;
        default:
            // Progress
            eventSourceArn = config.EventSourceArn;
            break;
    }
    // Extract a function name from arn
    const functionName = (0, util_1.extractDataFromArn)(config.FunctionArn, "resource");
    if (functionName !== "") {
        // Extract a qualifier from arn and get arn for lambda
        const qualifier = (0, util_1.extractDataFromArn)(config.FunctionArn, "qualifier");
        const functionArn = await getLambdaFunctionArn(functionName, qualifier !== "" ? qualifier : undefined);
        // Catch error
        if (eventSourceArn === "" || functionArn === "") {
            console.error(`[ERROR] Failed to create event source mapping`);
            process.exit(1);
        }
        // Create the input for list event source mapping
        const inputForList = {
            EventSourceArn: eventSourceArn,
            FunctionName: functionArn
        };
        // Create the command for list event source mapping
        const cmdForList = new lambda.ListEventSourceMappingsCommand(inputForList);
        // Send the command for list event source mapping
        const resForList = await client.send(cmdForList);
        // Result
        if (resForList.EventSourceMappings !== undefined && resForList.EventSourceMappings.length > 0) {
            console.error(`[WARNING] Mapping for these services already exists`);
            return;
        }
        // Create the input to create event source mapping
        const inputForCreate = {
            BatchSize: config.BatchSize !== undefined ? Number(config.BatchSize) : undefined,
            BisectBatchOnFunctionError: config.BisectBatchOnFunctionError,
            // DestinationConfig: config.DestinationConfig !== undefined ? {
            //   OnFailure: config.DestinationConfig.OnFailure !== undefined ? {
            //     Destination 
            //   } : undefined,
            // } : undefined,
            Enabled: config.State !== undefined && (config.State === "Enabled" || config.State === "Creating" || config.State === "Updating") ? true : false,
            EventSourceArn: eventSourceArn,
            FilterCriteria: config.FilterCriteria,
            FunctionName: functionArn,
            FunctionResponseTypes: config.FunctionResponseTypes !== undefined && config.FunctionResponseTypes.length > 0 ? config.FunctionResponseTypes : undefined,
            MaximumBatchingWindowInSeconds: config.MaximumBatchingWindowInSeconds !== undefined ? Number(config.MaximumBatchingWindowInSeconds) : undefined,
            MaximumRecordAgeInSeconds: config.MaximumRecordAgeInSeconds !== undefined ? Number(config.MaximumRecordAgeInSeconds) : undefined,
            MaximumRetryAttempts: config.MaximumRetryAttempts !== undefined ? Number(config.MaximumRetryAttempts) : undefined,
            ParallelizationFactor: config.ParallelizationFactor !== undefined ? Number(config.ParallelizationFactor) : undefined,
            TumblingWindowInSeconds: config.TumblingWindowInSeconds !== undefined ? Number(config.TumblingWindowInSeconds) : undefined
        };
        // Create the command to create event source mapping
        const cmdForCreate = new lambda.CreateEventSourceMappingCommand(inputForCreate);
        // Send command to create event source mapping
        const resForCreate = await client.send(cmdForCreate);
        // Result
        if (resForCreate.UUID !== undefined) {
            console.info(`[NOTICE] Create the event source mapping (for ${resForCreate.UUID})`);
        }
        else {
            console.error(`[ERROR] Failed to create event source mapping`);
            process.exit(1);
        }
    }
    else {
        console.error(`[ERROR] Not found for lambda function name (for ${config.FunctionArn})`);
        process.exit(1);
    }
}
exports.setEventSourceMapping = setEventSourceMapping;
