// import { Construct } from "constructs";
// import { aws_cloudfront as cloudfront } from "aws-cdk-lib";
// // Util
// import { getResource, storeResource } from "../utils/cache";
// import { createId } from "../utils/util";

// export class Distribution {
//   private _distribution: cloudfront.CfnDistribution;
//   private _scope: Construct;

//   constructor(scope: Construct, rawConfig: any) {
//     this._scope = scope;
//     // Extract the configuration
//     const config: any = rawConfig.DistributionConfig;

//     // Extract the cacheBehaviors [Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-cloudfront-distribution-cachebehavior.html]
//     const cachebehaviors: cloudfront.CfnDistribution.CacheBehaviorProperty[]|undefined = this.setCacheBehavior(config.CacheBehaviors);
//     // Extract the custom error responses [Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-cloudfront-distribution-customerrorresponse.html]
//     const rawCustsomErrorResponse: any[] = this.getConfigItems(config.CustomErrorResponse);
//     const customErrorResponses: cloudfront.CfnDistribution.CustomErrorResponseProperty[]|undefined = rawCustsomErrorResponse.length > 0 ? rawCustsomErrorResponse.map((elem: any): cloudfront.CfnDistribution.CustomErrorResponseProperty => {
//       return {
//         errorCode: elem.ErrorCode !== undefined ? Number(elem.ErrorCode) : undefined,
//         errorCachingMinTtl: elem.ErrorCachingMinTTL !== undefined ? Number(elem.ErrorCachingMinTTL) : undefined,
//         responseCode: elem.ResponseCode !== undefined ? Number(elem.ResponseCode) : undefined,
//         responsePagePath: elem.PesponsePagePath
//       };
//     }) : undefined;
//     // Extract the default cache behaviors [Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-cloudfront-distribution-defaultcachebehavior.html]
//     const defaultCacheBehaviors: cloudfront.CfnDistribution.DefaultCacheBehaviorProperty|undefined = this.setCacheBehavior(config.DefaultCacheBehaviorProperty);
//     // Extract the logging [Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-cloudfront-distribution-logging.html]
//     const logging: cloudfront.CfnDistribution.LoggingProperty|undefined = config.Logging !== undefined ? config.Logging.Enabled === true ? {
//       bucket: config.Logging.Bucket !== undefined ? getResource("s3", config.Logging.Bucket) : undefined,
//       includeCookies: config.Logging.IncludeCookies,
//       prefix: config.Logging.Prefix
//     } : undefined : undefined;
//     // Extract the origin groups [Ref. https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-cloudfront-distribution-origingroups.html]
//     const originGroups: cloudfront.CfnDistribution.OriginGroupsProperty|undefined = config.OriginGroups !== undefined ? {
//       quantity: config.OriginGroups.Quantity,
//       items: config.OriginGroups.Item !== undefined ? config.OriginGroups.Item.map((elem: any): cloudfront.CfnDistribution.OriginGroupProperty => {
//         return {
//           failoverCriteria: elem.FailoverCriteria !== undefined ? {
//             statusCodes: elem.FailoverCriteria.StatusCodes !== undefined ? {
//               items: elem.FailoverCriteria.StatusCodes.Items,
//               quantity: elem.FailoverCriteria.StatusCodes.Quantity !== undefined ? Number(elem.FailoverCriteria.StatusCodes.Quantity): undefined
//             } : undefined
//           } : undefined,
//           id: elem.Id,
//           members: elem.Members !== undefined ? {
//             items: elem.Members.Items,
//             quantity: elem.Members.Quantity ? Number(elem.Members.Quantity) : undefined
//           } : undefined
//         }
//       }) : undefined
//     } : undefined;

//     // Create the properties for distribution
//     const props: cloudfront.CfnDistributionProps = {
//       distributionConfig: {
//         enabled: config.Enabled,
//         //
//         aliases: this.getConfigItems(config.Aliases),
//         cacheBehaviors: cachebehaviors,
//         comment: config.Comment !== undefined ? config.Comment !== "" ? config.Comment : undefined : undefined,
//         customErrorResponses: customErrorResponses,
//         defaultCacheBehavior: cachebehaviors !== undefined ? defaultCacheBehaviors : undefined,
//         defaultRootObject: config.DefaultRootObject,
//         httpVersion: config.HttpVersion,
//         ipv6Enabled: config.IsIPV6Enabled,
//         logging: logging,
//         originGroups: originGroups,
//       }
//     };
//   }

//   private getConfigItems(config: any): any[] {
//     if (config !== undefined) {
//       if (config.Quantity !== undefined && Number(config.Quantity) > 0) {
//         return config.Item !== undefined ? config.Item : [];
//       }
//     }
//     // Else return
//     return undefined;
//   }

//   private setCacheBehavior(config: any): any|undefined {
//     let rawCacheBehaviors: any[];
//     const type: string = Object.prototype.toString.call(config);
//     if (type === "Object") {
//       rawCacheBehaviors.push(config);
//     } else if (type === "Array") {
//       rawCacheBehaviors = this.getConfigItems(config);
//     } else {
//       return undefined;
//     }
//     // Create the configuration for cache behavior
//     return rawCacheBehaviors.map((elem: any): any => {
//       return {
//         allowedMethods: this.getConfigItems(elem.AllowedMethods),
//         cachedMethods: elem.AllowedMethods !== undefined ? this.getConfigItems(elem.AllowedMethods.CachedMethods) : undefined,
//         cachePolicyId: elem.CachePolicyId !== undefined ? getResource("cachePolicy", elem.CachePolicyId) : undefined,
//         compress: elem.Compress !== undefined ? elem.Compress : undefined,
//         defaultTtl: elem.DefaultTTL !== undefined ? Number(elem.DefaultTTL) : undefined,
//         maxTtl: elem.MaxTTL !== undefined ? Number(elem.MaxTTL) : undefined,
//         minTtl: elem.MinTTL !== undefined ? Number(elem.MinTTL) : undefined,
//         pathPattern: elem.PathPattern,
//         targetOriginId: elem.TargetOriginId,
//         trustedKeyGroups: this.getConfigItems(elem.TrustedKeyGroups),
//         trustedSigners: this.getConfigItems(elem.TrustedSigners),
//         viewerProtocolPolicy: elem.ViewerProtocolPolicy,
//       };
//     });
//   }
// }

// export class CachePolicy {
//   private _scope: Construct;

//   /**
//    * 
//    * @description https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_cloudfront.CfnCachePolicy.CachePolicyConfigProperty.html
//    * @param scope 
//    * @param config 
//    */
//   constructor(scope: Construct, config: any) {
//     this._scope = scope;
//     // Set the parameters
//     const params: cloudfront.CfnCachePolicy.ParametersInCacheKeyAndForwardedToOriginProperty

//     // Create the properties for cache policy
//     const props: cloudfront.CfnCachePolicyProps = {
//       cachePolicyConfig: {
//         defaultTtl: config.DefaultTTL,
//         maxTtl: config.MaxTTL,
//         minTtl: config.MinTTL,
//         name: config.Name,
//         parametersInCacheKeyAndForwardedToOrigin: {

//         }
//       }
//     };
//   }
// }