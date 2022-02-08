/**
 * Destroy a client for api gateway
 */
export declare function destroyAPIGatewayClient(): void;
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
 * @param name name for rest api
 * @param path path
 * @param httpMethod http method
 * @param config configuration for method integration
 */
export declare function putMethodIntegration(name: string, path: string, httpMethod: string, config: any): Promise<void>;
/**
 * Init a client for api gateway
 */
export declare function initAPIGatewayClient(): void;
