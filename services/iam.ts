import { Construct } from "constructs";
// Resources
import { Policy, Role } from "../resources/iam";

/**
 * Create the policies
 * @param scope scope context
 * @param config configuration for policies
 */
export function createPolicies(scope: Construct, config: any) {
  for (const policyId of Object.keys(config)) {
    // Get a configuration for policy
    const elem: any = config[policyId];
    // Create a policy
    new Policy(scope, elem);
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

    // Associate the managed policies
    role.associateManagedPolicies(elem.AttachedPolicies);
    // Set the inline policies
    for (const policyName of Object.keys(elem.Policies)) {
      role.setInlinePolicy(policyName, elem.Policies[policyName]);
    }
  }
}