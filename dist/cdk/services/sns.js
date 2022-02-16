"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Topic = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
// Util
const util_1 = require("../../utils/util");
class Topic {
    /**
     * Create the sns topic
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-sns-topic.html
     * @param scope scope context
     * @param config configuration for sns topic
     */
    constructor(scope, config) {
        this._scope = scope;
        // Extract a topic name from arn
        const topicName = (0, util_1.extractDataFromArn)(config.TopicArn, "resource");
        // Set the properties for topic
        const props = {
            contentBasedDeduplication: config.FifoTopic ? config.ContentBasedDeduplication : undefined,
            displayName: config.DisplayName,
            fifoTopic: config.FifoTopic ? JSON.parse(config.FifoTopic) : undefined,
            topicName: topicName
        };
        // Create the topic
        this._topic = new aws_cdk_lib_1.aws_sns.CfnTopic(this._scope, (0, util_1.createId)(JSON.stringify(props)), props);
    }
    /**
     * Get an arn for topic
     * @returns arn for topic
     */
    getArn() {
        return this._topic.ref;
    }
    /**
     * Get a name for topic
     * @returns name for topic
     */
    getName() {
        return this._topic.attrTopicName;
    }
    /**
     * Get a ref for topic
     * @returns ref for topic
     */
    getRef() {
        return this._topic.ref;
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
            this._topic.addPropertyOverride("Tags", tags);
        }
    }
}
exports.Topic = Topic;
