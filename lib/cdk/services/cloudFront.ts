import { Construct } from "constructs";
import { aws_cloudfront as cloudfront } from "aws-cdk-lib";
// Util
import { getResource } from "../../utils/cache";
import { createId, extractTags } from "../../utils/util";

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
        aliases: config.Aliases ? config.Aliases.Items ? config.Aliases.Items.length > 0 ? config.Aliases.Items : undefined : undefined : undefined,
        cacheBehaviors: config.CacheBehaviors && config.CacheBehaviors.Items && config.CacheBehaviors.Items.length > 0 ? config.CacheBehaviors.Items.map((elem: any): cloudfront.CfnDistribution.CacheBehaviorProperty => this.createCacheBehaviorFormat(elem)) : undefined,
        comment: config.Comment && config.Comment !== "" ? config.Comment : undefined,
        customErrorResponses: config.CustomErrorResponses && config.CustomErrorResponses.Items && config.CustomErrorResponses.Items.length > 0 ? config.CustomErrorResponses.Items.map((elem: any): cloudfront.CfnDistribution.CustomErrorResponseProperty => {
          return {
            errorCode: Number(elem.ErrorCode),
            // Optional
            errorCachingMinTtl: elem.ErrorCachingMinTTL ? Number(elem.ErrorCachingMinTTL) : undefined,
            responseCode: elem.ResponseCode ? Number(elem.ResponseCode) : undefined,
            responsePagePath: elem.ResponsePagePath
          };
        }) : undefined,
        defaultCacheBehavior: config.CacheBehaviors && config.CacheBehaviors.Items !== undefined && config.CacheBehaviors.Items.length > 0 ? undefined : this.createCacheBehaviorFormat(config.DefaultCacheBehavior),
        httpVersion: config.HttpVersion,
        ipv6Enabled: config.IsIPV6Enabled,
        logging: config.Logging && config.Logging.Enabled && config.Logging.Enabled === true ? {
          bucket: config.Logging.Bucket,
          // Optional
          includeCookies: config.Logging.IncludeCookies,
          prefix: config.Logging.Prefix
        } : undefined,
        originGroups: config.OriginGroups && config.OriginGroups.Items !== undefined && config.OriginGroups.Items.length > 0 ? {
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
        origins: config.Origins && config.Origins.Items !== undefined && config.Origins.Items.length > 0 ? config.Origins.Items.map((elem: any): cloudfront.CfnDistribution.OriginProperty => {
          return {
            domainName: elem.DomainName,
            id: elem.Id,
            // Optional
            connectionAttempts: elem.ConnectionAttempts ? Number(elem.ConnectionAttempts) : undefined,
            connectionTimeout: elem.ConnectionTimeout ? Number(elem.ConnectionTimeout) : undefined,
            customOriginConfig: elem.CustomOriginConfig ? {
              originProtocolPolicy: elem.CustomOriginConfig.OriginProtocolPolicy,
              // Optional
              httpPort: elem.CustomOriginConfig.HTTPPort ? Number(elem.CustomOriginConfig.HTTPPort) : undefined,
              httpsPort: elem.CustomOriginConfig.HTTPSPort ? Number(elem.CustomOriginConfig.HTTPSPort) : undefined,
              originKeepaliveTimeout: elem.CustomOriginConfig.OriginKeepaliveTimeout ? Number(elem.CustomOriginConfig.OriginKeepaliveTimeout) : undefined,
              originReadTimeout: elem.CustomOriginConfig.OriginReadTimeout ? Number(elem.CustomOriginConfig.OriginReadTimeout) : undefined,
              originSslProtocols: elem.CustomOriginConfig.OriginSslProtocols && elem.CustomOriginConfig.OriginSslProtocols.length > 0 ? elem.CustomOriginConfig.OriginSslProtocols : undefined,
            } : undefined,
            originCustomHeaders: elem.CustomHeaders !== undefined && elem.CustomHeaders.Items !== undefined && elem.CustomHeaders.Items.length > 0 ? elem.CustomHeaders.Items.map((elem: any): cloudfront.CfnDistribution.OriginCustomHeaderProperty => {
              return {
                headerName: elem.HeaderName,
                headerValue: elem.HeaderValue
              };
            }) : undefined,
            originPath: elem.OriginPath && elem.OriginPath !== "" ? elem.OriginPath : undefined,
            originShield: elem.OriginShield ? {
              enabled: elem.OriginShield.Enabled,
              originShieldRegion: elem.OriginShield.OriginShieldRegion
            } : undefined,
            s3OriginConfig: elem.S3OriginConfig ? {
              originAccessIdentity: getResource("cloudfront-oai", elem.DomainName) ? getResource("cloudfront-oai", elem.DomainName).getId() : elem.S3OriginConfig.OriginAccessIdentity
            } : undefined
          };
        }) : undefined,
        priceClass: config.PriceClass,
        restrictions: {
          geoRestriction: {
            restrictionType: config.Restrictions.GeoRestriction.RestrictionType,
            // Optoinal
            locations: config.Restrictions.GeoRestriction.Items && config.Restrictions.GeoRestriction.Items.length > 0 ? config.Restrictions.GeoRestriction.Items : undefined
          }
        },
        viewerCertificate: config.ViewerCertificate && acmCertArn ? {
          acmCertificateArn: acmCertArn,
          minimumProtocolVersion: config.ViewerCertificate.MinimumProtocolVersion,
          sslSupportMethod: config.ViewerCertificate.SSLSupportMethod
        } : undefined,
        webAclId: config.WebACLId && config.WebACLId !== "" ? config.WebACLId : undefined
      }
    };
    console.log(props.distributionConfig);
    
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
    const cachePolicy: string|undefined = config.CachePolicyId ? getResource("cloudfront-cachepolicy", config.CachePolicyId) ? getResource("cloudfront-cachepolicy", config.CachePolicyId).getId() : undefined : undefined;
    // Get a origin request policy
    const originRequestPolicy: string|undefined = config.OriginRequestPolicyId ? getResource("cloudfront-originrequestpolicy", config.OriginRequestPolicyId) ? getResource("cloudfront-originrequestpolicy", config.OriginRequestPolicyId).getId() : undefined : undefined;
    // Create the properties for cache behavior
    return {
      targetOriginId: config.TargetOriginId,
      viewerProtocolPolicy: config.ViewerProtocolPolicy,
      // Optional
      allowedMethods: config.AllowedMethods && config.AllowedMethods.Items && config.AllowedMethods.Items.length > 0 ? config.AllowedMethods.Items : undefined,
      cachedMethods: config.AllowedMethods && config.AllowedMethods.CachedMethods && config.AllowedMethods.CachedMethods.Items && config.AllowedMethods.CachedMethods.Items.length > 0 ? config.AllowedMethods.CachedMethods.Items : undefined,
      cachePolicyId: cachePolicy ? cachePolicy : config.CachePolicyId,
      compress: config.Compress,
      defaultTtl: config.DefaultTTL,
      fieldLevelEncryptionId: config.FieldLevelEncryptionId && config.FieldLevelEncryptionId !== "" ? config.FieldLevelEncryptionId : undefined,
      forwardedValues: config.ForwardedValues ? {
        queryString: config.ForwardedValues.QueryString,
        // Optional
        cookies: config.ForwardedValues.Cookies ? {
          forward: config.ForwardedValues.Cookies.Forward,
          // Optional
          whitelistedNames: config.ForwardedValues.Cookies.WhitelistedNames && config.ForwardedValues.Cookies.WhitelistedNames.length > 0 ? config.ForwardedValues.Cookies.WhitelistedNames : undefined,
        } : undefined,
        headers: config.ForwardedValues.Headers && config.ForwardedValues.Headers.length > 0 ? config.ForwardedValues.Headers : undefined,
        queryStringCacheKeys: config.ForwardedValues.QueryStringCacheKeys && config.ForwardedValues.QueryStringCacheKeys.length > 0 ? config.ForwardedValues.QueryStringCacheKeys : undefined
      } : undefined,
      functionAssociations: config.FunctionAssociations && config.FunctionAssociations.Items !== undefined && config.FunctionAssociations.Items.length > 0 ? config.FunctionAssociations.Items.map((elem: any): cloudfront.CfnDistribution.FunctionAssociationProperty => {
        return {
          eventType: elem.EventType,
          functionArn: elem.FunctionArn ? getResource("cloudfront-function", elem.FunctionArn) ? getResource("cloudfront-function", elem.FunctionArn).getArn() : undefined : undefined,
        };
      }) : undefined,
      maxTtl: config.MaxTTL ? Number(config.MaxTTL) : undefined,
      minTtl: config.MinTTL ? Number(config.MinTTL) : undefined,
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
  }

  /**
   * Get id for cache policy
   * @returns id for cache policy
   */
  public getId(): string {
    return this._policy.ref;
  }  
}

export class OriginAccessIdentity {
  private _oai: cloudfront.CfnCloudFrontOriginAccessIdentity;
  private _scope: Construct;

  /**
   * Create the origin access identiry for cloudFront
   * @param scope scope context
   * @param comment comment
   */
  constructor(scope: Construct, comment: string) {
    this._scope = scope;
    // Create the properties for origin access identity for cloudFront
    const props: cloudfront.CfnCloudFrontOriginAccessIdentityProps = {
      cloudFrontOriginAccessIdentityConfig: {
        comment: comment
      }
    };
    // Create the origin access identity
    this._oai = new cloudfront.CfnCloudFrontOriginAccessIdentity(this._scope, createId(JSON.stringify(props)), props);
  }

  /**
   * Get an id for origin access identiry
   * @returns id for origin access identity
   */
  public getId(): string {
    return this._oai.ref;
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
  }

  /**
   * Get an id for response headers policy
   * @returns id for response headers policy
   */
  public getId(): string {
    return this._policy.ref;
  }
}

export class ResponseHeadersPolicy {
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
  }

  /**
   * Get an id for response headers policy
   * @returns id for response headers policy
   */
  public getId(): string {
    return this._policy.ref;
  }
}