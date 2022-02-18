/** For Util */
/**
 * Destroy the sdk clients
 */
export declare function destroySdkClients(): void;
/**
 * Init the sdk clients
 */
export declare function initSdkClients(): void;
/** For APIGateway */
/**
 * Configure the methods in rest api
 * @param restApiName rest api name
 * @param config configuration for methods
 */
export declare function configureAPIGatewayMethods(restApiName: string, config: any[]): Promise<void>;
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
export declare function createCognitoUserPoolClients(name: string, clientConfigs: any[], uiConfigs: any[]): Promise<void>;
/** For Lambda */
/**
 * Create the lambda function aliases
 * @param functionName function name
 * @param config configuration for aliases
 * @param mapVersion mapping data for version
 */
export declare function createAliases(functionName: string, config: any, mapVersion?: any): Promise<void>;
/**
 * Create the event source mappings
 * @param config configuration for event source mappings
 */
export declare function createEventSourceMappings(config: any): Promise<void>;
/**
 * Publish the lambda function versions
 * @param functionName function name
 * @param config configuration for versions
 * @returns mapping data for version
 */
export declare function publishLambdaVersions(functionName: string, config: any): Promise<any>;
