import { Construct } from "constructs";
// Resources
import { Policy, Role } from "../resources/iam";
// Util
import { storeResource } from "../utils/cache";
import { extractDataFromArn } from "../utils/util";

/**
 * Create the policies
 * @param scope scope context
 * @param config configuration for policies
 */
export function createPolicies(scope: Construct, config: any) {
  for (const policyArn of Object.keys(config)) {
    // Get an account id from arn
    const accountId: string = extractDataFromArn(policyArn, "account");
    // Create policies that are not managed by aws.
    if (accountId !== "aws") {
      // Get a configuration for policy
      const elem: any = config[policyArn];
      // Create a policy
      const policy: Policy = new Policy(scope, elem);
      // Store the resource
      storeResource("policy", elem.PolicyName, policy);
    }
  }
}

/**
 * Create the roles
 * @param scope scope context
 * @param config configuration for roles
 */
export function createRoles(scope: Construct, config: any) {
  for (const roleId of Object.keys(config)) {
    // Get a configuration for role
    const elem: any = config[roleId];
    // Create a role
    const role = new Role(scope, elem.Role);
    // Store the resource
    storeResource("role", elem.Role.RoleName, role);

    // Associate the managed policies
    role.associateManagedPolicies(elem.AttachedPolicies);
    // Set the inline policies
    for (const policyName of Object.keys(elem.Policies)) {
      role.setInlinePolicy(policyName, elem.Policies[policyName]);
    }
  }
}