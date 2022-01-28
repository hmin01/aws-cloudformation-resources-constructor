import { Construct } from "constructs";
// Resources
import { Queue } from "../resources/sqs";
// Util
import { storeResource } from "../utils/cache";
import { extractDataFromArn } from "../utils/util";

/**
 * Create the queues
 * @param scope scope context
 * @param config configuration for queues
 */
export function createQueues(scope: Construct, config: any) {
  for (const queueArn of Object.keys(config)) {
    // Extract a name from arn
    const queueName: string = extractDataFromArn(queueArn, "resource");
    // Get a configuration for queue
    const elem: any = config[queueArn];
    // Create a queue
    const queue: Queue = new Queue(scope, elem.Attributes);
    // Store the resource
    storeResource("sqs", queueName, queue);

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