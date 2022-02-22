import { createReadStream } from "fs";
// AWS SDK
import * as lambda from "@aws-sdk/client-lambda";
// Response
import { CODE, catchError } from "../../models/response";
// Services
import { DynamoDBSdk } from "./dynamodb";
import { SQSSdk } from "./sqs";
// Util
import { extractDataFromArn, streamToBuffer } from "../../utils/util";

export class LambdaSdk {
  private _client: lambda.LambdaClient;

  /**
   * Create a client for aws lambda
   * @param config 
   */
  constructor(config: any) {
    // Create the params for client
    const params: lambda.LambdaClientConfig = {
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
   * Check the existing event source mapping
   * @param eventSourceArn arn for evnet source
   * @param functionArn arn for lambda function
   * @returns existence
   */
  private async _checkExistingEventSourceMapping(eventSourceArn: string, functionArn: string): Promise<lambda.EventSourceMappingConfiguration[]> {
    try {
      // Create an input to get a list of event source mapping
      const input: lambda.ListEventSourceMappingsCommandInput = {
        EventSourceArn: eventSourceArn,
        FunctionName: functionArn
      };
      // Create a command to get a list of event source mapping
      const command: lambda.ListEventSourceMappingsCommand = new lambda.ListEventSourceMappingsCommand(input);
      // Send a command to get a list of event source mapping
      const response: lambda.ListEventSourceMappingsCommandOutput = await this._client.send(command);
      // Return
      return response.EventSourceMappings ? response.EventSourceMappings as lambda.EventSourceMappingConfiguration[] : [];
    } catch (err) {
      catchError(CODE.ERROR.LAMBDA.FUNCTION.GET_EVENT_SOURCE_MAPPINGS, false, eventSourceArn, err as Error);
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
  public async createAlias(functionName: string, functionVersion: string, name: string, description?: string): Promise<void> {
    try {
      // Create an client to create a function alias
      const input: lambda.CreateAliasCommandInput = {
        Description: description,
        FunctionName: functionName,
        FunctionVersion: functionVersion,
        Name: name
      };
      // Create a command to create a function alias
      const command: lambda.CreateAliasCommand = new lambda.CreateAliasCommand(input);
      // Send a command to create a function alias
      await this._client.send(command);
    } catch (err) {
      catchError(CODE.ERROR.LAMBDA.FUNCTION.CREATE_ALIAS, true, functionName, err as Error);
    }
  }

  /**
   * Create the event source mapping
   * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-lambda/interfaces/createeventsourcemappingcommandinput.html
   * @param config configuration for event source mapping
   */
  public async createEventSourceMapping(config: any): Promise<void> {
    try {
      // Extract a function name and qualifier from function arn
      const functionName: string = extractDataFromArn(config.FunctionArn, "resource");
      const qualifier: string = extractDataFromArn(config.FunctionArn, "qualifier");
      // Get an arn for lambda function
      const functionArn: string = await this.getFunctionArn(functionName, qualifier);

      // Extract a resource id, service type from arn
      const resourceId: string = extractDataFromArn(config.EventSourceArn, "resource"); 
      const serviceType: string = extractDataFromArn(config.EventSourceArn, "service");
      // Extract a event source arn
      let eventSourceArn: string;
      switch (serviceType) {
        case "dynamodb":
          // Create a sdk client for amazon dynamodb
          const dynamodb: DynamoDBSdk = new DynamoDBSdk({ region: process.env.TARGET_REGION });
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
          const sqs: SQSSdk = new SQSSdk({ region: process.env.TARGET_REGION });
          // Get a queue url
          const queueUrl: string = await sqs.getQueueUrl(resourceId);
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
      const eventSourceMappings: any[] = await this._checkExistingEventSourceMapping(eventSourceArn, functionArn);
      if (eventSourceMappings.length > 0) {
        console.warn(`[WARNING] Mapping for these services already exists`);
        // Activate the event source mappings
        for (const elem of eventSourceMappings) {
          // Extract a enabled status
          const enabled: boolean = elem.State === "Disabling" || elem.State === "Disable" || elem.State === "Deleting" ? false : true;
          // Update an event source mapping
          await this.updateEventSourceMapping(elem.UUID, { Enabled: enabled });
        }
        // Return
        return;
      }

      // Create an input to create the event source mapping
      const input: lambda.CreateEventSourceMappingCommandInput = {
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
      const command: lambda.CreateEventSourceMappingCommand = new lambda.CreateEventSourceMappingCommand(input);
      // Send a command to create the event source mapping
      await this._client.send(command);
    } catch (err) {
      catchError(CODE.ERROR.LAMBDA.FUNCTION.CREATE_EVENT_SOURCE_MAPPING, false, undefined, err as Error);
    }
  }

  /**
   * Destroy a client for aws lambda
   * @returns 
   */
  public destroy(): void {
    return this._client.destroy();
  }

  /**
   * Get a function arn
   * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-lambda/interfaces/getfunctionconfigurationcommandinput.html
   * @param functionName function name
   * @param qualifier version or alias for function
   * @returns arn for lambda function
   */
  public async getFunctionArn(functionName: string, qualifier?: string): Promise<string> {
    try {
      // Create an input to get a function arn
      const input: lambda.GetFunctionConfigurationCommandInput = {
        FunctionName:  functionName,
        Qualifier: qualifier !== "" ? qualifier : undefined
      };
      // Create a command to get a function arn
      const command: lambda.GetFunctionConfigurationCommand = new lambda.GetFunctionConfigurationCommand(input);
      // Create a command to get a function arn
      const response: lambda.GetFunctionConfigurationCommandOutput = await this._client.send(command);
      // Return
      return response.FunctionArn ? response.FunctionArn : "";
    } catch (err) {
      return catchError(CODE.ERROR.LAMBDA.FUNCTION.GET_ARN, false, functionName, err as Error);
    }
  }

  /**
   * Publish the lambda function version
   * @param functionName function name
   * @param description description for version
   * @returns version value
   */
  public async publishVersion(functionName: string, description?: string): Promise<string> {
    try {
      // Create an input to publish the function version
      const input: lambda.PublishVersionCommandInput = {
        Description: description,
        FunctionName: functionName
      };
      // Create a command to publish the function version
      const command: lambda.PublishVersionCommand = new lambda.PublishVersionCommand(input);
      // Send a command to publish the function version
      const response: lambda.PublishVersionCommandOutput = await this._client.send(command);
      // Return
      return response.Version as string;
    } catch (err) {
      return catchError(CODE.ERROR.LAMBDA.FUNCTION.PUBLISH_VERSION, false, functionName, err as Error);
    }
  }

  /**
   * Update the function code
   * @param functionName function name
   * @param location stored location for code
   */
  public async updateCode(functionName: string, location: string): Promise<void> {
    try {
      // Load a code file
      const data = await streamToBuffer(createReadStream(location));
      // Create an input to update the function code
      const input: lambda.UpdateFunctionCodeCommandInput = {
        FunctionName: functionName,
        ZipFile: new Uint8Array(data)
      };
      // Create a command to update the function code
      const command: lambda.UpdateFunctionCodeCommand = new lambda.UpdateFunctionCodeCommand(input);
      // Send a command to update the function code
      await this._client.send(command);
      // Wait for update
      await lambda.waitUntilFunctionUpdated({ client: this._client, maxWaitTime: 30, maxDelay: 1, minDelay: 1 }, { FunctionName: functionName });
    } catch (err) {
      catchError(CODE.ERROR.LAMBDA.FUNCTION.UPDATE_CODE, false, functionName, err as Error);
    }
  }

  /**
   * Update an event source mapping
   * @param uuid event source mapping uuid
   * @param config configuration for event source mapping
   */
  public async updateEventSourceMapping(uuid: string, config: any): Promise<void> {
    try {
      // Create an input to update an event source mapping
      const input: lambda.UpdateEventSourceMappingCommandInput = {
        BatchSize: config.BatchSize,
        BisectBatchOnFunctionError: config.BisectBatchOnFunctionError,
        Enabled: config.Enabled,
        MaximumBatchingWindowInSeconds: config.MaximumBatchingWindowInSeconds ? Number(config.MaximumBatchingWindowInSeconds) : undefined,
        MaximumRecordAgeInSeconds: config.MaximumRecordAgeInSeconds ? Number(config.MaximumRecordAgeInSeconds) : undefined,
        MaximumRetryAttempts: config.MaximumRetryAttempts ? Number(config.MaximumRetryAttempts) : undefined,
        ParallelizationFactor: config.ParallelizationFactor ? Number(config.ParallelizationFactor) :undefined,
        TumblingWindowInSeconds: config.TumblingWindowInSeconds ? Number(config.TumblingWindowInSeconds) : undefined,
        UUID: uuid,
      };
      // Create a command to update an event source mapping
      const command: lambda.UpdateEventSourceMappingCommand = new lambda.UpdateEventSourceMappingCommand(input);
      // Send a command to update an event source mapping
      await this._client.send(command);
    } catch (err) {
      catchError(CODE.ERROR.LAMBDA.FUNCTION.UPDATE_EVENT_SOURCE_MAPPING, false, uuid, err as Error);
    }
  }
}