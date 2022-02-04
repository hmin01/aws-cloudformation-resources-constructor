import { Construct } from "constructs";
// Resources
import { RestApi } from "../resources/apigateway ";
// Util
import { storeResource } from "../utils/cache";

export function createRestApi(scope: Construct, config: any) {
  for (const elem of config) {
    // Create a rest api
    const restApi: RestApi = new RestApi(scope, elem);
    // Store the resource
    storeResource("restApi", elem.name, restApi);

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