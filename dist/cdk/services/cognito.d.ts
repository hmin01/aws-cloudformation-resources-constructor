import { Construct } from "constructs";
export declare class UserPool {
    private _scope;
    private _userPool;
    /**
     * Create the cognito user pool
     * @description https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-userpool.html
     * @param scope scope context
     * @param config configuration for user pool
     */
    constructor(scope: Construct, config: any);
    /**
     * Create a default domain
     * @param domain domain
     */
    createDefaultDomain(domain: string): void;
    /**
     * Create a resource server for user pool
     * @description https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-userpoolresourceserver.html
     * @param config configuration for resource server
     */
    createResourceServer(config: any): void;
    /**
     * Get an arn for user pool
     * @returns arn for user pool
     */
    getArn(): string;
    /**
     * Get an id for user pool
     * @returns id for user pool
     */
    getId(): string;
    /**
     * Get a provider name for user pool
     * @returns provider name for user pool
     */
    getProviderName(): string;
    /**
     * Get a provider url for user pool
     * @returns provider url for user pool
     */
    getProviderUrl(): string;
}
