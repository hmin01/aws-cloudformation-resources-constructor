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
export declare function setAPIGatewayMethodIntegrations(name: string, config: any[]): Promise<void>;
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
