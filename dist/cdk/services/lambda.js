"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Function = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
// Util
const cache_1 = require("../../utils/cache");
const util_1 = require("../../utils/util");
class Function {
    /**
     * Create the lambda function
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-function.html
     * @param scope scope context
     * @param config configuration for function
     */
    constructor(scope, config) {
        this._scope = scope;
        // Get an arn for role
        const role = config.Role ? (0, cache_1.getResource)("role", (0, util_1.extractDataFromArn)(config.Role, "resource")) ? (0, cache_1.getResource)("role", (0, util_1.extractDataFromArn)(config.Role, "resource")) : config.Role : undefined;
        // Set the properties for lambda function
        const props = {
            code: {
                zipFile: " "
            },
            role: role ? role.getArn() : config.Role,
            // Optional
            architectures: ["x86_64"],
            description: config.Description,
            environment: config.Environment ? {
                variables: config.Environment.Variables
            } : undefined,
            functionName: config.FunctionName,
            handler: config.Handler,
            memorySize: config.MemorySize ? Number(config.MemorySize) : undefined,
            packageType: config.PackageType,
            reservedConcurrentExecutions: config.ReservedConcurrentExecutions ? Number(config.ReservedConcurrentExecutions) : undefined,
            runtime: config.Runtime,
            timeout: config.Timeout,
            tracingConfig: config.TracingConfig ? {
                mode: config.TracingConfig.Mode
            } : undefined
        };
        // Create a function
        this._function = new aws_cdk_lib_1.aws_lambda.CfnFunction(this._scope, (0, util_1.createId)(JSON.stringify(props)), props);
    }
    /**
     * Create the alias for lambda function
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-alias.html
     * @param config configuration for function alias
     * @param functionVersion function version
     */
    createAlias(config, functionVersion) {
        // Set the properties for lambda function alias
        const props = {
            description: config.Description,
            functionName: this._function.ref,
            functionVersion: functionVersion,
            name: config.Name,
            provisionedConcurrencyConfig: config.ProvisionedConcurrencyConfig
        };
        // Create the alias
        new aws_cdk_lib_1.aws_lambda.CfnAlias(this._scope, (0, util_1.createId)(JSON.stringify(props)), props);
    }
    /**
     * Create the version for lambda function
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-version.html
     * @param config configuration for function version
     * @returns created function version
     */
    createVersion(config) {
        // Set the properties for lambda function version
        const props = {
            description: config.Description,
            functionName: this._function.ref,
            provisionedConcurrencyConfig: config.ProvisionedConcurrencyConfig
        };
        // Create the version
        const version = new aws_cdk_lib_1.aws_lambda.CfnVersion(this._scope, (0, util_1.createId)(JSON.stringify(props)), props);
        // Return
        return version.attrVersion;
    }
    /**
     * Get an arn for function
     * @returns arn for function
     */
    getArn() {
        return this._function.attrArn;
    }
    /**
     * Get a name for function
     * @returns name for function
     */
    getName() {
        return this._function.ref;
    }
    /**
     * Get a ref for function
     * @returns ref for function
     */
    getRef() {
        return this._function.ref;
    }
    /**
     * Set the event source mapping
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-eventsourcemapping.html
     * @param config configuration for event source mapping
     */
    setEventSourceMapping(config) {
        // Extract a event source arn
        let eventSourceArn;
        let extractedResource = undefined;
        // Extract a service type and resoure id from arn
        const serviceType = (0, util_1.extractDataFromArn)(config.EventSourceArn, "service");
        let resourceId = (0, util_1.extractDataFromArn)(config.EventSourceArn, "resource");
        switch (serviceType) {
            case "dynamodb":
                extractedResource = (0, cache_1.getResource)("dynamodb", resourceId);
                break;
            case "kinesis":
                extractedResource = (0, cache_1.getResource)("kinesis", resourceId);
                break;
            case "sqs":
                extractedResource = (0, cache_1.getResource)("sqs", resourceId);
                break;
            default:
                extractedResource = (0, cache_1.getResource)("msk", resourceId);
                break;
        }
        // Set a event source arn
        eventSourceArn = extractedResource !== undefined ? extractedResource.getArn() : config.EventSourceArn;
        // Create the properties for event source mapping
        const props = {
            functionName: this._function.ref,
            // Optional
            batchSize: config.BatchSize !== undefined ? Number(config.BatchSize) : undefined,
            bisectBatchOnFunctionError: config.BisectBatchOnFunctionError,
            destinationConfig: config.DestinationConfig !== undefined ? {
                onFailure: config.DestinationConfig.OnFailure !== undefined ? {
                    destination: (0, util_1.extractDataFromArn)(config.DestinationConfig.OnFailure.Destination, "service") === "sqs" ? (0, cache_1.getResource)("sqs", (0, util_1.extractDataFromArn)(config.DestinationConfig.OnFailure.Destination, "resource")) !== undefined ? (0, cache_1.getResource)("sqs", (0, util_1.extractDataFromArn)(config.DestinationConfig.OnFailure.Destination, "resource")) : config.DestinationConfig.OnFailure.Destination : (0, util_1.extractDataFromArn)(config.DestinationConfig.OnFailure.Destination, "service") === "sns" ? (0, cache_1.getResource)("sns", (0, util_1.extractDataFromArn)(config.DestinationConfig.OnFailure.Destination, "resource")) !== undefined ? (0, cache_1.getResource)("sns", (0, util_1.extractDataFromArn)(config.DestinationConfig.OnFailure.Destination, "resource")) : config.DestinationConfig.OnFailure.Destination : config.DestinationConfig.OnFailure.Destination
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
            sourceAccessConfigurations: config.SourceAccessConfigurations !== undefined && config.SourceAccessConfigurations.length > 0 ? config.SourceAccessConfigurations.map((elem) => { return { type: elem.Type, uri: elem.URI }; }) : undefined,
            startingPosition: config.StartingPosition,
            startingPositionTimestamp: config.StartingPositionTimestamp !== undefined ? Number(config.StartingPositionTimestamp) : undefined,
            topics: config.Topic !== undefined && config.Topic.length > 0 ? config.Topic : undefined,
            tumblingWindowInSeconds: config.TumblingWindowInSeconds !== undefined ? Number(config.TumblingWindowInSeconds) : undefined
        };
        // Create the event source mapping
        new aws_cdk_lib_1.aws_lambda.CfnEventSourceMapping(this._function, (0, util_1.createId)(JSON.stringify(props)), props);
    }
    /**
     * Set the tags
     * @param config configuration for tags
     */
    setTags(config) {
        // Create a list of tag
        const tags = (0, util_1.extractTags)(config);
        // Set the tags
        if (tags.length > 0) {
            this._function.addPropertyOverride("Tags", tags);
        }
    }
}
exports.Function = Function;
