"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
// Util
const cache_1 = require("../utils/cache");
const util_1 = require("../utils/util");
class Queue {
    /**
     * Create the sqs queue
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-sqs-queues.html
     * @param scope scope context
     * @param config configuration for queue
     */
    constructor(scope, config) {
        this._scope = scope;
        // Extract the queue name from arn
        const queueName = (0, util_1.extractDataFromArn)(config.QueueArn, "resource");
        // Set the properties for queue
        const props = {
            contentBasedDeduplication: config.FifoQueue === "true" && config.ContentBasedDeduplication !== undefined ? JSON.parse(config.ContentBasedDeduplication) : undefined,
            deduplicationScope: config.FifoQueue === "true" ? config.DeduplicationScope : undefined,
            delaySeconds: config.DelaySeconds !== undefined ? Number(config.DelaySeconds) : undefined,
            fifoQueue: config.FifoQueue === "true" ? true : undefined,
            fifoThroughputLimit: config.FifoQueue === "true" ? config.FifoThroughputLimit : undefined,
            kmsDataKeyReusePeriodSeconds: config.KmsDataKeyReusePeriodSeconds !== undefined ? Number(config.KmsDataKeyReusePeriodSeconds) : undefined,
            kmsMasterKeyId: config.KmsMasterKeyId !== undefined ? (0, cache_1.getResource)("kms", config.KmsMasterKeyId).getId() : undefined,
            maximumMessageSize: config.MaximumMessageSize !== undefined ? Number(config.MaximumMessageSize) : undefined,
            messageRetentionPeriod: config.MessageRetentionPeriod !== undefined ? Number(config.MessageRetentionPeriod) : undefined,
            queueName: queueName,
            receiveMessageWaitTimeSeconds: config.ReceiveMessageWaitTimeSeconds !== undefined ? Number(config.ReceiveMessageWaitTimeSeconds) : undefined,
            visibilityTimeout: config.VisibilityTimeout !== undefined ? Number(config.VisibilityTimeout) : undefined
        };
        // Create the queue
        this._queue = new aws_cdk_lib_1.aws_sqs.CfnQueue(this._scope, (0, util_1.createId)(JSON.stringify(props)), props);
    }
    /**
     * Get an arn for queue
     * @returns arn for queue
     */
    getArn() {
        return this._queue.attrArn;
    }
    /**
     * Get a name for queue
     * @returns name for queue
     */
    getName() {
        return this._queue.attrQueueName;
    }
    /**
     * Get an url for queue
     * @returns url for queue
     */
    getUrl() {
        return this._queue.ref;
    }
    /**
     * Set the policy
     * @param config configuration for policy
     */
    setPolicy(config) {
        // Set the statement
        const statement = config.Statement.map((elem) => {
            // Extract principal by type
            const principal = elem.Principal !== undefined ? (0, util_1.extractPrincipal)(elem.Principal) : undefined;
            // Return
            return {
                Effect: elem.Effect,
                Principal: principal,
                Action: elem.Action,
                Resource: this._queue.attrArn
            };
        });
        // Create the properties for queue policy
        const props = {
            policyDocument: {
                Version: config.Version,
                Statement: statement.length > 0 ? statement : undefined
            },
            queues: [this._queue.ref]
        };
        // Set the policy for queue
        new aws_cdk_lib_1.aws_sqs.CfnQueuePolicy(this._scope, (0, util_1.createId)(JSON.stringify(props)), props);
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
            this._queue.addPropertyOverride("Tags", tags);
        }
    }
}
exports.Queue = Queue;
