"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRestApi = void 0;
// Resources
const apigateway_1 = require("../resources/apigateway ");
// Util
const cache_1 = require("../utils/cache");
function createRestApi(scope, config) {
    for (const elem of config) {
        // Create a rest api
        const restApi = new apigateway_1.RestApi(scope, elem);
        // Store the resource
        (0, cache_1.storeResource)("restApi", elem.name, restApi);
        // Create the authorizers
        for (const data of elem.Authorizers) {
            restApi.createAuthorizer(data);
        }
        // Create the gateway responses
        for (const data of elem.GatewayResponses) {
            restApi.createGatewayResponse(data);
        }
        // Create the models
        for (const data of elem.Models) {
            restApi.createModel(data);
        }
        // Create the request validators
        for (const data of elem.RequestValidators) {
            restApi.createRequestValidator(data);
        }
        // Create the resources
        restApi.createResources(elem.Resources);
        // Create the mothods
        for (const data of elem.Resources) {
            if (data.resourceMethods !== undefined) {
                restApi.createMethod(data.path, data.resourceMethods);
            }
        }
    }
}
exports.createRestApi = createRestApi;
