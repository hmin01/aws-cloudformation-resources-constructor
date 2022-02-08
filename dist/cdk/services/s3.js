"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bucket = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
// Util
const cache_1 = require("../../utils/cache");
const util_1 = require("../../utils/util");
class Bucket {
    /**
     * Create the s3 bucket
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-s3-bucket.html
     * @param scope scope context
     * @param config configuration for bucket
     */
    constructor(scope, config) {
        this._scope = scope;
        // Set the properties for bucket
        const props = {
            accelerateConfiguration: config.AccelerateConfiguration !== undefined ? { accelerationStatus: config.AccelerateConfiguration.AccelerationStatus } : undefined,
            bucketName: config.Name,
        };
        // Create the bucket
        this._bucket = new aws_cdk_lib_1.aws_s3.CfnBucket(this._scope, (0, util_1.createId)(JSON.stringify(props)), props);
    }
    /**
     * Extract the notification filter rules
     * @param config configuration for notification filter rules
     * @returns notification filter rules
     */
    extractNotificationFilterRules(config) {
        return config.Key !== undefined ? config.Key.FilterRules ? config.Key.FilterRules.map((rule) => { return { name: rule.Name, value: rule.Value }; }) : [] : [];
    }
    /**
     * Get an arn for bucket
     * @returns arn for bucket
     */
    getArn() {
        return this._bucket.attrArn;
    }
    /**
     * Get a mapping arn for lambda function
     * @param prevArn previous arn for lambda function
     * @returns arn for lambda function
     */
    getMappingLambdaFunctionArn(prevArn) {
        const arnSplit = prevArn.split(":");
        // Process according to split length
        let functionName = "";
        let versionOrAlias = "";
        if (arnSplit.length === 7) {
            functionName = arnSplit[arnSplit.length - 1];
        }
        else if (arnSplit.length === 8) {
            functionName = arnSplit[arnSplit.length - 2];
            versionOrAlias = arnSplit[arnSplit.length - 1];
        }
        // Get a lambda function
        const lambdaFunction = (0, cache_1.getResource)("lambda", functionName);
        if (lambdaFunction !== undefined) {
            if (versionOrAlias !== "")
                return lambdaFunction.getArn();
            else
                return `${lambdaFunction.getArn()}:${versionOrAlias}`;
        }
        else {
            return prevArn;
        }
    }
    /**
     * Get a mapping arn for topic
     * @param prevArn previous arn for topic
     * @returns arn for topic
     */
    getMappingTopicArn(prevArn) {
        const arnSplit = prevArn.split(":");
        if (arnSplit.length === 6) {
            const topic = (0, cache_1.getResource)("sns", arnSplit[arnSplit.length - 1]);
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
    getMappingQueueArn(prevArn) {
        const arnSplit = prevArn.split(":");
        if (arnSplit.length === 6) {
            const queue = (0, cache_1.getResource)("sqs", arnSplit[arnSplit.length - 1]);
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
    getName() {
        return this._bucket.ref;
    }
    /**
     * Set the CORS for bucket
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-corsrule.html
     * @param config configuration for CORS
     */
    setCorsConfiguration(config) {
        // Create the cors rules
        const corsRoles = config.CorsConfiguration !== undefined ? config.CorsConfiguration.CORSRules.map((elem) => {
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
    setLogging(config) {
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
    setNotifications(config) {
        if (config !== undefined && Object.keys(config).length > 0) {
            let eventBridgeConfigurations = {};
            const lambdaConfigurations = [];
            const topicConfigurations = [];
            const queueConfigurations = [];
            // Set the notification configuration for eventbridge
            if (config.EventBridgeConfigurations !== undefined) {
                eventBridgeConfigurations = config.EventBridgeConfigurations;
            }
            // Set the notification configuration for lambda functions
            if (config.LambdaFunctionConfigurations !== undefined && config.LambdaFunctionConfigurations.length > 0) {
                for (const elem of config.LambdaFunctionConfigurations) {
                    // Set the notification filter rules
                    const rules = this.extractNotificationFilterRules(elem);
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
                    const topicArn = this.getMappingTopicArn(elem.Name);
                    // Set the notification filter rules
                    const rules = this.extractNotificationFilterRules(elem);
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
                    const rules = this.extractNotificationFilterRules(elem);
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
            const props = {
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
    setOwnershipControls(config) {
        if (config !== undefined) {
            // Set the ownership control rules
            const rules = config.Rules.map((elem) => { return { objectOwnership: elem.ObjectOwnership }; });
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
    setPublicAccessBlock(config) {
        if (config !== undefined) {
            // Set the properties for public access block
            const props = {
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
    setTags(config) {
        // Create a list of tag
        const tags = (0, util_1.extractTags)(config);
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
    setWebsite(config) {
        if (config !== undefined) {
            // Extract the routes
            const routes = config.RoutingRules !== undefined ? config.RoutingRules.map((elem) => {
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
                    } : undefined
                };
            }) : [];
            // Set the properties for website configuration
            const props = {
                errorDocument: config.ErrorDocument !== undefined ? config.ErrorDocument : undefined,
                indexDocument: config.IndexDocument !== undefined ? config.IndexDocument.Suffix : undefined,
                routingRules: routes.length > 0 ? routes : undefined
            };
            // Set the website configuration
            this._bucket.addPropertyOverride("WebsiteConfiguration", props);
        }
    }
}
exports.Bucket = Bucket;
