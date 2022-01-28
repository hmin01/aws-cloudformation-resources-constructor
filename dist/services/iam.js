"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoles = exports.createPolicies = void 0;
// Resources
const iam_1 = require("../resources/iam");
// Util
const cache_1 = require("../utils/cache");
const util_1 = require("../utils/util");
/**
 * Create the policies
 * @param scope scope context
 * @param config configuration for policies
 */
function createPolicies(scope, config) {
    for (const policyArn of Object.keys(config)) {
        // Get an account id from arn
        const accountId = (0, util_1.extractDataFromArn)(policyArn, "account");
        // Create policies that are not managed by aws.
        if (accountId !== "aws") {
            // Get a configuration for policy
            const elem = config[policyArn];
            // Create a policy
            const policy = new iam_1.Policy(scope, elem);
            // Store the resource
            (0, cache_1.storeResource)("policy", elem.PolicyName, policy);
        }
    }
}
exports.createPolicies = createPolicies;
/**
 * Create the roles
 * @param scope scope context
 * @param config configuration for roles
 */
function createRoles(scope, config) {
    for (const roleId of Object.keys(config)) {
        // Get a configuration for role
        const elem = config[roleId];
        // Create a role
        const role = new iam_1.Role(scope, elem.Role);
        // Store the resource
        (0, cache_1.storeResource)("role", elem.Role.RoleName, role);
        // Associate the managed policies
        role.associateManagedPolicies(elem.AttachedPolicies);
        // Set the inline policies
        for (const policyName of Object.keys(elem.Policies)) {
            role.setInlinePolicy(policyName, elem.Policies[policyName]);
        }
    }
}
exports.createRoles = createRoles;
