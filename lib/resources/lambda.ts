import { Construct } from "constructs";
import { aws_lambda as lambda } from "aws-cdk-lib";
// Util
import { getResource } from "../utils/cache";
import { createId, extractDataFromArn, extractTags } from "../utils/util";

export class Function {
  private _function: lambda.CfnFunction;
  private _scope: Construct;

  /**
   * Create the lambda function
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-function.html
   * @param scope scope context
   * @param config configuration for function
   * @param storedLocation 
   */
  constructor(scope: Construct, config: any, storedLocation: string) {
    this._scope = scope;

    // Extract a bucket name and key
    const split: string[] = storedLocation.replace(/^s3:\/\//g, "").split("/");
    const bucketName: string = split[0];
    const key: string = split.slice(1).join("/");
    // Get an arn for role
    const role: any = config.Role !== undefined ? getResource("role", extractDataFromArn(config.Role, "resource")) : undefined;

    // Set the properties for lambda function
    const props: lambda.CfnFunctionProps = {
      code: {
        s3Bucket: bucketName,
        s3Key: key
      },
      role: role !== undefined ? role.getArn() : config.Role,
      // Optional
      architectures: ["x86_64"],
      description: config.Description,
      environment: config.Environment !== undefined ? {
        variables: config.Environment.Variables
      } : undefined,
      functionName: config.FunctionName,
      handler: config.Handler,
      memorySize: config.MemorySize !== undefined ? Number(config.MemorySize) : undefined,
      packageType: config.PackageType,
      reservedConcurrentExecutions: config.ReservedConcurrentExecutions !== undefined ? Number(config.ReservedConcurrentExecutions) : undefined,
      runtime: config.Runtime,
      timeout: config.Timeout,
      tracingConfig: config.TracingConfig !== undefined ? {
        mode: config.TracingConfig.Mode
      } : undefined
    };
    // Create the function
    this._function = new lambda.CfnFunction(this._scope, createId(JSON.stringify(props)), props);    
  }

  /**
   * Create the alias for lambda function
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-alias.html
   * @param config configuration for function alias
   */
  public createAlias(config: any): void {
    // Set the properties for lambda function alias
    const props: lambda.CfnAliasProps = {
      description: config.Description,
      functionName: this._function.ref,
      functionVersion: config.FunctionVersion,
      name: config.Name,
      provisionedConcurrencyConfig: config.ProvisionedConcurrencyConfig
    };
    // Create the alias
    new lambda.CfnAlias(this._scope, createId(JSON.stringify(props)), props);
  }

  /**
   * Create the version for lambda function
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-version.html
   * @param config configuration for function version
   */
  public createVersion(config: any): void {
    // Set the properties for lambda function version
    const props: lambda.CfnVersionProps = {
      description: config.Description,
      functionName: this._function.ref,
      provisionedConcurrencyConfig: config.ProvisionedConcurrencyConfig
    };
    // Create the version
    new lambda.CfnVersion(this._scope, createId(JSON.stringify(props)), props);
  }

  /**
   * Get an arn for function
   * @returns arn for function
   */
  public getArn(): string {
    return this._function.attrArn;
  }

  /**
   * Get a name for function
   * @returns name for function
   */
  public getName(): string {
    return this._function.ref;
  }

  /**
   * Get a ref for function
   * @returns ref for function
   */
  public getRef(): string {
    return this._function.ref;
  }

  /**
   * Set the event source mapping
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-eventsourcemapping.html
   * @param config configuration for event source mapping
   */
  public setEventSourceMapping(config: any) {
    // Extract a event source arn
    let eventSourceArn: string;
    let extractedArn: string|undefined = undefined;
    // Extract a service type and resoure id from arn
    const serviceType: string = extractDataFromArn(config.EventSourceArn, "service");
    const resourceId: string = extractDataFromArn(config.EventSourceArn, "resource");
    switch (serviceType) {
      case "dynamodb":
        extractedArn = getResource("dynamodb", resourceId);
        break;
      case "kinesis":
        extractedArn = getResource("kinesis", resourceId);
        break;
      case "sqs":
        extractedArn = getResource("sqs", resourceId);
        break;
      default:
        extractedArn = getResource("msk", resourceId);
        break;
    }
    // Set a event source arn
    eventSourceArn = extractedArn !== undefined ? extractedArn : config.EventSourceArn;

    // Create the properties for event source mapping
    const props: lambda.CfnEventSourceMappingProps = {
      functionName: this._function.ref,
      // Optional
      batchSize: config.BatchSize !== undefined ? Number(config.BatchSize) : undefined,
      bisectBatchOnFunctionError: config.BisectBatchOnFunctionError,
      destinationConfig: config.DestinationConfig !== undefined ? {
        onFailure: config.DestinationConfig.OnFailure !== undefined ? {
          destination: extractDataFromArn(config.DestinationConfig.OnFailure.Destination, "service") === "sqs" ? getResource("sqs", extractDataFromArn(config.DestinationConfig.OnFailure.Destination, "resource")) !== undefined ? getResource("sqs", extractDataFromArn(config.DestinationConfig.OnFailure.Destination, "resource")) : config.DestinationConfig.OnFailure.Destination : extractDataFromArn(config.DestinationConfig.OnFailure.Destination, "service") === "sns" ? getResource("sns", extractDataFromArn(config.DestinationConfig.OnFailure.Destination, "resource")) !== undefined ? getResource("sns", extractDataFromArn(config.DestinationConfig.OnFailure.Destination, "resource")) : config.DestinationConfig.OnFailure.Destination : config.DestinationConfig.OnFailure.Destination
        } : undefined
      } : undefined,
      enabled: config.State !== undefined && (config.State === "Enabled" || config.State === "Creating" || config.State === "Updating") ? true : false,
      eventSourceArn: eventSourceArn,
      filterCriteria: config.FilterCriteria,
      functionResponseTypes: config.FunctionResponseTypes,
      maximumBatchingWindowInSeconds: config.MaximumBatchingWindowInSeconds !== undefined ? Number(config.MaximumBatchingWindowInSeconds) : undefined,
      maximumRecordAgeInSeconds: config.maximumRecordAgeInSeconds !== undefined ? Number(config.maximumRecordAgeInSeconds) : undefined,
      maximumRetryAttempts: config.MaximumRetryAttempts !== undefined ? Number(config.MaximumRetryAttempts) : undefined,
      parallelizationFactor: config.ParallelizationFactor !== undefined ? Number(config.ParallelizationFactor) : undefined,
      queues: config.Queues !== undefined && config.Queues.length > 0 ? config.Queues : undefined,
      selfManagedEventSource: config.SelfManagedEventSource !== undefined ? {
        endpoints: config.SelfManagedEventSource.Endpoints
      } : undefined,
      sourceAccessConfigurations: config.SourceAccessConfigurations !== undefined && config.SourceAccessConfigurations.length > 0 ? config.SourceAccessConfigurations.map((elem: any): lambda.CfnEventSourceMapping.SourceAccessConfigurationProperty => { return { type: elem.Type, uri: elem.URI }; }) : undefined,
      startingPosition: config.StartingPosition,
      startingPositionTimestamp: config.StartingPositionTimestamp !== undefined ? Number(config.StartingPositionTimestamp) : undefined,
      topics: config.Topic !== undefined && config.Topic.length > 0 ? config.Topic : undefined,
      tumblingWindowInSeconds: config.TumblingWindowInSeconds !== undefined ? Number(config.TumblingWindowInSeconds) : undefined
    };
    // Create the event source mapping
    new lambda.CfnEventSourceMapping(this._function, createId(JSON.stringify(props)), props);
  }

  /**
   * Set the tags
   * @param config configuration for tags
   */
   public setTags(config: any) {
    // Create a list of tag
    const tags = extractTags(config);
    // Set the tags
    if (tags.length > 0) {
      this._function.addPropertyOverride("Tags", tags);
    }
  }
}