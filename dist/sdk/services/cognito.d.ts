export declare class CognitoSdk {
    private _client;
    private _mapping;
    /**
     * Create a sdk object for amazon cognito
     * @param config configuration for client
     */
    constructor(config: any);
    /**
     * Create a user pool client
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/interfaces/createuserpoolclientcommandinput.html
     * @param userPoolId user pool id
     * @param config configuration for user pool client
     * @returns user pool client id
     */
    createUserPoolClient(userPoolId: string, config: any): Promise<string>;
    /**
     * Create a user pool domain
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/interfaces/createuserpooldomaincommandinput.html
     * @param userPoolId user pool id
     * @param domain domain
     * @param certificateArn certification arn (for acm arn)
     */
    createUserPoolDomain(userPoolId: string, domain: string, certificateArn: string | undefined): Promise<void>;
    /**
     * Destroy a client for amazon cognito
     */
    destroy(): void;
    /**
     * Get a user pool arn
     * @param userPoolId user pool id
     * @returns user pool arn
     */
    getUserPoolArn(userPoolId: string): Promise<string>;
    /**
     * Get a user pool id
     * @param userPoolName user pool name
     * @returns user pool id
     */
    getUserPoolId(userPoolName: string): Promise<string>;
    /**
     * Get a user pool client id
     * @param userPoolId user pool id
     * @param type qualifier type [name|id]
     * @param qualifier previous user pool client id or user pool client name
     * @returns user pool client id
     */
    getUserPoolClientId(userPoolId: string, type: string, qualifier: string): Promise<string>;
    /**
     * Set a MFA confiugration
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/interfaces/setuserpoolmfaconfigcommandinput.html
     * @param userPoolId user pool id
     * @param config configuration for MFA configuration
     */
    setMFAConfiguration(userPoolId: string, config: any): Promise<void>;
    /**
     * Set a UI customization
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/interfaces/setuicustomizationcommandinput.html
     * @param userPoolId user pool id
     * @param clientId user pool client id
     * @param config configuration for UI customization
     * @returns result
     */
    setUICustomization(userPoolId: string, clientId: string, config: any): Promise<boolean>;
    /**
     * Update an email configuraion
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/interfaces/updateuserpoolcommandinput.html
     * @param userPoolId user pool id
     * @param config configuration for email
     * @returns result
     */
    updateEmailConfiguration(userPoolId: string, config: any): Promise<boolean>;
    /**
     * Update a lambda configuration
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/modules/lambdaconfigtype.html
     * @param userPoolId user pool id
     * @param config configuration for lambda
     * @returns result
     */
    updateLambdaConfiguration(userPoolId: string, config: any): Promise<boolean>;
}
