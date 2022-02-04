"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDistributions = exports.createPolicies = void 0;
// Resource
const cloudFront_1 = require("../resources/cloudFront");
// Util
const cache_1 = require("../utils/cache");
/**
 * Create the policies
 * @param scope scope context
 * @param config configuration for each policies
 */
function createPolicies(scope, config) {
    // Create the cache policies
    for (const elem of config.CachePolicy) {
        if (elem.Type !== "managed") {
            // Get an id for policy
            const id = elem.CachePolicy.Id;
            // Create a cache policy
            const policy = new cloudFront_1.CachePolicy(scope, id, elem.CachePolicy.CachePolicyConfig);
            // Set the resource
            (0, cache_1.storeResource)("cloudfront-cachepolicy", id, policy);
        }
    }
    // Create the origin request policies
    for (const elem of config.OriginRequestPolicy) {
        if (elem.Type !== "managed") {
            // Get an id for policy
            const id = elem.CachePolicy.Id;
            // Create a cache policy
            const policy = new cloudFront_1.OriginRequestPolicy(scope, id, elem.OriginRequestPolicy.OriginRequestPolicyConfig);
            // Set the resource
            (0, cache_1.storeResource)("cloudfront-originrequestpolicy", id, policy);
        }
    }
    // Create the response header policies
    for (const elem of config.ResponseHeadersPolicy) {
        if (elem.Type !== "managed") {
            // Get an id for policy
            const id = elem.CachePolicy.Id;
            // Create a cache policy
            const policy = new cloudFront_1.ResponseHeadersPolicy(scope, id, elem.ResponseHeadersPolicy.ResponseHeadersPolicyConfig);
            ;
            // Set the resource
            (0, cache_1.storeResource)("cloudfront-responseheaderspolicy", id, policy);
        }
    }
}
exports.createPolicies = createPolicies;
/**
 * Create the distributions
 * @param scope scope context
 * @param config configuration for distributions
 */
function createDistributions(scope, config) {
    for (const distributionId of Object.keys(config)) {
        // Get a configuration for distribution
        const elem = config[distributionId];
        // Create a distribution
        const distribution = new cloudFront_1.Distribution(scope, elem.DistributionConfig, "arn:aws:acm:us-east-1:395824177941:certificate/fd729d07-657c-4b43-b17a-1035e5489f56");
        // Store the resource
        (0, cache_1.storeResource)("cloudfront-distribution", distributionId, distribution);
    }
}
exports.createDistributions = createDistributions;
