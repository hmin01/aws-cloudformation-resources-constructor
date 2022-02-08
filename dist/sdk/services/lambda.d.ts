/**
 * Create an alias for lambda function
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-lambda/classes/createaliascommand.html
 * @param config configuration for alias of lambda function
 */
export declare function createAlias(config: any): Promise<void>;
/**
 * Destroy a client for lambda
 */
export declare function destroyLambdaClient(): void;
/**
 * Get an arn for lambda function
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-lambda/classes/getfunctionconfigurationcommand.html
 * @param functionName name for lambda function
 * @param qualifier version or alias for lambda function
 */
export declare function getLambdaFunctionArn(functionName: string, qualifier?: string): Promise<string>;
/**
 * Init a client for lambda
 */
export declare function initLambdaClient(): void;
/**
 * Create the version (and update lambda function)
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-lambda/classes/publishversioncommand.html
 * @param config configuration for version of lambda function
 */
export declare function publishVersion(config: any): Promise<void>;
/**
 * Set the event source mapping
 * @param config configuration for event source mapping
 */
export declare function setEventSourceMapping(config: any): Promise<void>;
