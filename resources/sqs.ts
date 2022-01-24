import { Construct } from "constructs";
import { aws_sqs as sqs } from "aws-cdk-lib";
// Util
import { getResource, storeResource } from "../utils/cache";
import { createId } from "../utils/util";

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
    // Extract the queue name
    const queueName: string = this.extractName(config.QueueArn);
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
    this._queue = new sqs.CfnQueue(this._queue, createId(JSON.stringify(props)), props);
    // Store the resource
    storeResource("sqs", queueName, this._queue);
  }

  /**
   * Extract a name from arn for queue
   * @param arn arn for queue
   * @returns name for queue
   */
  private extractName(arn: string): string {
    // Split an arn for queue
    const split: string[] = arn.split(":");
    // Extract a queue name from arn
    return split[split.length - 1];
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
}