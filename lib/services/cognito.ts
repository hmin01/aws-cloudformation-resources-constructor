import { Construct } from "constructs";
// Resources
import { UserPool } from "../resources/cognito";
// Util
import { storeResource } from "../utils/cache";

export function creaetUserPool(scope: Construct, config: any) {
  for (const userPoolId of Object.keys(config)) {
    // Get a configuration for user pool
    const elem: any = config[userPoolId];
    // Create a user pool
    const userPool: UserPool = new UserPool(scope, elem);
    // Store the resource
    storeResource("userpool", userPoolId, userPool);

    // Configurate the email
    userPool.configurateEmail(elem);
    // Configurate the schema
    userPool.configurateSchema(elem.SchemaAttributes);

    // Add the user pool clients
    for (const client of elem.UserPoolClients) {
      userPool.addClient(client);
    }
  }
}