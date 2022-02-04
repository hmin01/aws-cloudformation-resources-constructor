import { Construct } from "constructs";
// Resource
import { CachePolicy, Distribution, OriginRequestPolicy, ResponseHeadersPolicy } from "../resources/cloudFront";
// Util
import { storeResource } from "../utils/cache";

/**
 * Create the policies
 * @param scope scope context
 * @param config configuration for each policies
 */
export function createPolicies(scope: Construct, config: any) {
  // Create the cache policies
  for (const elem of config.CachePolicy) {
    if (elem.Type !== "managed") {
      // Get an id for policy
      const id: string = elem.CachePolicy.Id;
      // Create a cache policy
      const policy: CachePolicy = new CachePolicy(scope, id, elem.CachePolicy.CachePolicyConfig);
      // Set the resource
      storeResource("cloudfront-cachepolicy", id, policy);
    }
  }
  // Create the origin request policies
  for (const elem of config.OriginRequestPolicy) {
    if (elem.Type !== "managed") {
      // Get an id for policy
      const id: string = elem.CachePolicy.Id;
      // Create a cache policy
      const policy: OriginRequestPolicy = new OriginRequestPolicy(scope, id, elem.OriginRequestPolicy.OriginRequestPolicyConfig);
      // Set the resource
      storeResource("cloudfront-originrequestpolicy", id, policy);
    }
  }
  // Create the response header policies
  for (const elem of config.ResponseHeadersPolicy) {
    if (elem. Type !== "managed") {
      // Get an id for policy
      const id: string = elem.CachePolicy.Id;
      // Create a cache policy
      const policy: ResponseHeadersPolicy = new ResponseHeadersPolicy(scope, id, elem.ResponseHeadersPolicy.ResponseHeadersPolicyConfig);;
      // Set the resource
      storeResource("cloudfront-responseheaderspolicy", id, policy);
    }
  }
}

/**
 * Create the distributions
 * @param scope scope context
 * @param config configuration for distributions
 */
export function createDistributions(scope: Construct, config: any) {
  for (const distributionId of Object.keys(config)) {
    // Get a configuration for distribution
    const elem: any = config[distributionId];
    // Create a distribution
    const distribution: Distribution = new Distribution(scope, elem.DistributionConfig, "arn:aws:acm:us-east-1:395824177941:certificate/fd729d07-657c-4b43-b17a-1035e5489f56");
    // Store the resource
    storeResource("cloudfront-distribution", distributionId, distribution);
  }
}