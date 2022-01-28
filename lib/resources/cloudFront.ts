import { Construct } from "constructs";
import { aws_cloudfront as cloudfront } from "aws-cdk-lib";
// Util
import { getResource, storeResource } from "../utils/cache";
import { createId, extractDataFromArn, extractTags } from "../utils/util";

export class Distribution {
  private _distribution: cloudfront.CfnDistribution;
  private _scope: Construct;

  /**
   * Create the cloudFront distribution
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-cloudfront-distribution.html
   * @param scope scope context
   * @param config configuration for distribution
   */
  constructor(scope: Construct, config: any, acmCertArn: string) {
    this._scope = scope;
    // Create the properties for distribution
    const props: cloudfront.CfnDistributionProps = {
      distributionConfig: {
        enabled: config.Enabled,
        // Optional
        aliases: config.Aliases !== undefined ? config.Aliases.Items !== undefined ? config.Aliases.Item.length > 0 ? config.Aliases.Item : undefined : undefined : undefined,
        cacheBehaviors: config.CacheBehaviors !== undefined && config.CacheBehaviors.Items !== undefined && config.CacheBehaviors.Items.length > 0 ? config.CacheBehaviors.Items.map((elem: any): cloudfront.CfnDistribution.CacheBehaviorProperty => this.createCacheBehaviorFormat(elem)) : undefined,
        comment: config.Comment !== undefined && config.Comment !== "" ? config.Comment : undefined,
        customErrorResponses: config.CustomErrorResponses !== undefined && config.CustomErrorResponses.Items !== undefined && config.CustomErrorResponses.Items.length > 0 ? config.CustomErrorResponses.Items.map((elem: any): cloudfront.CfnDistribution.CustomErrorResponseProperty => {
          return {
            errorCode: Number(config.ErrorCode),
            // Optional
            errorCachingMinTtl: config.ErrorCachingMinTTL !== undefined ? Number(config.ErrorCachingMinTTL) : undefined,
            responseCode: config.ResponseCode !== undefined ? Number(config.ResponseCode) : undefined,
            responsePagePath: config.ResponsePagePath
          };
        }) : undefined,
        defaultCacheBehavior: config.CacheBehaviors !== undefined && config.CacheBehaviors.Items !== undefined && config.CacheBehaviors.Items.length > 0 ? undefined : this.createCacheBehaviorFormat(config.DefaultCacheBehavior),
        httpVersion: config.HttpVersion,
        ipv6Enabled: config.IsIPV6Enabled,
        logging: config.Logging !== undefined && config.Logging.Enabled !== undefined && config.Logging.Enabled === true ? {
          bucket: config.Logging.Bucket,
          // Optional
          includeCookies: config.Logging.IncludeCookies,
          prefix: config.Logging.Prefix
        } : undefined,
        originGroups: config.OriginGroups !== undefined && config.OriginGroups.Items !== undefined && config.OriginGroups.Items.length > 0 ? {
          items: config.OriginGroups.Items.map((elem: any): cloudfront.CfnDistribution.OriginGroupProperty => {
            return {
              failoverCriteria: {
                statusCodes: {
                  items: elem.FailoverCriteria.StatusCodes.Items !== undefined && elem.FailoverCriteria.StatusCodes.Items.length > 0 ? elem.FailoverCriteria.StatusCodes.Items : undefined,
                  quantity: Number(elem.FailoverCriteria.StatusCodes.Quantity)
                },
              },
              id: elem.Id,
              members: {
                items: elem.Members.Items.map((elem: any): cloudfront.CfnDistribution.OriginGroupMemberProperty => { return { originId: elem.OriginId }; }),
                quantity: Number(elem.Members.Quantity)
              }
            }
          }),
          quantity: config.OriginGroups.Quantity
        } : undefined,
        origins: config.Origins !== undefined && config.Origins.Items !== undefined && config.Origins.Items.length > 0 ? config.Origins.Item.map((elem: any): cloudfront.CfnDistribution.OriginProperty => {
          return {
            domainName: elem.DomainName,
            id: elem.Id,
            // Optional
            connectionAttempts: elem.ConnectionAttempts !== undefined ? Number(elem.ConnectionAttempts) : undefined,
            connectionTimeout: elem.ConnectionTimeout !== undefined ? Number(elem.ConnectionTimeout) : undefined,
            customOriginConfig: elem.CustomOriginConfig !== undefined ? {
              originProtocolPolicy: elem.CustomOriginConfig.OriginProtocolPolicy,
              // Optional
              httpPort: elem.CustomOriginConfig.HTTPPort !== undefined ? Number(elem.CustomOriginConfig.HTTPPort) : undefined,
              httpsPort: elem.CustomOriginConfig.HTTPSPort !== undefined ? Number(elem.CustomOriginConfig.HTTPSPort) : undefined,
              originKeepaliveTimeout: elem.CustomOriginConfig.OriginKeepaliveTimeout !== undefined ? Number(elem.CustomOriginConfig.OriginKeepaliveTimeout) : undefined,
              originReadTimeout: elem.CustomOriginConfig.OriginReadTimeout !== undefined ? Number(elem.CustomOriginConfig.OriginReadTimeout) : undefined,
              originSslProtocols: elem.CustomOriginConfig.OriginSslProtocols !== undefined && elem.CustomOriginConfig.OriginSslProtocols.length > 0 ? elem.CustomOriginConfig.OriginSslProtocols : undefined,
            } : undefined,
            originCustomHeaders: elem.CustomHeaders !== undefined && elem.CustomHeaders.Items !== undefined && elem.CustomHeaders.Items.length > 0 ? elem.CustomHeaders.Items.map((elem: any): cloudfront.CfnDistribution.OriginCustomHeaderProperty => {
              return {
                headerName: elem.HeaderName,
                headerValue: elem.HeaderValue
              };
            }) : undefined,
            originPath: elem.OriginPath !== undefined && elem.OriginPath !== "" ? elem.OriginPath : undefined,
            originShield: elem.OriginShield !== undefined ? {
              enabled: elem.OriginShield.Enabled,
              originShieldRegion: elem.OriginShield.OriginShieldRegion
            } : undefined,
            s3OriginConfig: elem.S3OriginConfig !== undefined ? {
              originAccessIdentity: elem.S3OriginConfig.OriginAccessIdentity
            } : undefined
          };
        }) : undefined,
        priceClass: config.PriceClass,
        restrictions: {
          geoRestriction: {
            restrictionType: config.Restrictions.GeoRestriction.RestrictionType,
            // Optoinal
            locations: config.Restrictions.GeoRestriction.Items !== undefined && config.Restrictions.GeoRestriction.Items.length > 0 ? config.Restrictions.GeoRestriction.Items : undefined
          }
        },
        viewerCertificate: config.ViewerCertificate !== undefined && acmCertArn !== undefined ? {
          acmCertificateArn: acmCertArn,
          minimumProtocolVersion: config.MinimumProtocolVersion,
          sslSupportMethod: config.SSLSupportMethod
        } : undefined,
        webAclId: config.WebACLId !== undefined && config.WebACLId !== "" ? config.WebACLId : undefined
      }
    };
    // Create the distribution
    this._distribution = new cloudfront.CfnDistribution(this._scope, createId(JSON.stringify(props)), props);
  }

  /**
   * Create the format for cache behavior
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-cloudfront-distribution-cachebehavior.html
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-cloudfront-distribution-defaultcachebehavior.html
   * @param config configuration for cache behavior
   * @returns format for cache behavior
   */
  public createCacheBehaviorFormat(config: any): any {
    // Get a cache policy
    const cachePolicy: string|undefined = config.CachePolicyId !== undefined ? getResource("cloudfront-cachepolicy", config.CachePolicyId) : undefined;
    // Get a origin request policy
    const originRequestPolicy: string|undefined = config.OriginRequestPolicyId !== undefined ? getResource("cloudfront-originrequestpolicy", config.OriginRequestPolicyId) : undefined;
    // Create the properties for cache behavior
    return {
      targetOriginId: config.TargetOriginId,
      viewerProtocolPolicy: config.ViewerProtocolPolicy,
      // Optional
      allowedMethods: config.AllowedMethods !== undefined && config.AllowedMethods.Item !== undefined && config.AllowedMethods.Item.length > 0 ? config.AllowedMethods.Items : undefined,
      cachedMethods: config.AllowedMethods !== undefined && config.AllowedMethods.CachedMethods !== undefined && config.AllowedMethods.CachedMethods.length > 0 ? config.AllowedMethods.CachedMethods : undefined,
      cachePolicyId: cachePolicy !== undefined ? cachePolicy : config.CachePolicyId,
      compress: config.Compress,
      defaultTtl: config.DefaultTTL,
      fieldLevelEncryptionId: config.FieldLevelEncryptionId !== undefined && config.FieldLevelEncryptionId !== "" ? config.FieldLevelEncryptionId : undefined,
      forwardedValues: config.ForwardedValues !== undefined ? {
        queryString: config.ForwardedValues.QueryString,
        // Optional
        cookies: config.ForwardedValues.Cookies !== undefined ? {
          forward: config.ForwardedValues.Cookies.Forward,
          // Optional
          whitelistedNames: config.ForwardedValues.Cookies.WhitelistedNames !== undefined && config.ForwardedValues.Cookies.WhitelistedNames.length > 0 ? config.ForwardedValues.Cookies.WhitelistedNames : undefined,
        } : undefined,
        headers: config.ForwardedValues.Headers !== undefined && config.ForwardedValues.Headers.length > 0 ? config.ForwardedValues.Headers : undefined,
        queryStringCacheKeys: config.ForwardedValues.QueryStringCacheKeys !== undefined && config.ForwardedValues.QueryStringCacheKeys.length > 0 ? config.ForwardedValues.QueryStringCacheKeys : undefined
      } : undefined,
      functionAssociations: config.FunctionAssociations !== undefined && config.FunctionAssociations.Item !== undefined && config.FunctionAssociations.Item.length > 0 ? config.FunctionAssociations.Item.map((elem: any): cloudfront.CfnDistribution.FunctionAssociationProperty => {
        return {
          eventType: elem.EventType,
          functionArn: elem.FunctionArn !== undefined ? getResource("cloudfront-function", elem.FunctionArn) : undefined,
        };
      }) : undefined,
      lambdaFunctionAssociations: config.LambdaFunctionAssociations !== undefined && config.LambdaFunctionAssociations.Item !== undefined && config.LambdaFunctionAssociations.Item.length > 0 ? config.LambdaFunctionAssociations.Item.map((elem: any): cloudfront.CfnDistribution.LambdaFunctionAssociationProperty => {
        return {
          eventType: elem.EventType,
          lambdaFunctionArn: elem.LambdaFunctionArn ? getResource("lambda", extractDataFromArn(elem.LambdaFunctionArn, "resource")) : undefined,
        }
      }) : undefined,
      maxTtl: config.MaxTTL !== undefined ? Number(config.MaxTTL) : undefined,
      minTtl: config.MinTTL !== undefined ? Number(config.MinTTL) : undefined,
      originRequestPolicyId: originRequestPolicy !== undefined ? originRequestPolicy : config.OriginRequestPolicyId,
    };
  }

  /**
   * Set the tags
   * @param config configuration for tags
   */
  public setTags(config: any) {
    // Create a list of tag
    const tags = extractTags(config);
    // Set the tags
    if (tags.length > 0) {
      this._distribution.addPropertyOverride("Tags", tags);
    }
  }
}

export class Function {
  private _function: cloudfront.CfnFunction;
  private _scope: Construct;

  /**
   * Create the function for cloudfront
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-cloudfront-function.html
   * @param scope scope context
   * @param config configuration for function
   */
  constructor(scope: Construct, config: any) {
    this._scope = scope;
    // Create the properties for function
    const props: cloudfront.CfnFunctionProps = {
      name: config.Name,
      // Optional
      autoPublish: config.AutoPublish,
      functionCode: config.FunctionCode,
      functionConfig: config.FunctionConfig !== undefined ? {
        comment: config.FunctionConfig.Comment,
        runtime: config.FunctionConfig.Runtime
      } : undefined,
    };
    // Create the function
    this._function = new cloudfront.CfnFunction(this._scope, createId(JSON.stringify(props)), props);
    // Store the resource
    storeResource("cloudfront-function", config.FunctionArn, this._function.ref);
  }

  /**
   * Get an arn for function
   * @returns arn for function
   */
  public getArn(): string {
    return this._function.ref;
  }
}

export class CachePolicy {
  private _policy: cloudfront.CfnCachePolicy;
  private _scope: Construct;

  /**
   * Create the cache policy for cloudfront
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-cloudfront-cachepolicy.html
   * @param scope scope context
   * @param prevId previous resource id
   * @param config configuration for cache policy
   */
  constructor(scope: Construct, prevId: string, config: any) {
    this._scope = scope;
    // Create the propertise for cache policy
    const props: cloudfront.CfnCachePolicyProps = {
      cachePolicyConfig: {
        defaultTtl: Number(config.DefaultTTL),
        maxTtl: Number(config.MaxTTL),
        minTtl: Number(config.MinTTL),
        name: config.Name,
        parametersInCacheKeyAndForwardedToOrigin: {
          cookiesConfig: {
            cookieBehavior: config.ParametersInCacheKeyAndForwardedToOrigin.CookiesConfig.CookieBehavior,
            // Optional
            cookies: config.ParametersInCacheKeyAndForwardedToOrigin.CookiesConfig.Cookies !== undefined && config.ParametersInCacheKeyAndForwardedToOrigin.CookiesConfig.Cookies.length > 0 ? config.ParametersInCacheKeyAndForwardedToOrigin.CookiesConfig.Cookies : undefined,
          },
          enableAcceptEncodingGzip: config.ParametersInCacheKeyAndForwardedToOrigin.EnableAcceptEncodingGzip,
          headersConfig: {
            headerBehavior: config.ParametersInCacheKeyAndForwardedToOrigin.HeaderConfig.HeaderBehavior,
            // Optional
            headers: config.ParametersInCacheKeyAndForwardedToOrigin.HeaderConfig.Headers !== undefined && config.ParametersInCacheKeyAndForwardedToOrigin.HeaderConfig.Headers.length > 0 ? config.ParametersInCacheKeyAndForwardedToOrigin.HeaderConfig.Headers : undefined,
          },
          queryStringsConfig: {
            queryStringBehavior: config.ParametersInCacheKeyAndForwardedToOrigin.QueryStringsConfig.QueryStringBehavior,
            // Optional
            queryStrings: config.ParametersInCacheKeyAndForwardedToOrigin.QueryStringsConfig.QueryStrings !== undefined && config.ParametersInCacheKeyAndForwardedToOrigin.QueryStringsConfig.QueryStrings.length > 0  ? config.ParametersInCacheKeyAndForwardedToOrigin.QueryStringsConfig.QueryStrings : undefined,
          },
          // Optional
          enableAcceptEncodingBrotli: config.ParametersInCacheKeyAndForwardedToOrigin.EnableAcceptEncodingBrotli,
        },
        // Optional
        comment: config.Comment !== undefined && config.Comment !== "" ? config.Comment : undefined
      }
    };
    // Create the cache policy
    this._policy = new cloudfront.CfnCachePolicy(this._scope, createId(JSON.stringify(props)), props);
    // Store the resource
    storeResource("cloudfront-cachepolicy", prevId, this._policy.ref);
  }

  /**
   * Get id for cache policy
   * @returns id for cache policy
   */
  public getId(): string {
    return this._policy.ref;
  }  
}

export class OriginRequestPolicy {
  private _policy: cloudfront.CfnOriginRequestPolicy;
  private _scope: Construct;

  /**
   * Create the origin request policy for cloudfront
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-cloudfront-originrequestpolicy.html
   * @param scope scope context
   * @param prevId previous resource id
   * @param config configuration for orgin request policy
   */
  constructor(scope: Construct, prevId: string, config: any) {
    this._scope = scope;
    // Create the prorperties for origin request policy
    const props: cloudfront.CfnOriginRequestPolicyProps = {
      originRequestPolicyConfig: {
        cookiesConfig: {
          cookieBehavior: config.CookiesConfig.CookieBehavior,
          // Optional
          cookies: config.CookiesConfig.Cookies !== undefined && config.CookiesConfig.Cookies.length > 0 ? config.CookiesConfig.Cookies : undefined
        },
        headersConfig: {
          headerBehavior: config.HeadersConfig.HeaderBehavior,
          // Optional
          headers: config.HeadersConfig.Headers !== undefined && config.HeadersConfig.Headers.length > 0 ? config.HeadersConfig.Headers : undefined
        },
        name: config.Name,
        queryStringsConfig: {
          queryStringBehavior: config.QueryStringsConfig.QueryStringBehavior,
          // Optional
          queryStrings: config.QueryStringsConfig.QueryStrings !== undefined && config.QueryStringsConfig.QueryStrings.length > 0 ? config.QueryStringsConfig.QueryStrings : undefined
        },
        // Optional
        comment: config.Comment !== undefined && config.Comment !== "" ? config.Comment : undefined,
      }
    };
    // Create the origin request policy
    this._policy = new cloudfront.CfnOriginRequestPolicy(this._scope, createId(JSON.stringify(props)), props);
    // Store the resource
    storeResource("cloudfront-originrequestpolicy", prevId, this._policy.ref);
  }
}

export class ResponseHeaderPolicy {
  private _policy: cloudfront.CfnResponseHeadersPolicy;
  private _scope: Construct;

  /**
   * Create the response header policy for cloudfront
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-cloudfront-responseheaderspolicy.html
   * @param scope scope context
   * @param prevId previous resource id
   * @param config configuration for response header policy
   */
  constructor(scope: Construct, prevId: string, config: any) {
    this._scope = scope;
    // Create the properties for response header policy
    const props: cloudfront.CfnResponseHeadersPolicyProps = {
      responseHeadersPolicyConfig: {
        name: config.Name,
        // Optional
        comment: config.Comment,
        corsConfig: {
          accessControlAllowCredentials: config.AccessControlAllowCredentials,
          accessControlAllowHeaders: {
            items: config.accessControlAllowHeaders.Items
          },
          accessControlAllowMethods: {
            items: config.AccessControlAllowMethods.Items
          },
          accessControlAllowOrigins: {
            items: config.AccessControlAllowOrigins.Items
          },
          originOverride: config.OriginOverride,
          // Optional
          accessControlExposeHeaders: config.AccessControlExposeHeaders !== undefined && config.AccessControlExposeHeaders.Items !== undefined && config.AccessControlExposeHeaders.Items.length > 0 ? { items: config.AccessControlExposeHeaders.Items } : undefined,
          accessControlMaxAgeSec: config.AccessControlMaxAgeSec !== undefined ? Number(config.AccessControlMaxAgeSec) : undefined,
        },
        customHeadersConfig: config.CustomHeadersConfig !== undefined && config.CustomHeadersConfig.Items !== undefined && config.CustomHeadersConfig.Items.length > 0 ? {
          items: config.CustomHeadersConfig.Items.map((elem: any): cloudfront.CfnResponseHeadersPolicy.CustomHeaderProperty => { return { header: elem.Header, override: elem.Override, value: elem.Value }; })
        } : undefined,
        securityHeadersConfig: {
          contentSecurityPolicy: config.SecurityHeadersConfig.ContentSecurityPolicy !== undefined ? {
            contentSecurityPolicy: config.SecurityHeadersConfig.ContentSecurityPolicy.ContentSecurityPolicy,
            override: config.SecurityHeadersConfig.ContentSecurityPolicy.Override
          } : undefined,
          contentTypeOptions: config.SecurityHeadersConfig.ContentTypeOptions !== undefined ? {
            override: config.SecurityHeadersConfig.ContentTypeOptions.Override
          } : undefined,
          frameOptions: config.FrameOptions !== undefined ? {
            frameOption: config.FrameOptions.FrameOptions,
            override: config.FrameOptions.Override
          } : undefined,
          referrerPolicy: config.ReferrerPolicy !== undefined ? {
            referrerPolicy: config.ReferrerPolicy.ReferrerPolicy,
            override: config.ReferrerPolicy.Override
          } : undefined,
          strictTransportSecurity: {
            accessControlMaxAgeSec: Number(config.StrictTransportSecurity.AccessControlMaxAgeSec),
            override: config.StrictTransportSecurity.Override,
            // Optional
            includeSubdomains: config.StrictTransportSecurity.IncludeSubdomains,
            preload: config.StrictTransportSecurity.Preload
          },
          xssProtection: config.XSSProtection !== undefined ? {
            override: config.XSSProtection.Override,
            protection: config.XSSProtection.Protection,
            // Optional
            modeBlock: config.XSSProtection.ModeBlock,
            reportUri: config.XSSProtection.ReportUri
          } : undefined
        },
      }
    };
    // Create the response headers policy
    this._policy = new cloudfront.CfnResponseHeadersPolicy(this._scope, createId(JSON.stringify(props)), props);
    // Store the resource
    storeResource("cloudfront-responseheaderspolicy", prevId, this._policy.ref);
  }
}