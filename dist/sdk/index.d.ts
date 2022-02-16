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
 * Set the method integrations
 * @param name api name
 * @param config configuration for api
 */
export declare function setAPIGatewayMethods(name: string, config: any[]): Promise<void>;
/**
 * Deploy the API Gateway stage (contain deployment)
 * @param name rest api name
 * @param config configuration for stage
 */
export declare function deployAPIGatewayStage(name: string, config: any[]): Promise<void>;
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
 * Create the versions and aliases for lambda
 * @param config configuration for versions and aliases for lambda
 */
export declare function createLambdaVersionsAndAliases(config: any): Promise<void>;
/**
 * Set the event source mappings
 * @param config configuration for event source mappings
 */
export declare function setEventSourceMappings(config: any): Promise<void>;
