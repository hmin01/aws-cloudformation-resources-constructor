import { Construct } from "constructs";
import { aws_sns as sns } from "aws-cdk-lib";
// Util
import { getResource, storeResource } from "../utils/cache";
import { createId, extractTags } from "../utils/util";

export class Topic {
  private _topic: sns.CfnTopic;
  private _scope: Construct;

  /**
   * Create the sns topic
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-sns-topic.html
   * @param scope scope context
   * @param config configuration for sns topic
   */
  constructor(scope: Construct, config: any) {
    this._scope = scope;

    // Set a list of tag
    const tags = extractTags(config.Tags);
    // Extract configuration for function
    const attributes: any = config.Attributes;
    // Get an arn for kms
    const kmsKey: any = getResource("kms", attributes.KmsMasterKeyId);

    // Set the properties for topic
    const props: sns.CfnTopicProps = {
      contentBasedDeduplication: attributes.FifoTopic !== undefined ? attributes.ContentBasedDeduplication : undefined,
      displayName: attributes.DisplayName,
      fifoTopic: attributes.FifoTopic !== undefined ? attributes.FifoTopic : undefined,
      kmsMasterKeyId: kmsKey !== undefined ? kmsKey.getId() : undefined,
      tags: tags.length > 0 ? tags : undefined,
      topicName: this.extractName(attributes.TopicArn)
    };
    // Create the topic
    this._topic = new sns.CfnTopic(this._scope, createId(JSON.stringify(props)), props);
  }

  /**
   * Extract a name from arn for topic
   * @param arn arn for topic
   * @returns name for topic
   */
  private extractName(arn: string): string {
    // Split an arn for queue
    const split: string[] = arn.split(":");
    // Extract a queue name from arn
    return split[split.length - 1];
  }

  /**
   * Get an arn for topic
   * @returns arn for topic
   */
  public getArn(): string {
    return this._topic.ref;
  }

  /**
   * Get a name for topic
   * @returns name for topic
   */
  public getName(): string {
    return this._topic.attrTopicName;
  }

  /**
   * Get a ref for topic
   * @returns ref for topic
   */
  public getRef(): string {
    return this._topic.ref;
  }
}