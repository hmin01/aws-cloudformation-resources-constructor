/**
 * Destroy a client for api gateway
 */
export declare function destroyAPIGatewayClient(): void;
/**
 * Create the deployment for rest api
 * @param restApiId rest api id
 * @param config configuration for deployment
 * @returns created deployment id
 */
export declare function createDeployment(restApiId: string): Promise<string>;
/**
 * Create the stage for rest api
 * @param restApiId rest api id
 * @param deploymentId deployment id
 * @param config configuration for stage
 */
export declare function createStage(restApiId: string, deploymentId: string, config: any): Promise<void>;
/**
 * Get resource id according to path
 * @param apiId api id
 * @param path path
 * @returns resource id
 */
export declare function getResourceId(apiId: string, path: string): Promise<string>;
/**
 * Get a rest api id
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/classes/getrestapiscommand.html
 * @param name name for rest api
 * @returns rest api id
 */
export declare function getRestApiId(name: string): Promise<string>;
/**
 * Put the method integration
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/classes/putintegrationcommand.html
 * @param restApiId id for rest api
 * @param resourceId id for resource in api
 * @param httpMethod http method
 * @param config configuration for method integration
 */
export declare function putMethodIntegration(restApiId: string, resourceId: string, httpMethod: string, config: any): Promise<void>;
/**
 * Put the method integration reesponse
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/classes/putintegrationresponsecommand.html
 * @param restApiId rest api id
 * @param resourceId resource id
 * @param httpMethod http method
 * @param config configuration for method integration response
 */
export declare function putMethodIntegrationResponse(restApiId: string, resourceId: string, httpMethod: string, config: any): Promise<void>;
/**
 * Put the method response
 * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/classes/putmethodresponsecommand.html
 * @param restApiId rest api id
 * @param resourceId resource id
 * @param httpMethod http method
 * @param config configuration for method response
 */
export declare function putMethodResponse(restApiId: string, resourceId: string, httpMethod: string, config: any): Promise<void>;
/**
 * Init a client for api gateway
 */
export declare function initAPIGatewayClient(): void;
