import { Construct } from "constructs";
export declare class Function {
    private _function;
    private _scope;
    /**
     * Create the lambda function
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-function.html
     * @param scope scope context
     * @param config configuration for function
     * @param storedLocation
     */
    constructor(scope: Construct, config: any, storedLocation: string);
    /**
     * Create the alias for lambda function
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-alias.html
     * @param config configuration for function alias
     * @param functionVersion function version
     */
    createAlias(config: any, functionVersion: string): void;
    /**
     * Create the version for lambda function
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-version.html
     * @param config configuration for function version
     * @returns created function version
     */
    createVersion(config: any): string;
    /**
     * Extract the stored location for lambda code
     * @param location location path (for s3 uri)
     * @returns s3 bucket name and key or undefined
     */
    private extractStoredLocation;
    /**
     * Get an arn for function
     * @returns arn for function
     */
    getArn(): string;
    /**
     * Get a name for function
     * @returns name for function
     */
    getName(): string;
    /**
     * Get a ref for function
     * @returns ref for function
     */
    getRef(): string;
    /**
     * Set the event source mapping
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-eventsourcemapping.html
     * @param config configuration for event source mapping
     */
    setEventSourceMapping(config: any): void;
    /**
     * Set the tags
     * @param config configuration for tags
     */
    setTags(config: any): void;
}
