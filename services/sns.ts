import { Construct } from "constructs";
// Resources
import { Topic } from "../resources/sns";
// Util
import { storeResource } from "../utils/cache";
import { extractDataFromArn } from "../utils/util";

/**
 * Create the topics
 * @param scope scope context
 * @param config configuration for topics
 */
export function createTopics(scope: Construct, config: any) {
  for (const topicArn of Object.keys(config)) {
    // Extract a name from arn
    const topicName: string = extractDataFromArn(topicArn, "resource");
    // Get a configuration for topic
    const elem: any = config[topicArn];
    // Create a topic
    const topic: Topic = new Topic(scope, elem.Attributes);
    // Store the resource
    storeResource("sns", topicName, topic);

    // Set the tags
    if (elem.Tags !== undefined && elem.Tags !== null && Object.keys(elem.Tags).length > 0) {
      topic.setTags(elem.Tags);
    }
  }
}