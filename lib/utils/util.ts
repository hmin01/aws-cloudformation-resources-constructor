import { createHash } from "crypto";
import { readFileSync } from "fs";
import { Readable } from "stream";
import { CfnTag } from "aws-cdk-lib";
// Response
import { CODE, catchError } from "../models/response";

/**
 * Change the part for aws arn
 * @param arn arn for resource
 * @param type part type
 * @param content content
 * @returns changed arn
 */
export function changePartForArn(arn: string, type: string, content: string): string {
  // Split the arn
  const split: string[] = arn.split(":");
  // Return by output type
  switch (type) {
    case "partition":
      split[1] = content;
      break;
    case "service":
      split[2] = content;
      break;
    case "region":
      split[3] = content;
      break;
    case "account":
      split[4] = content;
      break;
    case "resource":
      split[5] = content;
      break;
    default:
      break;
  }
  // Join to array
  return split.join(":");
}

/**
 * Create the logical id for resource to be used aws cdk
 * @param content content to create hash value
 * @returns created id
 */
export function createId(content: string): string {
  return `TOV${createHash("sha256").update(content).digest("hex")}`;
}

/**
 * Check if it matches the arn format.
 * @param target the target of comparison
 * @returns comparsion result
 */
export function checkAwsArnPattern(target: string): boolean {
  // Set the regex for arn pattern
  const arnPattern = new RegExp("^arn:([^:\n]*):([^:\n]*):([^:\n]*):([^:\n]*):(([^:\/\n]*)[:\/])?(.*)$");
  // Check pattern
  return arnPattern.test(target);
}

/**
 * Delay process
 * @param ms delay time
 * @returns none
 */
export async function delay(ms: number): Promise<unknown> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extract the data from arn
 * @description https://docs.aws.amazon.com/ko_kr/general/latest/gr/aws-arns-and-namespaces.html
 * @param arn arn for resource
 * @param type output type [partition|service|region|accout|resource]
 * @returns output data
 */
export function extractDataFromArn(arn: string, type: string): string {
  // Split the arn
  const split: string[] = arn.split(":");
  const service: string = split[2];
  // Return by output type
  switch (type) {
    case "partition":
      return split[1];
    case "service":
      return split[2];
    case "region":
      return split[3];
    case "account":
      return split[4];
    case "resource":
      if (service === "cognito-idp" || service === "dynamodb") {
        const temp: string[] = split[5].split("/");
        return temp[1];
      } else if (service === "iam") {
        const temp: string[] = split[5].split("/");
        return temp.length > 1 ? temp[temp.length - 1] : split[5];
      } else if (service === "lambda") {
        return split[6];
      } else {
        return split[5];
      }
    case "qualifier":
      if (service === "lambda") {
        return split[7] !== undefined ? split[7] : "";
      } else {
        return "";
      }
    default:
      return "";
  }
}

/**
 * Extract a list of tag based on input data
 * @param tags content of tags
 * @returns a list of tag
 */
export function extractTags(tags: unknown): CfnTag[] {
  // Check the input parameter type
  const type: string = Object.prototype.toString.call(tags);
  // 
  if (type === "Object") {
    return Object.entries(tags as any).map((elem: any) => { return { key: elem.key, value: elem.value }; });
  } else if (type === "Array") {
    return (tags as any).map((elem: any) => {
      return {
        key: elem.Key !== undefined ? elem.Key : elem.key,
        vallue: elem.Value !== undefined ? elem.Value : elem.value
      };
    });
  } else {
    return [];
  }
}

/**
 * Initial setting
 * @param envPath environment file path
 */
export function initialSetting(envPath: string): void {
  // Load a configuration data
  const env: any = loadJsonFile(envPath);
  // Set the environment various
  process.env.ASSUME_ROLE_ARN = env.ASSUME_ROLE_ARN;
  process.env.ORIGIN_ACCOUNT = env.ORIGIN_ACCOUNT;
  process.env.ORIGIN_REGION = env.ORIGIN_REGION;
  process.env.TARGET_ACCOUNT = env.TARGET_ACCOUNT;
  process.env.TARGET_REGION = env.TARGET_REGION;
  // Catch error
  if (!process.env.ORIGIN_ACCOUNT || !process.env.ORIGIN_REGION || !process.env.TARGET_ACCOUNT || !process.env.TARGET_REGION) {
    catchError(CODE.ERROR.COMMON.INVALIED_ENV, true);
  }
}

/**
 * Load a json data (configuration)
 * @param filePath file path
 * @returns loaded data
 */
export function loadJsonFile(filePath: string) {
  try {
    // Read a file ata
    const data = readFileSync(filePath).toString();
    // Transform to json and return data
    return JSON.parse(data);
  } catch (err) {
    // Print error message
    if (typeof err === "string" || err instanceof Error) {
      console.error(`[ERROR] ${err}`);
    }
    // Exit
    process.exit(1);
  }
}

/**
 * Stream to string
 * @param steam readable stream
 * @returns converted string
 */
export async function streamToBuffer(steam: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    steam.on("data", chunk => chunks.push(chunk));
    steam.on("error", err => reject(err));
    steam.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

/**
 * Set a principal content in policy
 * @param value principal content
 * @returns changed content
 */
function _setPrincipal(value: string): string {
  // Set a default pattern for account number
  const accountNumberPattern: RegExp = new RegExp("^[0-9]{12}");
  // Check a value format (if it match a format for aws arn)
  if (checkAwsArnPattern(value)) {
    // Extract an account number and service type from arn
    const account: string = extractDataFromArn(value, "account");
    // Change an account number in arn
    if (account === process.env.ORIGIN_ACCOUNT) {
      return changePartForArn(value, "account", process.env.TARGET_ACCOUNT as string);
    } else {
      return value;
    }
  } else if (accountNumberPattern.test(value)) {  // if it match a format for aws account number
    if (value === process.env.ORIGIN_ACCOUNT) {
      return process.env.TARGET_ACCOUNT as string;
    } else {
      return value;
    }
  } else {
    return value;
  }
}
/**
 * Set a principal content
 * @param principal principal content
 * @returns changed content
 */
export function setPrincipal(principal: any): any {
  try {
    const result: any = {};
    // Process
    for (const key of Object.keys(principal)) {
      // Extract a value by key
      const value: any = principal[key];
      // Anaysis a principal
      if (key === "AWS" || key === "Faderated") {
        // If value type is array
        if (Object.prototype.toString.call(value) === "Array") {
          result[key] = value.map((elem: string): string => _setPrincipal(elem));
        } else {  // value type is string
          result[key] = _setPrincipal(value);
        }
      } else {  // "CanonicalUser" or "Service"
        // If value type is array
        if (Object.prototype.toString.call(value) === "Array") {
          result[key] = value.map((elem: string): string => elem);
        } else {  // value type is string
          result[key] = value;
        }
      }
    }
    // Return
    return result;
  } catch (err) {
    console.error(`[ERROR] Failed to set the principals in policy\n-> ${err}`);
    process.exit(1);
  }
}