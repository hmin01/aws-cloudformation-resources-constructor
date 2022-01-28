"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQueues = void 0;
// Resources
const sqs_1 = require("../resources/sqs");
// Util
const cache_1 = require("../utils/cache");
const util_1 = require("../utils/util");
/**
 * Create the queues
 * @param scope scope context
 * @param config configuration for queues
 */
function createQueues(scope, config) {
    for (const queueArn of Object.keys(config)) {
        // Extract a name from arn
        const queueName = (0, util_1.extractDataFromArn)(queueArn, "resource");
        // Get a configuration for queue
        const elem = config[queueArn];
        // Create a queue
        const queue = new sqs_1.Queue(scope, elem.Attributes);
        // Store the resource
        (0, cache_1.storeResource)("sqs", queueName, queue);
        // Set the tags
        if (elem.Tags !== undefined && elem.Tags !== null && Object.keys(elem.Tags).length > 0) {
            queue.setTags(elem.Tags);
        }
        // Set a policy
        if (elem.PolicyObject !== undefined && elem.PolicyObject !== null && Object.keys(elem.PolicyOjbect).length > 0) {
            queue.setPolicy(elem.PolicyOjbect);
        }
    }
}
exports.createQueues = createQueues;
