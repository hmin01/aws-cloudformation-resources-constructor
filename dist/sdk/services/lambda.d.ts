export declare class LambdaSdk {
    private _client;
    /**
     * Create a client for aws lambda
     * @param config
     */
    constructor(config: any);
    /**
     * Check the existing event source mapping
     * @param eventSourceArn arn for evnet source
     * @param functionArn arn for lambda function
     * @returns existence
     */
    private _checkExistingEventSourceMapping;
    /**
     * Create a function alias
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-lambda/interfaces/createaliascommandinput.html
     * @param functionName function name
     * @param functionVersion function version
     * @param name name for alias
     * @param description description for alias
     */
    createAlias(functionName: string, functionVersion: string, name: string, description?: string): Promise<void>;
    /**
     * Create the event source mapping
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-lambda/interfaces/createeventsourcemappingcommandinput.html
     * @param config configuration for event source mapping
     */
    createEventSourceMapping(config: any): Promise<void>;
    /**
     * Destroy a client for aws lambda
     * @returns
     */
    destroy(): void;
    /**
     * Get a function arn
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-lambda/interfaces/getfunctionconfigurationcommandinput.html
     * @param functionName function name
     * @param qualifier version or alias for function
     * @returns arn for lambda function
     */
    getFunctionArn(functionName: string, qualifier?: string): Promise<string>;
    /**
     * Publish the lambda function version
     * @param functionName function name
     * @param description description for version
     * @returns version value
     */
    publishVersion(functionName: string, description?: string): Promise<string>;
    /**
     * Update the function code
     * @param functionName function name
     * @param location stored location for code
     */
    updateCode(functionName: string, location: string): Promise<void>;
    /**
     * Update an event source mapping
     * @param uuid event source mapping uuid
     * @param config configuration for event source mapping
     */
    updateEventSourceMapping(uuid: string, config: any): Promise<void>;
}
