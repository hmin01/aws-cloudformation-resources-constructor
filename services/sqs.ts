import { Construct } from "constructs";
// Resources
import { Queue } from "../resources/sqs";

/**
 * Create the queues
 * @param scope scope context
 * @param config configuration for queues
 */
export function createQueues(scope: Construct, config: any) {
  for (const queueName of Object.keys(config)) {
    // Get a configuration for queue
    const elem: any = config[queueName];
    // Create a queue
    const queue = new Queue(scope, elem.Attributes);

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