import { Construct } from "constructs";
import { aws_sns as sns } from "aws-cdk-lib";
// Util
import { createId, extractDataFromArn, extractTags } from "../../utils/util";

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
    // Extract a topic name from arn
    const topicName: string = extractDataFromArn(config.TopicArn, "resource");
    // Set the properties for topic
    const props: sns.CfnTopicProps = {
      contentBasedDeduplication: config.FifoTopic ? config.ContentBasedDeduplication : undefined,
      displayName: config.DisplayName,
      fifoTopic: config.FifoTopic ? JSON.parse(config.FifoTopic) : undefined,
      topicName: topicName
    };
    // Create the topic
    this._topic = new sns.CfnTopic(this._scope, createId(JSON.stringify(props)), props);
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

  /**
   * Set the tags
   * @param config configuration for tags
   */
  public setTags(config: any) {
    // Create a list of tag
    const tags = extractTags(config);
    // Set the tags
    if (tags.length > 0) {
      this._topic.addPropertyOverride("Tags", tags);
    }
  }
}