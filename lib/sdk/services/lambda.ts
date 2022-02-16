import * as lambda from "@aws-sdk/client-lambda";
// Services
import { getDynamoDBTableArn } from "./dynamodb";
import { getSqsQueueArn } from "./sqs";
// Util
import { delay, extractDataFromArn } from "../../utils/util";

// Set a client for lambda
let client: lambda.LambdaClient;
// Set the version mapping
const versionMapping: any = {};

/**
 * Create an alias for lambda function
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-lambda/classes/createaliascommand.html
 * @param config configuration for alias of lambda function
 */
export async function createAlias(config: any): Promise<void> {
  // Extract the configuration
  const version: any = versionMapping[config.FunctionVersion];
  if (version !== undefined && version.FunctionName !== undefined) {
    // Create the input to create alias
    const input: lambda.CreateAliasCommandInput = {
      Description: config.Description,
      FunctionName: version.FunctionName,
      FunctionVersion: version.Version,
      Name: config.Name
    };
    // Create the command to create alias
    const command: lambda.CreateAliasCommand = new lambda.CreateAliasCommand(input);
    // Send the command to create alias
    const response: lambda.CreateAliasCommandOutput = await client.send(command);
    // Result
    if (response.AliasArn !== undefined) {
      console.info(`[NOTICE] Create alias (for ${version.FunctionName} / ${response.Name})`);
    } else {
      console.error(`[ERROR] Failed to create alias (for ${version.FunctionName})`);
      process.exit(1);
    }
  }
}

/**
 * Destroy a client for lambda
 */
export function destroyLambdaClient(): void {
  client.destroy();
}

/**
 * Extract the stored location for lambda code
 * @param location location path (for s3 uri)
 * @returns s3 bucket name and key or undefined
 */
function extractStoredLocation(location: string): any {
  const regex: RegExp = new RegExp("^s3://");
  if (regex.test(location)) {
    // Extract a bucket name and key
    const split: string[] = location.replace(/^s3:\/\//g, "").split("/");
    const bucketName: string = split[0];
    const key: string = split.slice(1).join("/");
    // Return
    return { bucketName, key };
  } else {
    return undefined;
  }
}

/**
 * Get an arn for lambda function
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-lambda/classes/getfunctionconfigurationcommand.html
 * @param functionName name for lambda function
 * @param qualifier version or alias for lambda function
 */
export async function getLambdaFunctionArn(functionName: string, qualifier?: string): Promise<string> {
  try {
    // Create the input to get arn for lambda function
    const input: lambda.GetFunctionConfigurationCommandInput = {
      FunctionName: functionName,
      Qualifier: qualifier
    };
    // Create the command to get arn for lambda function
    const command: lambda.GetFunctionConfigurationCommand = new lambda.GetFunctionConfigurationCommand(input);
    // Send the command to get arn for lambda function
    const response: lambda.GetFunctionConfigurationCommandOutput = await client.send(command);
    // Result
    if (response && response.FunctionArn) {
      return response.FunctionArn;
    } else {
      console.error(`[WARNING] Not found lambda function (for ${functionName})`);
      return "";
    }
  } catch (err) {
    console.error(`[WARNING] Not found lambda function (for ${functionName})`);
    return "";
  }
}

/**
 * Init a client for lambda
 */
export function initLambdaClient(): void {
  client = new lambda.LambdaClient({ region: process.env.REGION });
}

/**
 * Create the version (and update lambda function)
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-lambda/classes/publishversioncommand.html
 * @param config configuration for version of lambda function
 */
export async function publishVersion(config: any): Promise<void> {
  // Extract the stored location (s3 location)
  const storedLocation: any = config.StoredLocation !== undefined ? extractStoredLocation(config.StoredLocation) : undefined;
  if (config.Version !== "$LATEST" && storedLocation !== undefined) {
    // Create the properties to update lambda function code
    const updateProps: lambda.UpdateFunctionCodeCommandInput = {
      FunctionName: config.FunctionName,
      S3Bucket: storedLocation.bucketName,
      S3Key: storedLocation.key
    };
    // Create the command to update lambda function code
    const updateCommand: lambda.UpdateFunctionCodeCommand = new lambda.UpdateFunctionCodeCommand(updateProps);
    // Send command to update function code
    const updateResponse: lambda.UpdateFunctionCodeCommandOutput = await client.send(updateCommand);
    // Result
    if (updateResponse.FunctionName !== undefined) {
      console.info(`[NOTICE] Update lambda function code (${updateResponse.FunctionName})`);
    } else {
      console.error(`[ERROR] Failed to update lambda function code`);
      process.exit(1);
    }

    // Delay
    await delay(1500);

    // Create the input to publish version
    const publishProps: lambda.PublishVersionCommandInput = {
      FunctionName: updateResponse.FunctionName,
      Description: config.Description !== undefined && config.Description !== "" ? config.Description : undefined
    };
    // Create the command to publish version
    const publishCommand: lambda.PublishVersionCommand = new lambda.PublishVersionCommand(publishProps);
    // Send command to publish version
    const publishResponse = await client.send(publishCommand);
    // Result
    if (publishResponse.FunctionName !== undefined) {
      console.info(`[NOTICE] Publish version (for ${publishResponse.FunctionName}:${publishResponse.Version})`);
      versionMapping[config.Version] = publishResponse;
    } else {
      console.error(`[ERROR] Failed to publish version`);
      process.exit(1);
    }
  }
}

/**
 * Set the event source mapping
 * @param config configuration for event source mapping
 */
export async function setEventSourceMapping(config: any): Promise<void> {
  // Extract a event source arn
  let eventSourceArn: string;
  // Extract a service type and resource id from arn
  const serviceType: string = extractDataFromArn(config.EventSourceArn, "service");
  let resourceId: string = extractDataFromArn(config.EventSourceArn, "resource");
  switch (serviceType) {
    case "dynamodb":
      eventSourceArn = await getDynamoDBTableArn(resourceId);
      break;
    case "kinesis":
      // Progress
      eventSourceArn = config.EventSourceArn;
      break;
    case "sqs":
      eventSourceArn = await getSqsQueueArn(resourceId);
      break;
    default:
      // Progress
      eventSourceArn = config.EventSourceArn;
      break;
  }

  // Extract a function name from arn
  const functionName: string = extractDataFromArn(config.FunctionArn, "resource");
  if (functionName !== "") {
    // Extract a qualifier from arn and get arn for lambda
    const qualifier: string = extractDataFromArn(config.FunctionArn, "qualifier");
    const functionArn: string = await getLambdaFunctionArn(functionName, qualifier !== "" ? qualifier : undefined);
    // Catch error
    if (eventSourceArn === "" || functionArn === "") {
      console.error(`[ERROR] Failed to create event source mapping`);
      process.exit(1);
    }

    // Create the input for list event source mapping
    const inputForList: lambda.ListEventSourceMappingsCommandInput = {
      EventSourceArn: eventSourceArn,
      FunctionName: functionArn
    };
    // Create the command for list event source mapping
    const cmdForList: lambda.ListEventSourceMappingsCommand = new lambda.ListEventSourceMappingsCommand(inputForList);
    // Send the command for list event source mapping
    const resForList: lambda.ListEventSourceMappingsCommandOutput = await client.send(cmdForList);
    // Result
    if (resForList.EventSourceMappings !== undefined && resForList.EventSourceMappings.length > 0) {
      console.error(`[WARNING] Mapping for these services already exists`);
      return;
    }

    // Create the input to create event source mapping
    const inputForCreate: lambda.CreateEventSourceMappingCommandInput = {
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
    const cmdForCreate: lambda.CreateEventSourceMappingCommand = new lambda.CreateEventSourceMappingCommand(inputForCreate);
    // Send command to create event source mapping
    const resForCreate: lambda.CreateEventSourceMappingCommandOutput = await client.send(cmdForCreate);
    // Result
    if (resForCreate.UUID !== undefined) {
      console.info(`[NOTICE] Create the event source mapping (for ${resForCreate.UUID})`);
    } else {
      console.error(`[ERROR] Failed to create event source mapping`);
      process.exit(1);
    }
  } else {
    console.error(`[ERROR] Not found for lambda function name (for ${config.FunctionArn})`);
    process.exit(1);
  }
}