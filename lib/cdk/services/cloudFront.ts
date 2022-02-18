import { Construct } from "constructs";
import { aws_cloudfront as cloudfront } from "aws-cdk-lib";
// Util
import { createId } from "../../utils/util";

export class CachePolicy {
  private _policy: cloudfront.CfnCachePolicy;
  private _scope: Construct;

  /**
   * Create a cloudfront cache policy
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-cloudfront-cachepolicy-cachepolicyconfig.html
   * @param scope scope context
   * @param config configuration for cache policy
   */
  constructor(scope: Construct, config: any) {
    // Set a scope
    this._scope = scope;

    // Create a properties to create a cache policy
    const props: cloudfront.CfnCachePolicyProps = {
      cachePolicyConfig: {
        comment: config.Comment,
        defaultTtl: Number(config.DefaultTTL),
        maxTtl: Number(config.MaxTTL),
        minTtl: Number(config.MinTTL),
        name: config.Name,
        parametersInCacheKeyAndForwardedToOrigin: {
          cookiesConfig: {
            cookieBehavior: config.ParametersInCacheKeyAndForwardedToOrigin.CookiesConfig.CookieBehavior,
            cookies: config.ParametersInCacheKeyAndForwardedToOrigin.CookiesConfig.Cookies && config.ParametersInCacheKeyAndForwardedToOrigin.CookiesConfig.Cookies.Items ? config.ParametersInCacheKeyAndForwardedToOrigin.CookiesConfig.Cookies.Items : undefined
          },
          enableAcceptEncodingGzip: config.ParametersInCacheKeyAndForwardedToOrigin.EnableAcceptEncodingGzip,
          enableAcceptEncodingBrotli: config.ParametersInCacheKeyAndForwardedToOrigin.EnableAcceptEncodingBrotli,
          headersConfig: {
            headerBehavior: config.ParametersInCacheKeyAndForwardedToOrigin.HeadersConfig.HeaderBehavior,
            headers: config.ParametersInCacheKeyAndForwardedToOrigin.HeadersConfig.Headers && config.ParametersInCacheKeyAndForwardedToOrigin.HeadersConfig.Headers.Items ? config.ParametersInCacheKeyAndForwardedToOrigin.HeadersConfig.Headers.Items : undefined
          },
          queryStringsConfig: {
            queryStringBehavior: config.ParametersInCacheKeyAndForwardedToOrigin.QueryStringsConfig.QueryStringBehavior,
            queryStrings: config.ParametersInCacheKeyAndForwardedToOrigin.QueryStringsConfig.QueryStrings && config.ParametersInCacheKeyAndForwardedToOrigin.QueryStringsConfig.QueryStrings.Items ? config.ParametersInCacheKeyAndForwardedToOrigin.QueryStringsConfig.QueryStrings.Items : undefined
          }
        }
      }
    };
    // Create a cache policy
    this._policy = new cloudfront.CfnCachePolicy(this._scope, createId(JSON.stringify(props)), props); 
  }

  /**
   * Get a cache policy id
   * @returns cache policy id
   */
  public getId(): string {
    return this._policy.ref;
  }
}

export class Distribution {
  private _distribution: cloudfront.CfnDistribution;
  private _scope: Construct;

  /**
   * Create a cloudfront distribution
   * @description 
   * @param scope scope context
   * @param config configuration for distribution
   */
  constructor(scope: Construct, config: any) {
    // Set a scope
    this._scope = scope;

    // Create a properties to create a distribution
    const props: cloudfront.CfnDistributionProps = {
      distributionConfig: {
        aliases: config.Aliases && config.Aliases.Items ? config.Aliases.Items : undefined,
        comment: config.Comment && config.Comment !== "" ? config.Comment : undefined,
        customErrorResponses: config.CustomErrorResponses && config.CustomErrorResponses.Items ? config.CustomErrorResponses.Items.map((elem: any): cloudfront.CfnDistribution.CustomErrorResponseProperty => {
          return {
            errorCachingMinTtl: elem.ErrorCachingMinTTL ? Number(elem.ErrorCachingMinTTL) : undefined,
            errorCode: Number(elem.ErrorCode),
            responseCode: elem.ResponseCode,
            responsePagePath: elem.ResponsePagePath
          };
        }) : undefined,
        defaultCacheBehavior: config.DefaultCacheBehavior ? {
          allowedMethods: config.DefaultCacheBehavior.AllowedMethods && config.DefaultCacheBehavior.AllowedMethods.Items ? config.DefaultCacheBehavior.AllowedMethods.Items : undefined,
          cachedMethods: config.DefaultCacheBehavior.AllowedMethods && config.DefaultCacheBehavior.AllowedMethods.CachedMethods && config.DefaultCacheBehavior.AllowedMethods.CachedMethods.Items ? config.DefaultCacheBehavior.AllowedMethods.CachedMethods.Items : undefined,
          compress: config.DefaultCacheBehavior.Compress,
          smoothStreaming: config.DefaultCacheBehavior.SmoothStreaming,
          targetOriginId: config.DefaultCacheBehavior.TargetOriginId,
          viewerProtocolPolicy: config.DefaultCacheBehavior.ViewerProtocolPolicy
        } : undefined,
        defaultRootObject: config.DefaultRootObject,
        enabled: config.Enabled,
        httpVersion: config.HttpVersion,
        ipv6Enabled: config.IsIPV6Enabled,
        priceClass: config.PriceClass,
        restrictions: config.Restrictions ? {
          geoRestriction: {
            restrictionType: config.Restrictions.GeoRestriction.RestrictionType,
            locations: config.Restrictions.GeoRestriction.Items
          }
        } : undefined,
      }
    };
    // Create a distribution
    this._distribution = new cloudfront.CfnDistribution(this._scope, createId(JSON.stringify(props)), props);
  }

  /**
   * Get a distribution id
   * @returns distribution id
   */
  public getId(): string {
    return this._distribution.ref;
  }
}

export class Function {
  private _function: cloudfront.CfnFunction;
  private _scope: Construct;
  
  /**
   * Create a cloudfront function
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-cloudfront-function.html
   * @param scope scope context
   * @param config configuration for function
   */
  constructor(scope: Construct, config: any) {
    // Set a scope
    this._scope = scope;

    // Create a properties to create a function
    const props: cloudfront.CfnFunctionProps = {
      autoPublish: config.FunctionMetadata.Stage === "LIVE" ? true : undefined,
      functionCode: config.FunctionCode,
      functionConfig: config.FunctionConfig ? {
        comment: config.FunctionConfig.Comment,
        runtime: config.FunctionConfig.Runtime
      } : undefined,
      name: config.Name,
    };
    // Create a function
    this._function = new cloudfront.CfnFunction(this._scope, createId(JSON.stringify(props)), props);
  }

  /**
   * Get a function arn
   * @returns function arn
   */
  public getArn(): string {
    return this._function.attrFunctionArn;
  }
}

export class OriginAccessIdentity {
  private _identiry: cloudfront.CfnCloudFrontOriginAccessIdentity;
  private _scope: Construct;

  /**
   * Create a cloudfront origin access identity
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-cloudfront-cloudfrontoriginaccessidentity-cloudfrontoriginaccessidentityconfig.html
   * @param scope scope context
   * @param config configuration for origin access identity
   */
  constructor (scope: Construct, config: any) {
    // Set a scope
    this._scope = scope;

    // Create a properties to create a origin access identity
    const props: cloudfront.CfnCloudFrontOriginAccessIdentityProps = {
      cloudFrontOriginAccessIdentityConfig: {
        comment: config.Comment
      }
    };
    // Create a origin access identity
    this._identiry = new cloudfront.CfnCloudFrontOriginAccessIdentity(this._scope, createId(JSON.stringify(props)), props);
  }

  /**
   * Get a origin access identity id
   * @returns origin access identity id
   */
  public getId(): string {
    return this._identiry.ref;
  }
}

export class OriginRequestPolicy {
  private _policy: cloudfront.CfnOriginRequestPolicy;
  private _scope: Construct;

  /**
   * Create a cloudfront origin request policy
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-cloudfront-originrequestpolicy-originrequestpolicyconfig.html
   * @param scope scope context
   * @param config configuration for origin request policy
   */
  constructor(scope: Construct, config: any) {
    // Set a scope
    this._scope = scope;

    // Create a properties to create a origin request policy
    const props: cloudfront.CfnOriginRequestPolicyProps = {
      originRequestPolicyConfig: {
        comment: config.Comment,
        cookiesConfig: {
          cookieBehavior: config.cookiesConfig.CookieBehavior,
          cookies: config.cookiesConfig.Cookies && config.cookiesConfig.Cookies.Items ? config.cookiesConfig.Cookies.Items : undefined
        },
        headersConfig: {
          headerBehavior: config.HeadersConfig.HeaderBehavior,
          headers: config.HeadersConfig.Headers && config.HeadersConfig.Headers.Items ? config.config.HeadersConfig.Headers.Items : undefined
        },
        name: config.Name,
        queryStringsConfig: {
          queryStringBehavior: config.QueryStringsConfig.QueryStringBehavior,
          queryStrings: config.QueryStringsConfig.QueryStrings && config.QueryStringsConfig.QueryStrings.Items ? config.QueryStringsConfig.QueryStrings.Items : undefined
        }
      }
    };
    // Create a origin request policy
    this._policy = new cloudfront.CfnOriginRequestPolicy(this._scope, createId(JSON.stringify(props)), props);
  }

  /**
   * Get a origin request policy id
   * @returns origin request policy id
   */
  public getId(): string {
    return this._policy.ref;
  }
}

export class ResponseHeadersPolicy {
  private _policy: cloudfront.CfnResponseHeadersPolicy;
  private _scope: Construct;

  /**
   * Create a cloudfront response headers policy
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-cloudfront-responseheaderspolicy-responseheaderspolicyconfig.html
   * @param scope scope context
   * @param config configuration for response headers policy
   */
  constructor(scope: Construct, config:any) {
    // Set a scope
    this._scope = scope;

    // Create a properties to create a response headers policy
    const props: cloudfront.CfnResponseHeadersPolicyProps = {
      responseHeadersPolicyConfig: {
        comment: config.Comment,
        corsConfig: config.CorsConfig ? {
          accessControlAllowCredentials: config.CorsConfig.AccessControlAllowCredentials,
          accessControlAllowHeaders: {
            items: config.CorsConfig.AccessControlAllowHeaders.Items
          },
          accessControlAllowMethods: {
            items: config.CorsConfig.AccessControlAllowMethods.Items
          },
          accessControlAllowOrigins: {
            items: config.CorsConfig.AccessControlAllowOrigins.Items
          },
          accessControlExposeHeaders: config.CorsConfig.AccessControlExposeHeaders && config.CorsConfig.AccessControlExposeHeaders.Items ? {
            items: config.CorsConfig.AccessControlExposeHeaders.Items
          } : undefined,
          accessControlMaxAgeSec: config.CorsConfig.AccessControlMaxAgeSec ? Number(config.CorsConfig.AccessControlMaxAgeSec) : undefined,
          originOverride: config.CorsConfig.OriginOverride
        } : undefined,
        customHeadersConfig: config.CustomHeadersConfig && config.CustomHeadersConfig.Items ? config.CustomHeadersConfig.Items.map((elem: any): cloudfront.CfnResponseHeadersPolicy.CustomHeaderProperty => {
          return {
            header: elem.Header,
            override: elem.Override,
            value: elem.Value
          };
        }) : undefined,
        name: config.Name,
        securityHeadersConfig: config.SecurityHeadersConfig ? {
          contentSecurityPolicy: config.SecurityHeadersConfig.ContentSecurityPolicy ? {
            contentSecurityPolicy: config.SecurityHeadersConfig.ContentSecurityPolicy.ContentSecurityPolicy,
            override: config.SecurityHeadersConfig.ContentSecurityPolicy.Override
          } : undefined,
          contentTypeOptions: config.SecurityHeadersConfig.ContentTypeOptions ? {
            override: config.SecurityHeadersConfig.ContentTypeOptions.Override
          } : undefined,
          frameOptions: config.SecurityHeadersConfig.FrameOptions ? {
            frameOption: config.SecurityHeadersConfig.FrameOptions.FrameOption,
            override: config.SecurityHeadersConfig.FrameOptions.Override
          } : undefined,
          referrerPolicy: config.SecurityHeadersConfig.ReferrerPolicy ? {
            referrerPolicy: config.SecurityHeadersConfig.ReferrerPolicy.ReferrerPolicy,
            override: config.SecurityHeadersConfig.ReferrerPolicy.Override
          } : undefined,
          strictTransportSecurity: config.SecurityHeadersConfig.StrictTransportSecurity ? {
            accessControlMaxAgeSec: Number(config.SecurityHeadersConfig.StrictTransportSecurity.AccessControlMaxAgeSec),
            includeSubdomains: config.SecurityHeadersConfig.StrictTransportSecurity.IncludeSubdomains,
            override: config.SecurityHeadersConfig.StrictTransportSecurity.Override,
            preload: config.SecurityHeadersConfig.StrictTransportSecurity.Preload
          } : undefined,
          xssProtection: config.SecurityHeadersConfig.XSSProtection ? {
            modeBlock: config.SecurityHeadersConfig.XSSProtection.ModeBlock,
            override: config.SecurityHeadersConfig.XSSProtection.Override,
            protection: config.SecurityHeadersConfig.XSSProtection.Protection,
            reportUri: config.SecurityHeadersConfig.XSSProtection.ReportUri
          } : undefined
        } : undefined
      }
    };
    // Create a response headers policy
    this._policy = new cloudfront.CfnResponseHeadersPolicy(this._scope, createId(JSON.stringify(props)), props);
  }

  /**
   * Get a response headers policy id
   * @returns response headers policy id
   */
  public getId(): string {
    return this._policy.ref;
  }
}