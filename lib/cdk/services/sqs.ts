import { Construct } from "constructs";
import { aws_sqs as sqs } from "aws-cdk-lib";
// Util
import { createId, extractDataFromArn, extractTags, setPrincipal } from "../../utils/util";

export class Queue {
  private _scope: Construct;
  private _queue: sqs.CfnQueue;

  /**
   * Create the sqs queue
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-sqs-queue.html
   * @param scope scope context
   * @param config configuration for sqs queue
   */
  constructor(scope: Construct, config: any) {
    this._scope = scope;
    // Extract the queue name from arn
    const queueName: string = extractDataFromArn(config.QueueArn, "resource");
    // Set the properties for queue
    const props: sqs.CfnQueueProps = {
      contentBasedDeduplication: config.FifoQueue === "true" && config.ContentBasedDeduplication ? JSON.parse(config.ContentBasedDeduplication) : undefined,
      deduplicationScope: config.FifoQueue === "true" ? config.DeduplicationScope : undefined,
      delaySeconds: config.DelaySeconds ? Number(config.DelaySeconds) : undefined,
      fifoQueue: config.FifoQueue === "true" ? true : undefined,
      fifoThroughputLimit: config.FifoQueue === "true" ? config.FifoThroughputLimit : undefined,
      maximumMessageSize: config.MaximumMessageSize ? Number(config.MaximumMessageSize) : undefined,
      messageRetentionPeriod: config.MessageRetentionPeriod ? Number(config.MessageRetentionPeriod) : undefined,
      queueName: queueName,
      receiveMessageWaitTimeSeconds: config.ReceiveMessageWaitTimeSeconds ? Number(config.ReceiveMessageWaitTimeSeconds) : undefined,
      visibilityTimeout: config.VisibilityTimeout ? Number(config.VisibilityTimeout) : undefined
    };
    // Create the queue
    this._queue = new sqs.CfnQueue(this._scope, createId(JSON.stringify(props)), props);
  }

  /**
   * Get an arn for queue
   * @returns arn for queue
   */
  public getArn(): string {
    return this._queue.attrArn;
  }

  /**
   * Get a name for queue
   * @returns name for queue
   */
  public getName(): string {
    return this._queue.attrQueueName;
  }

  /**
   * Get an url for queue
   * @returns url for queue
   */
  public getUrl(): string {
    return this._queue.ref;
  }

  /**
   * Set the policy
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-sqs-queuepolicy.html
   * @param config configuration for policy
   */
  public setPolicy(config: any) {
    // Create a properties for queue policy
    const props: sqs.CfnQueuePolicyProps = {
      policyDocument: {
        Version: config.Version,
        Statement: config.Statement && config.Statement.length > 0 ? config.Statement.map((elem: any) => {
          return {
            Effect: elem.Effect,
            Principal: elem.Principal ? setPrincipal(elem.Principal) : undefined,
            Action: elem.Action,
            Resource: this._queue.attrArn
          };
        }) : undefined
      },
      queues: [this._queue.ref]
    }
    // Set a policy for queue
    new sqs.CfnQueuePolicy(this._scope, createId(JSON.stringify(props)), props);
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
      this._queue.addPropertyOverride("Tags", tags);
    }
  }
}