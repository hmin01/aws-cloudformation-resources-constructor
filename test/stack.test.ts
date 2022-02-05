import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { join } from "path";
// Services
import * as srv from "../lib/index";

// Load a input data
const rawConfig: any = srv.loadJsonFile(join(__dirname, "./testInput.json"));

/** For APIGateway */
export class APIGatewayStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Extract the configuration for APIGateway
    const config: any = rawConfig.ApiGateWay !== undefined && rawConfig.ApiGateWay.RestApis !== undefined && rawConfig.ApiGateWay.RestApis.length > 0 ? rawConfig.ApiGateWay.RestApis : undefined;
    // Test
    if (config !== undefined) {
      srv.createRestApi(this, config);
    } else {
      console.info("Not found the configuration for APIGateway")
    }
  }
}

/** For CloudFront */
export class CloudFrontStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Extract the configuration for CloudFront
    const config: any = rawConfig.CloudFront !== undefined && Object.keys(rawConfig.CloudFront).length > 0 ? rawConfig.CloudFront : undefined;
    // Test
    if (config !== undefined) {
      srv.createCloudFrontPolicies(this, config.Policies);
      srv.createCloudFrontDistributions(this, config.Distributions);
    } else {
      console.info("Not found the configuration for CloudFront")
    }
  }
}

/** For Cognito */
export class CognitoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Extract the configuration for Cognito
    const config: any = rawConfig.CognitoUserPool !== undefined && Object.keys(rawConfig.CognitoUserPool).length > 0 ? rawConfig.CognitoUserPool : undefined;
    // Test
    if (config !== undefined) {
      srv.createCognitoUserPool(this, config);
    } else {
      console.info("Not found the configuration for Cognito")
    }
  }
}

/** For DynamoDB */
export class DynamoDBStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Extract the configuration for DynamoDB
    const config: any = rawConfig.DynamoDB !== undefined && Object.keys(rawConfig.DynamoDB).length > 0 ? rawConfig.DynamoDB : undefined;
    // Test
    if (config !== undefined) {
      srv.createDynamoDBTables(this, config);
    } else {
      console.info("Not found the configuration for DynamoDB");
    }
  }
}

/** For IAM */
export class IAMStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Extract the configuration for IAM
    const policiesConfig: any = rawConfig.Lambda !== undefined && rawConfig.Lambda.IAMPolicies !== undefined && Object.keys(rawConfig.Lambda.IAMPolicies).length > 0 ? rawConfig.Lambda.IAMPolicies : undefined;
    const rolesConfig: any = rawConfig.Lambda !== undefined && rawConfig.Lambda.IAMRoles !== undefined && Object.keys(rawConfig.Lambda.IAMRoles).length > 0 ? rawConfig.Lambda.IAMRoles : undefined;
    // Test
    if (policiesConfig !== undefined) {
      srv.createIAMPolicies(this, policiesConfig);
      srv.createIAMRoles(this, rolesConfig);
    } else {
      console.info("Not found the configuration for IAM");
    }
  }
}

/** For Lambda */
export class LambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Extract the configuration for Lambda
    const config: any = rawConfig.Lambda !== undefined && rawConfig.Lambda.LambdaFunctions !== undefined && Object.keys(rawConfig.Lambda.LambdaFunctions).length > 0 ? rawConfig.Lambda.LambdaFunctions : undefined;
    // Test
    if (config !== undefined) {
      srv.createLambdaFunctions(this, config);
    } else {
      console.info("Not found the configuration for Lambda");
    }
  }
}

/** For SNS */
export class SNSStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Extract the configuration for SNS
    const config: any = rawConfig.SNS !== undefined && Object.keys(rawConfig.SNS).length > 0 ? rawConfig.SNS : undefined;
    // Test
    if (config !== undefined) {
      srv.createSNSTopics(this, config);
    } else {
      console.info("Not found the configuration for SNS");
    }
  }
}

/** For SQS */
export class SQSStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Extract the configuration for SQS
    const config: any = rawConfig.SQS !== undefined && Object.keys(rawConfig.SQS).length > 0 ? rawConfig.SQS : undefined;
    // Test
    if (config !== undefined) {
      srv.createSQSQueues(this, config);
    } else {
      console.info("Not found the configuration for SQS");
    }
  }
}