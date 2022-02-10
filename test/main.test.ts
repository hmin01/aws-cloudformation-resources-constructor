import { App } from "aws-cdk-lib";
// Services
import * as stack from "./stack.test";

describe("Construct test", () => {
  const t = "test3";
  // Create the app for test
  const app: App = new App();

  test("APIGateway Created", () => {
    new stack.APIGatewayStack(app, "APIGatewayStack", {});
  });

  // test("CloudFront Created", () => {
  //   new stack.CloudFrontStack(app, "CloudFrontStack", {});
  // });

  test("Cognito Created", () => {
    new stack.CognitoStack(app, "CognitoStack", {});
  });

  test("DynamoDB Created", () => {
    new stack.DynamoDBStack(app, "DynamoDBStack", {});
  });

  test("IAM Created", () => {
    new stack.IAMStack(app, "IAMStack", {});
  });

  test("Lambda Created", () => {
    new stack.LambdaStack(app, "LambdaStack", {});
  });

  test("SNS Created", () => {
    new stack.SNSStack(app, "SNSStack", {});
  });

  test("SQS Created", () => {
    new stack.SQSStack(app, "SQSStack", {});
  });
});