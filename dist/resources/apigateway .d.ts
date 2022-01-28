import { Construct } from "constructs";
export declare class RestApi {
    private _mapping;
    private _restApi;
    private _scope;
    /**
     * Create the rest api
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-restapi.html
     * @param scope scope context
     * @param config configuration for rest api
     */
    constructor(scope: Construct, config: any);
    /**
     * Create the authorizer
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-authorizer.html
     * @param config configuration for authorizer
     */
    createAuthorizer(config: any): void;
    /**
     * Create the resource methods
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-method.html
     * @param configs configuration for method
     */
    createMethod(path: string, config: any): void;
    /**
     * Create the  model
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-model.html
     * @param config configuration for model
     */
    createModel(config: any): void;
    /**
     * Create the gateway response
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-gatewayresponse.html
     * @param config configuration for gateway response
     */
    createGatewayResponse(config: any): void;
    /**
     * Create the resource in rest api
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-resource.html
     * @param parentId parent resource id
     * @param resourcePath resource path
     * @param pathPart path part
     */
    createResource(parentId: string, resourcePath: string, pathPart: string): void;
    /**
     * Create the resource in rest api using path tree
     * @param parentId parent resource id
     * @param resourcePath resource path
     * @param tree tree for resource path
     */
    private createResourceUsingTree;
    /**
     * Create the resources in rest api
     * @param config configuration for resources
     */
    createResources(config: any): void;
    /**
     * Create the request validator
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-requestvalidator.html
     * @param config configuration for request validator
     */
    createRequestValidator(config: any): void;
    /**
     * Extract the tree for resource path
     * @param configs configuration for resources
     * @returns tree for resource path
     */
    extractPathTree(configs: any[]): any;
    /**
     * Get id for bucket
     * @returns id for bucket
     */
    getId(): string;
}
