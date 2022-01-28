import { Construct } from "constructs";
import { aws_s3 as s3 } from "aws-cdk-lib";
// Util
import { getResource } from "../utils/cache";
import { createId, extractTags } from "../utils/util";

export class Bucket {
  private _bucket: s3.CfnBucket;
  private _scope: Construct;

  /**
   * Create the s3 bucket
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-s3-bucket.html
   * @param scope scope context
   * @param config configuration for bucket
   */
  constructor(scope: Construct, config: any) {
    this._scope = scope;

    // Set the properties for bucket
    const props: s3.CfnBucketProps = {
      accelerateConfiguration: config.AccelerateConfiguration !== undefined ? { accelerationStatus: config.AccelerateConfiguration.AccelerationStatus } : undefined,
      bucketName: config.Name,
    };
    // Create the bucket
    this._bucket = new s3.CfnBucket(this._scope, createId(JSON.stringify(props)), props);
  }

  /**
   * Extract the notification filter rules
   * @param config configuration for notification filter rules
   * @returns notification filter rules
   */
  private extractNotificationFilterRules(config: any): s3.CfnBucket.FilterRuleProperty[] {
    return config.Key !== undefined ? config.Key.FilterRules ? config.Key.FilterRules.map((rule: any): s3.CfnBucket.FilterRuleProperty => { return { name: rule.Name, value: rule.Value }; }) : [] : [];
  }

  /**
   * Get an arn for bucket
   * @returns arn for bucket
   */
  private getArn(): string {
    return this._bucket.attrArn;
  }

  /**
   * Get a mapping arn for lambda function
   * @param prevArn previous arn for lambda function
   * @returns arn for lambda function
   */
  private getMappingLambdaFunctionArn(prevArn: string): string {
    const arnSplit: string[] = prevArn.split(":");
    // Process according to split length
    let functionName: string = "";
    let versionOrAlias: string = "";
    if (arnSplit.length === 7) {
      functionName = arnSplit[arnSplit.length - 1];
    } else if (arnSplit.length === 8) {
      functionName = arnSplit[arnSplit.length - 2];
      versionOrAlias = arnSplit[arnSplit.length - 1];
    }
    // Get a lambda function
    const lambdaFunction: any = getResource("lambda", functionName);
    if (lambdaFunction !== undefined) {
      if (versionOrAlias !== "") return lambdaFunction.getArn();
      else return `${lambdaFunction.getArn()}:${versionOrAlias}`;
    } else {
      return prevArn;
    }
  }

  /**
   * Get a mapping arn for topic
   * @param prevArn previous arn for topic
   * @returns arn for topic
   */
   private getMappingTopicArn(prevArn: string): string {
    const arnSplit: string[] = prevArn.split(":");
    if (arnSplit.length === 6) {
      const topic: any = getResource("sns", arnSplit[arnSplit.length - 1]);
      if (topic !== undefined) {
        return topic.getArn();
      }
    }
    return prevArn;
  }

  /**
   * Get a mapping arn for queue
   * @param prevArn previous arn for queue
   * @returns arn for queue
   */
  private getMappingQueueArn(prevArn: string): string {
    const arnSplit: string[] = prevArn.split(":");
    if (arnSplit.length === 6) {
      const queue: any = getResource("sqs", arnSplit[arnSplit.length - 1]);
      if (queue !== undefined) {
        return queue.getArn();
      }
    }
    return prevArn;
  }

  /**
   * Get a name for bucket
   * @returns name for bucket
   */
  private getName(): string {
    return this._bucket.ref;
  }

  /**
   * Set the CORS for bucket
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-corsrule.html
   * @param config configuration for CORS
   */
  public setCorsConfiguration(config: any): void {
    // Create the cors rules
    const corsRoles: any[] = config.CorsConfiguration !== undefined ? config.CorsConfiguration.CORSRules.map((elem: any): s3.CfnBucket.CorsRuleProperty => {
      return {
        allowedMethods: elem.AllowedMethods,
        allowedOrigins: elem.AllowedOrigins,
        allowedHeaders: elem.AllowedHeaders,
        exposedHeaders: elem.ExposedHeaders,
        maxAge: elem.MaxAgeSeconds ? Number(elem.MaxAgeSeconds) : undefined
      };
    }) : [];
    // Set the cors configuration
    if (corsRoles.length > 0) {
      this._bucket.addPropertyOverride("CorsConfiguration", { corsRoles: corsRoles });
    }
  }

  /**
   * Set the logging for bucket
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-loggingconfiguration.html
   * @param config configuration for logging
   */
  public setLogging(config: any): void {
    // Set the logging configuration
    if (config !== undefined && config !== null) {
      this._bucket.addPropertyOverride("LoggingConfiguration", {
        destinationBucketName: config.TargetBucket,
        logFilePrefix: config.TargetPrefix
      });
    }
  }

  /**
   * Set the notifications for bucket
   * @param config configuration for notifications
   */
  public setNotifications(config: any): void {
    if (config !== undefined && Object.keys(config).length > 0) {
      let eventBridgeConfigurations: s3.CfnBucket.EventBridgeConfigurationProperty = {};
      const lambdaConfigurations: s3.CfnBucket.LambdaConfigurationProperty[] = [];
      const topicConfigurations: s3.CfnBucket.TopicConfigurationProperty[] = [];
      const queueConfigurations: s3.CfnBucket.QueueConfigurationProperty[] = [];
      // Set the notification configuration for eventbridge
      if (config.EventBridgeConfigurations !== undefined) {
        eventBridgeConfigurations = config.EventBridgeConfigurations;
      }
      // Set the notification configuration for lambda functions
      if (config.LambdaFunctionConfigurations !== undefined && config.LambdaFunctionConfigurations.length > 0) {
        for (const elem of config.LambdaFunctionConfigurations) {
          // Set the notification filter rules
          const rules: any[] = this.extractNotificationFilterRules(elem);
          // Set the notification for lambda function
          for (const event of elem.Events) {
            lambdaConfigurations.push({
              event: event,
              function: this.getMappingLambdaFunctionArn(elem.LambdaFunctionArn),
              filter: {
                s3Key: { rules }
              }
            });
          }
        }
      }
      // Set the notification configuration for topic
      if (config.TopicConfigurations !== undefined && config.TopicConfigurations.length > 0) {
        for (const elem of config.TopicConfigurations) {
          // Extract the topic arn
          const topicArn: string = this.getMappingTopicArn(elem.Name);
          // Set the notification filter rules
          const rules: any[] = this.extractNotificationFilterRules(elem);
          // Set the notification for topic
          for (const event of elem.Events) {
            topicConfigurations.push({
              event: event,
              topic: topicArn,
              filter: {
                s3Key: { rules }
              }
            });
          }
        }
      }
      // Set the notification configuration for queue
      if (config.QueueConfigurations !== undefined && config.QueueConfigurations.length > 0) {
        for (const elem of config.QueueConfigurations) {
          // Set the notification filter rules
          const rules: any[] = this.extractNotificationFilterRules(elem);
          // Set the notification for queue
          for (const event of elem.Events) {
            queueConfigurations.push({
              event: event,
              queue: this.getMappingQueueArn(elem.Name),
              filter: {
                s3Key: { rules }
              }
            });
          }
        }
      }

      // Set the properties for notification
      const props: s3.CfnBucket.NotificationConfigurationProperty = {
        eventBridgeConfiguration: Object.keys(eventBridgeConfigurations).length > 0 ? eventBridgeConfigurations : undefined,
        lambdaConfigurations: lambdaConfigurations.length > 0 ? lambdaConfigurations : undefined,
        topicConfigurations: topicConfigurations.length > 0 ? topicConfigurations : undefined,
        queueConfigurations: queueConfigurations.length > 0 ? queueConfigurations : undefined
      };
      // Set the notification for bucket
      this._bucket.addPropertyOverride("NotificationConfiguration", props);
    }
  }

  /**
   * Set the ownership controls for bucket
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-ownershipcontrols.html
   * @param config configuration for ownership controls
   */
  public setOwnershipControls(config: any): void {
    if (config !== undefined) {
      // Set the ownership control rules
      const rules: string[] = config.Rules.map((elem: any): s3.CfnBucket.OwnershipControlsRuleProperty => { return { objectOwnership: elem.ObjectOwnership }; });
      // Set the ownership controls
      if (rules.length > 0) {
        this._bucket.addPropertyOverride("OwnershipControls", { rules: rules });
      }
    }
  }

  /**
   * Set the public access block for bucket
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-publicaccessblockconfiguration.html
   * @param config configuration for public access block
   */
  public setPublicAccessBlock(config: any): void {
    if (config !== undefined) {
      // Set the properties for public access block
      const props: s3.CfnBucket.PublicAccessBlockConfigurationProperty = {
        blockPublicAcls: config.BlockPublicAcls,
        blockPublicPolicy: config.BlockPublicPolicy,
        ignorePublicAcls: config.IgnorePublicAcls,
        restrictPublicBuckets: config.RestrictPublicBuckets
      };
      // Set the public access block
      this._bucket.addPropertyOverride("PublicAccessBlockConfiguration", props);
    }
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
      this._bucket.addPropertyOverride("Tags", tags);
    }
  }

  /**
   * Set the website for bucket
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-websiteconfiguration.html
   * @param config configuration for website
   */
  public setWebsite(config: any): void {
    if (config !== undefined) {
      // Extract the routes
      const routes: any[] = config.RoutingRules !== undefined ? config.RoutingRules.map((elem: any) => {
        return {
          redirectRule: elem.RoutingRuleCondition !== undefined ? {
            hostName: elem.RoutingRuleCondition.HostName,
            httpRedirectCode: elem.RoutingRuleCondition.HttpRedirectCode,
            protocol: elem.RoutingRuleCondition.Protocol,
            replaceKeyPrefixWith: elem.RoutingRuleCondition.ReplaceKeyPrefixWith,
            replaceKeyWith: elem.RoutingRuleCondition.ReplaceKeyWith
          } : undefined,
          routingRuleCondition: elem.RoutingRuleCondition !== undefined ? {
            httpErrorCodeReturnedEquals: elem.RoutingRuleCondition.HttpErrorCodeReturnedEquals,
            keyPrefixEquals: elem.RoutingRuleCondition.KeyPrefixEquals
          }: undefined
        }
      }) : [];

      // Set the properties for website configuration
      const props: s3.CfnBucket.WebsiteConfigurationProperty = {
        errorDocument: config.ErrorDocument !== undefined ? config.ErrorDocument : undefined,
        indexDocument: config.IndexDocument !== undefined ? config.IndexDocument.Suffix : undefined,
        routingRules: routes.length > 0 ? routes : undefined
      };
      // Set the website configuration
      this._bucket.addPropertyOverride("WebsiteConfiguration", props);
    }
  }
}