"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchError = exports.CODE = void 0;
exports.CODE = {
    ERROR: {
        COMMON: {
            INVALIED_ENV: 1,
            NOT_FOUND_ID: 2,
            NOT_FOUND_NAME: 3
        },
        // For Amazon STS
        STS: {
            ASSUME_ROLE: 10
        },
        // For Amazon APIGateway
        APIGATEWAY: {
            RESTAPI: {
                CREATE_AUTHORIZER: 20,
                CREATE_DEPLOYMENT: 21,
                CREATE_STAGE: 22,
                GET_AUTHORIZER_ID: 23,
                GET_RESOURCE_ID: 24,
                GET_RESTAPI_ID: 25,
                PUT_METHOD_INTEGRATION: 26,
                PUT_METHOD_INTEGRATION_RESPONSES: 27,
                PUT_METHOD_RESPONSES: 28,
            }
        },
        // For Amazon Cognito
        COGNITO: {
            USERPOOL: {
                CREATE_CLIENT: 40,
                CREATE_DOMAIN: 41,
                GET_ARN: 42,
                GET_NAME: 43,
                GET_ID: 44,
                GET_CLIENT_ID: 45,
                SET_MFA_CONFIG: 46,
                SET_UI_CUSTOM: 47,
                SET_EMAIL_CONFIG: 48,
                SET_LAMBDA_CONFIG: 49
            }
        },
        // For Amazon DynamoDB
        DYNAMODB: {
            TABLE: {
                GET_ARN: 60,
            }
        },
        // For AWS Lambda
        LAMBDA: {
            FUNCTION: {
                CREATE_ALIAS: 80,
                CREATE_EVENT_SOURCE_MAPPING: 81,
                GET_ALIAS: 82,
                GET_ARN: 83,
                GET_EVENT_SOURCE_MAPPINGS: 84,
                PUBLISH_VERSION: 85,
                UPDATE_CODE: 86,
                UPDATE_EVENT_SOURCE_MAPPING: 87
            }
        },
        // For Amazon S3
        S3: {
            OBJECT: {
                GET_ITEM: 100,
            }
        },
        // For Amazon SQS
        SQS: {
            QUEUE: {
                GET_ARN: 120,
                GET_URL: 121
            }
        }
    }
};
const MESSAGE = {
    1: "Failed to set environmental variables",
    2: "Not found a target id",
    3: "Not found a target name",
    10: "Failed to assume a role",
    20: "Failed to create an apigateway authorizer",
    21: "Failed to create an apigateway deployment",
    22: "Failed to create an apigateway stage",
    23: "Failed to get an apigateway authorizer id",
    24: "Failed to get an apigateway resource id",
    25: "Failed to get an apigateway rest api id",
    26: "Failed to put an aptgateway method integration",
    27: "Failed to put an aptgateway method integration responses",
    28: "Failed to put an aptgateway method responses",
    40: "Failed to create a cognito user pool client",
    41: "Failed to create a cognito user pool domain",
    42: "Failed to get a cognito user pool arn",
    43: "Failed to get a cognito user pool name",
    44: "Failed to get a cognito user pool id",
    45: "Failed to get a cognito user pool client id",
    46: "Failed to set a MFA configuration for cognito user pool",
    47: "Failed to set an UI customization for cognito user pool client",
    48: "Failed to set an email configuration for cognito user pool",
    49: "Failed to set a lambda configuration for cognito user pool",
    60: "Failed to get a dynamodb table arn",
    80: "Failed to create a lambda function alias",
    81: "Failed to create a lambda event source mapping",
    82: "Failed to get a lambda function alias",
    83: "Failed to get a lambda function arn",
    84: "Failed to get a list of lambda event source mapping",
    85: "Failed to publish a lambda function version",
    86: "Failed to update a lambda function code",
    87: "Failed to update an event source mapping",
    100: "Failed to get a s3 object",
    120: "Failed to get a sqs queue arn",
    121: "Failed to get a sqs queue url"
};
/**
 * Catch an error
 * @param code error code
 * @param isExit Whether the process is terminated or not
 * @param target target
 * @param err err object
 * @returns blank string
 */
function catchError(code, isExit, target, err) {
    // Print error message
    if (MESSAGE[code]) {
        // Create a error message format
        let message = `[ERROR] ${MESSAGE[code]}`;
        if (target)
            message += ` (target: ${target})`;
        if (err)
            message += `\n-> ${err.name}: ${err.message}`;
        // Print a message
        console.error(message);
    }
    // Exist
    if (isExit) {
        process.exit(code);
    }
    // Return
    return "";
}
exports.catchError = catchError;
