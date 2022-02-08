"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
// Util
const cache_1 = require("../../utils/cache");
const util_1 = require("../../utils/util");
class Table {
    /**
     * Create the dynamodb table
     * @description https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-dynamodb-table.html
     * @param scope scope context
     * @param config configuration for table
     */
    constructor(scope, config) {
        this._scope = scope;
        // Extract a list of tag
        const tags = config.Tags !== undefined && config.Tags !== null ? (0, util_1.extractTags)(config.Tags) : [];
        // Create the properties for table
        const props = {
            keySchema: config.KeySchema !== undefined ? config.KeySchema.map((elem) => { return { attributeName: elem.AttributeName, keyType: elem.KeyType }; }) : undefined,
            // Optional
            attributeDefinitions: config.AttributeDefinitions !== undefined && config.AttributeDefinitions !== null ? config.AttributeDefinitions.map((elem) => { return { attributeName: elem.AttributeName, attributeType: elem.AttributeType }; }) : undefined,
            billingMode: config.BillingModeSummary !== undefined && config.BillingModeSummary !== null ? config.BillingModeSummary.BillingMode : undefined,
            globalSecondaryIndexes: config.GlobalSecondaryIndexes !== undefined && config.GlobalSecondaryIndexes !== null ? config.GlobalSecondaryIndexes.map((elem) => {
                return {
                    indexName: elem.IndexName,
                    keySchema: elem.KeySchema !== undefined ? elem.KeySchema.map((item) => { return { attributeName: item.AttributeName, keyType: item.KeyType }; }) : undefined,
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
                streamArn: (0, cache_1.getResource)("kinesis", config.KinesisStreamSpecification.StreamArn).getArn()
            } : undefined,
            localSecondaryIndexes: config.LocalSecondaryIndexes !== undefined && config.LocalSecondaryIndexes !== null ? config.LocalSecondaryIndexes.map((elem) => {
                return {
                    indexName: elem.IndexName,
                    keySchema: elem.KeySchema.map((item) => { return { attributeName: item.AttributeName, keyType: item.KeyType }; }),
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
                kmsMasterKeyId: (0, cache_1.getResource)("kms", config.SSESpecification.KmsMasterKeyId).getId(),
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
        this._table = new aws_cdk_lib_1.aws_dynamodb.CfnTable(this._scope, (0, util_1.createId)(JSON.stringify(props)), props);
    }
    /**
     * Get an arn for table
     * @returns arn for table
     */
    getArn() {
        return this._table.attrArn;
    }
    /**
     * Get a name for table
     * @returns name for table
     */
    getName() {
        return this._table.ref;
    }
    /**
     * Get an arn for stream
     * @returns arn for stream
     */
    getStreamArn() {
        return this._table.attrStreamArn;
    }
    /**
     * Set the tags
     * @param config configuration for tags
     */
    setTags(config) {
        // Create a list of tag
        const tags = (0, util_1.extractTags)(config);
        // Set the tags
        if (tags.length > 0) {
            this._table.addPropertyOverride("Tags", tags);
        }
    }
}
exports.Table = Table;
