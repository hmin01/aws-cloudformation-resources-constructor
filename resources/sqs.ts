import { Construct } from "constructs";
import { aws_sqs as sqs } from "aws-cdk-lib";
// Util
import { getResource, storeResource } from "../utils/cache";
import { createId, extractDataFromArn, extractPrincipal, extractTags } from "../utils/util";

export class Queue {
  private _scope: Construct;
  private _queue: sqs.CfnQueue;

  /**
   * Create the sqs queue
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-properties-sqs-queues.html
   * @param scope scope context
   * @param config configuration for queue
   */
  constructor(scope: Construct, config: any) {
    this._scope = scope;
    // Extract the queue name from arn
    const queueName: string = extractDataFromArn(config.QueueArn, "resource");
    // Set the properties for queue
    const props: sqs.CfnQueueProps = {
      contentBasedDeduplication: config.FifoQueue === "true" ? config.ContentBasedDeduplication : undefined,
      deduplicationScope: config.FifoQueue === "true" ? config.DeduplicationScope : undefined,
      delaySeconds: config.DelaySeconds !== undefined ? Number(config.DelaySeconds) : undefined,
      fifoQueue: config.FifoQueue === "true" ? true : undefined,
      fifoThroughputLimit: config.FifoQueue === "true" ? config.FifoThroughputLimit : undefined,
      kmsDataKeyReusePeriodSeconds: config.KmsDataKeyReusePeriodSeconds !== undefined ? Number(config.KmsDataKeyReusePeriodSeconds) : undefined,
      kmsMasterKeyId: config.KmsMasterKeyId !== undefined ? getResource("kms", config.KmsMasterKeyId) : undefined,
      maximumMessageSize: config.MaximumMessageSize !== undefined ? Number(config.MaximumMessageSize) : undefined,
      messageRetentionPeriod: config.MessageRetentionPeriod !== undefined ? Number(config.MessageRetentionPeriod) : undefined,
      queueName: queueName,
      receiveMessageWaitTimeSeconds: config.ReceiveMessageWaitTimeSeconds !== undefined ? Number(config.ReceiveMessageWaitTimeSeconds) : undefined,
      visibilityTimeout: config.VisibilityTimeout !== undefined ? Number(config.VisibilityTimeout) : undefined
    };
    // Create the queue
    this._queue = new sqs.CfnQueue(this._scope, createId(JSON.stringify(props)), props);
    // Store the resource
    storeResource("sqs", queueName, this._queue);
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
   * @param config configuration for policy
   */
  public setPolicy(config: any) {
    // Set the statement
    const statement: any[] = config.Statement.map((elem: any): any => {
      // Extract principal by type
      const principal: any = elem.Principal !== undefined ? extractPrincipal(elem.Principal) : undefined;
      // Return
      return {
        Effect: elem.Effect,
        Principal: principal,
        Action: elem.Action,
        Resource: this._queue.attrArn
      };
    });

    // Create the properties for queue policy
    const props: sqs.CfnQueuePolicyProps = {
      policyDocument: {
        Version: config.Version,
        Statement: statement.length > 0 ? statement : undefined
      },
      queues: [this._queue.ref]
    }
    // Set the policy for queue
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
    this._queue.addPropertyOverride("Tags", tags);
  }
}