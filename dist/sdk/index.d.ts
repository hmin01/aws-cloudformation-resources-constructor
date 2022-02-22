/** For APIGateway */
/**
 * Configure the authorizers
 * @param restApiName rest api name
 * @param config configuration for authorizers
 * @returns mapping data for authorizer
 */
export declare function configeAPIGatewayAuthorizers(restApiName: string, config: any[]): Promise<any>;
/**
 * Configure the methods in rest api
 * @param restApiName rest api name
 * @param config configuration for methods
 */
export declare function configureAPIGatewayMethods(restApiName: string, config: any[], authMapping?: any): Promise<void>;
/**
 * Deploy a stage (contain deployment)
 * @param name rest api name
 * @param config configuration for stage
 */
export declare function deployAPIGatewayStage(restApiName: string, config: any[]): Promise<void>;
/** For Cognito */
/**
 * Set a cognito user pool configuration
 * @param name user pool name
 * @param config configuration for user pool
 */
export declare function setCognitoUserPool(name: string, config: any): Promise<void>;
/**
 * Create the cognito user pool clients
 * @param name user pool name
 * @param config configuration for user pool clients
 */
export declare function createCognitoUserPoolClients(name: string, clientConfigs: any[], uiConfigs?: any[]): Promise<void>;
/** For Lambda */
/**
 * Create the lambda function aliases
 * @param functionName function name
 * @param config configuration for aliases
 * @param mapVersion mapping data for version
 */
export declare function createLambdaAliases(functionName: string, config: any, mapVersion?: any): Promise<void>;
/**
 * Create the event source mappings
 * @param config configuration for event source mappings
 */
export declare function createLambdaEventSourceMappings(config: any): Promise<void>;
/**
 * Download a lambda code from s3
 * @param region region to create a s3 client
 * @param s3Url s3 url
 * @param outputDir output directory path (default: /resources/code)
 */
export declare function downloadLambdaCodeFromS3(region: string, s3Url: string, outputDir?: string): Promise<boolean>;
/**
 * Publish the lambda function versions
 * @param functionName function name
 * @param config configuration for versions
 * @param dirPath path to the directory where the code is stored (default /resources/code)
 * @returns mapping data for version
 */
export declare function publishLambdaVersions(functionName: string, config: any, dirPath?: string): Promise<any>;
