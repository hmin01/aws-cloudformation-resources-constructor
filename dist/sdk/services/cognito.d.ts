/**
 * Create the user pool client
 * @description https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-userpoolclient.html
 * @param userPoolId user pool id
 * @param config configuration for user pool client
 * @returns user pool client id
 */
export declare function createUserPoolClient(userPoolId: string, config: any): Promise<string>;
/**
 * Create the user pool domain
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/classes/createuserpooldomaincommand.html
 * @param userPoolId user pool id
 * @param domain domain
 * @param certificateArn certificateArn (for cloudFront)
 */
export declare function createUserPoolDomain(userPoolId: string, domain: string, certificateArn: string | undefined): Promise<void>;
/**
 * Destroy a client for cognito
 */
export declare function destroyCognitoClient(): void;
/**
 * Get an id for user pool
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/classes/listuserpoolscommand.html
 * @param userPoolName user pool name
 * @returns id for user pool
 */
export declare function getUserPoolId(userPoolName: string): Promise<string>;
/**
 * Get a user pool client id
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/classes/createuserpoolclientcommand.html
 * @param userPoolId user pool id
 * @param clientId user pool client old id
 * @param clientName user pool client name
 * @returns user pool client id
 */
export declare function getUserPoolClientId(userPoolId: string, clientId: string | undefined, clientName: string | undefined): Promise<string>;
/**
 * Init a client for cognito
 */
export declare function initCognitoClient(): void;
/**
 * Set a MFA configuration
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/classes/setuserpoolmfaconfigcommand.html
 * @param userPoolId user pool id
 * @param config configuration for MFA configuration
 * @param externalId external id (for role)
 * @param snsCallerArn arn for sns
 */
export declare function setMfaConfiguration(userPoolId: string, config: any, externalId: string | undefined, snsCallerArn: string | undefined): Promise<void>;
/**
 * Set a UI customization for user pool client
 * @param userPoolId user pool id
 * @param clientId user pool client id
 * @param config configuration for UI customization
 */
export declare function setUICustomization(userPoolId: string, clientId: string, config: any): Promise<Boolean>;
/**
 * Update the email configuration for user pool
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/classes/updateuserpoolcommand.html
 * @param userPoolId user pool id
 * @param config configuration for email
 */
export declare function updateEmailConfiguration(userPoolId: string, config: any): Promise<void>;
/**
 * Update the lambda configuration for user pool
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/classes/updateuserpoolcommand.html
 * @param userPoolId user pool id
 * @param config configuration for lambda
 */
export declare function updateLambdaConfiguration(userPoolId: string, config: any): Promise<void>;
