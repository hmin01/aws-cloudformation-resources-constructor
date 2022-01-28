"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTopics = void 0;
// Resources
const sns_1 = require("../resources/sns");
// Util
const cache_1 = require("../utils/cache");
const util_1 = require("../utils/util");
/**
 * Create the topics
 * @param scope scope context
 * @param config configuration for topics
 */
function createTopics(scope, config) {
    for (const topicArn of Object.keys(config)) {
        // Extract a name from arn
        const topicName = (0, util_1.extractDataFromArn)(topicArn, "resource");
        // Get a configuration for topic
        const elem = config[topicArn];
        // Create a topic
        const topic = new sns_1.Topic(scope, elem.Attributes);
        // Store the resource
        (0, cache_1.storeResource)("sns", topicName, topic);
        // Set the tags
        if (elem.Tags !== undefined && elem.Tags !== null && Object.keys(elem.Tags).length > 0) {
            topic.setTags(elem.Tags);
        }
    }
}
exports.createTopics = createTopics;
