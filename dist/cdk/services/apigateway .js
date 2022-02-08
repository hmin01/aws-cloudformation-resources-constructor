"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestApi = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
// Util
const util_1 = require("../../utils/util");
class RestApi {
    /**
     * Create the rest api
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-restapi.html
     * @param scope scope context
     * @param config configuration for rest api
     */
    constructor(scope, config) {
        this._scope = scope;
        this._mapping = { authorizer: {}, method: {}, model: {}, resource: {}, requestValidator: {} };
        // Extract a list of tag
        const tags = (0, util_1.extractTags)(config.tags);
        // Set the properties for rest api
        const props = {
            apiKeySourceType: config.apiKeySource,
            description: config.description,
            disableExecuteApiEndpoint: config.disableExecuteApiEndpoint,
            endpointConfiguration: config.endpointConfiguration,
            name: config.name,
            tags: tags.length > 0 ? tags : undefined
        };
        // Create the rest api
        this._restApi = new aws_cdk_lib_1.aws_apigateway.CfnRestApi(this._scope, (0, util_1.createId)(JSON.stringify(props)), props);
    }
    /**
     * Create the authorizer
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-authorizer.html
     * @param config configuration for authorizer
     */
    createAuthorizer(config) {
        // Get the providerArns
        const providerArns = config.providerARNs !== undefined ? config.providerARNs.map((elem) => {
            const account = (0, util_1.extractDataFromArn)(elem, "account");
            const region = (0, util_1.extractDataFromArn)(elem, "region");
            if (account === process.env.ACCOUNT && region === process.env.REGION) {
                return elem;
            }
            else {
                let tempArn = (0, util_1.changePartaboutArn)(elem, "account", process.env.ACCOUNT);
                return (0, util_1.changePartaboutArn)(tempArn, "region", process.env.REGION);
            }
        }) : undefined;
        // Create the properties for authorizer
        const props = {
            authorizerCredentials: config.authorizerCredentials,
            authorizerResultTtlInSeconds: config.authorizerResultTtlInSeconds !== undefined ? Number(config.authorizerResultTtlInSeconds) : undefined,
            authorizerUri: config.authorizerUri,
            authType: config.authType,
            identitySource: config.identitySource,
            identityValidationExpression: config.identityValidationExpression,
            name: config.name,
            providerArns: providerArns,
            restApiId: this._restApi.ref,
            type: config.type
        };
        // Create the authorizer
        const authorizer = new aws_cdk_lib_1.aws_apigateway.CfnAuthorizer(this._scope, (0, util_1.createId)(JSON.stringify(props)), props);
        // Store mapping resource
        this._mapping.authorizer[config.id] = authorizer.ref;
    }
    /**
     * Create the resource methods
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-method.html
     * @param configs configuration for method
     */
    createMethod(path, config) {
        const resourceId = this._mapping.resource[path];
        for (const methodType of Object.keys(config)) {
            const methodOptions = config[methodType];
            // Set the request models in method
            const requestModels = {};
            if (methodOptions.requestModels !== undefined) {
                Object.entries(methodOptions.requestModels).forEach((elem) => requestModels[elem.key] = elem.value);
            }
            // Set the method responses
            const methodResponses = methodOptions.methodResponses !== undefined ? Object.keys(methodOptions.methodResponses).map((key) => {
                const value = methodOptions.methodResponses[key];
                // Set the request models in method responses
                const requestModels = {};
                if (value.requestModels !== undefined) {
                    Object.entries(value.requestModels).forEach((elem) => requestModels[elem.key] = elem.value);
                }
                // Return
                return {
                    statusCode: value.statusCode,
                    responseParameters: value.responseParameters,
                    responseModels: Object.keys(requestModels).length > 0 ? requestModels : undefined,
                };
            }) : [];
            // Set the properties for resource method [Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-method.html]
            const props = {
                apiKeyRequired: methodOptions.apiKeyRequired,
                authorizationScopes: methodOptions.authorizationScopes,
                authorizationType: methodOptions.authorizationType,
                authorizerId: this._mapping.authorizer[methodOptions.authorizerId],
                httpMethod: methodOptions.httpMethod,
                methodResponses: methodResponses.length > 0 ? methodResponses : undefined,
                resourceId: resourceId,
                restApiId: this._restApi.ref,
                requestModels: Object.keys(requestModels).length > 0 ? requestModels : undefined,
                requestParameters: methodOptions.requestParameters !== undefined ? Object.keys(methodOptions.requestParameters).length > 0 ? methodOptions.requestParameters : undefined : undefined,
                requestValidatorId: methodOptions.requestValidatorId !== undefined ? this._mapping.requestValidator[methodOptions.requestValidatorId] : undefined
            };
            // Create the resource method
            this._mapping.method[`${path}:${methodOptions.httpMethod}`] = new aws_cdk_lib_1.aws_apigateway.CfnMethod(this._scope, (0, util_1.createId)(JSON.stringify(props)), props);
        }
    }
    /**
     * Create the  model
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-model.html
     * @param config configuration for model
     */
    createModel(config) {
        if (config.name !== "Empty" && config.name !== "Error") {
            // Create the properties for model
            const props = {
                contentType: config.contentType,
                description: config.description,
                name: config.name,
                restApiId: this._restApi.ref,
                schema: config.schema !== undefined ? JSON.parse(config.schema) : undefined
            };
            // Create the model
            const model = new aws_cdk_lib_1.aws_apigateway.CfnModel(this._scope, (0, util_1.createId)(JSON.stringify(props)), props);
            // Store mpping resource
            this._mapping.model[config.name] = model.ref;
        }
    }
    /**
     * Create the gateway response
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-gatewayresponse.html
     * @param config configuration for gateway response
     */
    createGatewayResponse(config) {
        // Create the properties for gateway response
        const props = {
            responseType: config.responseType,
            restApiId: this._restApi.ref,
            responseParameters: config.responseParameters !== undefined ? Object.keys(config.responseParameters).length > 0 ? config.responseParameters : undefined : undefined,
            responseTemplates: config.responseTemplates !== undefined ? Object.keys(config.responseTemplates).length > 0 ? config.responseTemplates : undefined : undefined,
            statusCode: config.statusCode
        };
        // Create the gateway response
        new aws_cdk_lib_1.aws_apigateway.CfnGatewayResponse(this._scope, (0, util_1.createId)(JSON.stringify(props)), props);
    }
    /**
     * Create the resource in rest api
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-resource.html
     * @param parentId parent resource id
     * @param resourcePath resource path
     * @param pathPart path part
     */
    createResource(parentId, resourcePath, pathPart) {
        // Create the properties for resource in rest api
        const props = {
            parentId: parentId,
            pathPart: pathPart,
            restApiId: this._restApi.ref
        };
        // Create the resource in rest api
        const resource = new aws_cdk_lib_1.aws_apigateway.CfnResource(this._scope, (0, util_1.createId)(JSON.stringify(props)), props);
        // Store mapping resource
        this._mapping.resource[resourcePath] = resource.ref;
    }
    /**
     * Create the resource in rest api using path tree
     * @param parentId parent resource id
     * @param resourcePath resource path
     * @param tree tree for resource path
     */
    createResourceUsingTree(parentId, resourcePath, tree) {
        for (const key of Object.keys(tree)) {
            // Create the resource path
            const path = `${resourcePath}/${key}`;
            // Set properties for resource in rest api [Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-resource.html]
            const props = {
                parentId: parentId,
                pathPart: key,
                restApiId: this._restApi.ref
            };
            // Create the resource in rest api
            const resource = new aws_cdk_lib_1.aws_apigateway.CfnResource(this._scope, (0, util_1.createId)(JSON.stringify(props)), props);
            this._mapping.resource[path] = resource.ref;
            // If you have a child node, execute a recursive function.
            if (tree[key] !== undefined) {
                this.createResourceUsingTree(resource.ref, path, tree[key]);
            }
        }
    }
    /**
     * Create the resources in rest api
     * @param config configuration for resources
     */
    createResources(config) {
        // Create the path tree based on resource path
        const tree = this.extractPathTree(config);
        // Create the resources
        this.createResourceUsingTree(this._restApi.attrRootResourceId, "", tree[""]);
    }
    /**
     * Create the request validator
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-requestvalidator.html
     * @param config configuration for request validator
     */
    createRequestValidator(config) {
        // Create the properties for request validator
        const props = {
            name: config.name,
            restApiId: this._restApi.ref,
            validateRequestBody: config.validateRequestBody,
            validateRequestParameters: config.validateRequestParameters
        };
        // Create the request validator
        const requestValidator = new aws_cdk_lib_1.aws_apigateway.CfnRequestValidator(this._scope, (0, util_1.createId)(JSON.stringify(props)), props);
        // Store mapping resource
        this._mapping.requestValidator[config.id] = requestValidator.ref;
    }
    /**
     * Extract the tree for resource path
     * @param configs configuration for resources
     * @returns tree for resource path
     */
    extractPathTree(configs) {
        // Extract tree for path
        const tree = {};
        for (const config of configs) {
            let parent = null;
            const paths = config.path.split("/");
            for (const path of paths) {
                if (parent === null) {
                    if (tree[path] === undefined)
                        tree[path] = {};
                    parent = tree[path];
                }
                else {
                    if (path !== "" && parent[path] === undefined)
                        parent[path] = {};
                    parent = parent[path];
                }
            }
        }
        // Return
        return tree;
    }
    /**
     * Get id for bucket
     * @returns id for bucket
     */
    getId() {
        return this._restApi.ref;
    }
}
exports.RestApi = RestApi;
