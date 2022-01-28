import { Construct } from "constructs";
import { aws_dynamodb as dynamodb } from "aws-cdk-lib";
// Util
import { getResource } from "../utils/cache";
import { createId, extractTags } from "../utils/util";

export class Table {
  private _table: dynamodb.CfnTable;
  private _scope: Construct;

  /**
   * Create the dynamodb table
   * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-dynamodb-table.html
   * @param scope scope context
   * @param config configuration for table
   */
  constructor(scope: Construct, config: any) {
    this._scope = scope;
    // Extract a list of tag
    const tags: any[] = config.Tags !== undefined && config.Tags !== null ? extractTags(config.Tags) : [];
    // Create the properties for table
    const props: dynamodb.CfnTableProps = {
      keySchema: config.KeySchema !== undefined ? config.KeySchema.map((elem: any): dynamodb.CfnTable.KeySchemaProperty => { return { attributeName: elem.AttributeName, keyType: elem.KeyType }; }) : undefined,
      // Optional
      attributeDefinitions: config.AttributeDefinitions !== undefined && config.AttributeDefinitions !== null ? config.AttributeDefinitions.map((elem: any): dynamodb.CfnTable.AttributeDefinitionProperty => { return { attributeName: elem.AttributeName, attributeType: elem.AttributeType }; }) : undefined,
      billingMode: config.BillingModeSummary !== undefined && config.BillingModeSummary !== null ? config.BillingModeSummary.BillingMode : undefined,
      globalSecondaryIndexes: config.GlobalSecondaryIndexes !== undefined && config.GlobalSecondaryIndexes !== null ? config.GlobalSecondaryIndexes.map((elem: any): dynamodb.CfnTable.GlobalSecondaryIndexProperty => {
        return {
          indexName: elem.IndexName,
          keySchema: elem.KeySchema !== undefined ? elem.KeySchema.map((item: any): dynamodb.CfnTable.KeySchemaProperty => { return { attributeName: item.AttributeName, keyType: item.KeyType }; }) : undefined,
          projection: {
            nonKeyAttributes: elem.Projection.NonKeyAttributes,
            projectionType: elem.Projection.ProjectionType
          },
          // Optional
          contributorInsightsSpecification: elem.ContributorInsightsSpecification !== undefined ? {
            enabled: elem.ContributorInsightsSpecification.Enabled
          } : undefined,
          provisionedThroughput: elem.ProvisionedThroughput !== undefined ? {
            readCapacityUnits: Number(elem.ProvisionedThroughput.ReadCapacityUnits),
            writeCapacityUnits: Number(elem.ProvisionedThroughput.WriteCapacityUnits)
          } : undefined
        };
      }) : undefined,
      kinesisStreamSpecification: config.KinesisStreamSpecification !== undefined && config.KinesisStreamSpecification !== null ? {
        streamArn: getResource("kinesis", config.KinesisStreamSpecification.StreamArn).getArn()
      } : undefined,
      localSecondaryIndexes: config.LocalSecondaryIndexes !== undefined && config.LocalSecondaryIndexes !== null ? config.LocalSecondaryIndexes.map((elem: any): dynamodb.CfnTable.LocalSecondaryIndexProperty => {
        return {
          indexName: elem.IndexName,
          keySchema: elem.KeySchema.map((item: any): dynamodb.CfnTable.KeySchemaProperty => { return { attributeName: item.AttributeName, keyType: item.KeyType }; }),
          projection: {
            nonKeyAttributes: elem.Projection.NonKeyAttributes,
            projectionType: elem.Projection.ProjectionType
          },
        };
      }) : undefined,
      pointInTimeRecoverySpecification: config.PointInTimeRecoverySpecification !== undefined && config.PointInTimeRecoverySpecification !== null ? {
        pointInTimeRecoveryEnabled: config.PointInTimeRecoverySpecification.PointInTimeRecoveryEnabled
      } : undefined,
      provisionedThroughput: config.ProvisionedThroughput !== undefined && config.ProvisionedThroughput !== null ? {
        readCapacityUnits: config.ProvisionedThroughput.ReadCapacityUnits,
        writeCapacityUnits: config.ProvisionedThroughput.WriteCapacityUnits
      } : undefined,
      sseSpecification: config.SSESpecification !== undefined && config.SSESpecification !== null ? {
        kmsMasterKeyId: getResource("kms", config.SSESpecification.KmsMasterKeyId).getId(),
        sseEnabled: config.SSESpecification.SSEEnabled,
        sseType: config.SSESpecification.SSEType
      } : undefined,
      streamSpecification: config.StreamSpecification !== undefined && config.StreamSpecification !== null ? {
        streamViewType: config.StreamSpecification.StreamViewType
      } : undefined,
      tableClass: config.TableClass,
      tableName: config.TableName,
      tags: tags.length > 0 ? tags : undefined,
      timeToLiveSpecification: config.TimeToLiveSpecification !== undefined && config.TimeToLiveSpecification !== null ? {
        attributeName: config.TimeToLiveSpecification.AttributeName,
        enabled: config.TimeToLiveSpecification.Enabled
      } : undefined,
    };
    // Create the table
    this._table = new dynamodb.CfnTable(this._scope, createId(JSON.stringify(props)), props);
  }

  /**
   * Get an arn for table
   * @returns arn for table
   */
  public getArn(): string {
    return this._table.attrArn;
  }

  /**
   * Get a name for table
   * @returns name for table
   */
  public getName(): string {
    return this._table.ref;
  }

  /**
   * Get an arn for stream
   * @returns arn for stream
   */
  public getStreamArn(): string {
    return this._table.attrStreamArn;
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
      this._table.addPropertyOverride("Tags", tags);
    }
  }
}