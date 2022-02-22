export declare class APIGatewaySdk {
    private _client;
    /**
     * Create a sdk object for amazon apigateway
     * @param config configuration for amzon apigateway
     */
    constructor(config: any);
    /**
     * Destroy a client for amazon apigateway
     */
    destroy(): void;
    /**
     * Re-processing uri
     * @description https://docs.aws.amazon.com/apigateway/api-reference/resource/integration/#uri
     * @param type type for integration [HTTP|HTTP_PROXY|AWS|AWS_PROXY|MOCK]
     * @param uri uri
     * @returns re-processed uri
     */
    private _reProcessingUri;
    /**
     * Add an authorizer for method
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/interfaces/updatemethodcommandinput.html#patchoperations
     * @param restApiId rest api id
     * @param resourceId resource id
     * @param httpMethod http method
     * @param config configuration for method
     */
    addAuthorizerForMethod(restApiId: string, resourceId: string, httpMethod: string, config: any): Promise<void>;
    /**
     * Create an authorizer
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/interfaces/createauthorizercommandinput.html
     * @param restApiId rest api id
     * @param config configuration for authorizer
     * @returns authorizer id
     */
    createAuthorizer(restApiId: string, config: any): Promise<string>;
    /**
     * Create a deployment
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/interfaces/createdeploymentcommandinput.html
     * @param restApiId rest api id
     * @returns deployment id
     */
    createDeployment(restApiId: string): Promise<string>;
    /**
     * Creat a stage
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/interfaces/createstagecommandinput.html
     * @param restApiId rest api id
     * @param deploymentId deployment id
     * @param config configuration for stage
     */
    createStage(restApiId: string, deploymentId: string, config: any): Promise<void>;
    /**
     * Get an authorizer id
     * @param restApiId rest api id
     * @param authorizerName authorizer name
     * @returns authorizer id
     */
    getAuthorizerId(restApiId: string, authorizerName: string): Promise<string>;
    /**
     * Get a resource id
     * @param restApiId rest api id
     * @param path resource path
     * @returns resource id
     */
    getResouceId(restApiId: string, path: string): Promise<string>;
    /**
     * Get a rest api id
     * @param name rest api name
     * @returns rest api id
     */
    getRestApiId(name: string): Promise<string>;
    /**
     * Put a method integration
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/interfaces/putintegrationcommandinput.html
     * @param restApiId rest api id
     * @param resourceId resource id
     * @param httpMethod http method
     * @param config configuration for method integration
     */
    putMethodIntegration(restApiId: string, resourceId: string, httpMethod: string, config: any): Promise<void>;
    /**
     * Put a method integration response
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/interfaces/putintegrationresponsecommandinput.html
     * @param restApiId rest api id
     * @param resourceId resource id
     * @param httpMethod http method
     * @param config configuration for method integration response
     */
    putMethodIntegrationResponses(restApiId: string, resourceId: string, httpMethod: string, config: any): Promise<void>;
    /**
     * Put a method response
     * @description https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-api-gateway/interfaces/putmethodresponsecommandinput.html
     * @param restApiId rest api id
     * @param resourceId resourceId
     * @param httpMethod http method
     * @param config configuration for method response
     */
    putMethodResponses(restApiId: string, resourceId: string, httpMethod: string, config: any): Promise<void>;
}
