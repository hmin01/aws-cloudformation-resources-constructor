import { createHash } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";
import { CfnTag } from "aws-cdk-lib";

const CONFIG_DIR: string = join(__dirname, "../configs");

/**
 * Change the part about AWS arn
 * @param arn arn for resource
 * @param type part type
 * @param content content
 * @returns changed arn
 */
export function changePartaboutArn(arn: string, type: string, content: string): string {
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
      if (service === "dynamodb") {
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
        return split[7] !== undefined ? split[7] : arn;
      } else {
        return arn;
      }
    default:
      return arn;
  }
}

/**
 * Extract the principal from raw scope data
 * @param principalConfig configuration for principal
 * @returns extracted and modified principal
 */
export function extractPrincipal(principalConfig: any): any {
  const result: any = {};
  if (process.env !== undefined && process.env.ACCOUNT !== undefined && process.env.ORIGIN_ACCOUT) {
    // Set the default pattern for arn and accountId
    const accountIdPattern = new RegExp("^[0-9]{12}$");
    // Extract the principal
    for (const key of Object.keys(principalConfig)) {
      if (key === "AWS") {
        if (Object.prototype.toString.call(principalConfig[key]) === "Array") {
          // Set result
          result[key] = [];
          // Extract
          for (const elem of principalConfig[key]) {
            if (checkAwsArnPattern(elem)) {
              const account: string = extractDataFromArn(elem, "account");
              if (account === process.env.ORIGIN_ACCOUNT) {
                result[key].push(changePartaboutArn(elem, "account", process.env.ACCOUNT));
              } else {
                result[key].push(elem);
              }
            } else {
              if (accountIdPattern.test(elem)) {
                if (elem === process.env.ORIGIN_ACCOUNT) {
                  result[key] = process.env.ACCOUNT;
                } else {
                  result[key] = elem;
                }
              } else {
                result[key] = elem;
              }
            }
          }
        } else {
          if (checkAwsArnPattern(principalConfig[key])) {
            const account: string = extractDataFromArn(principalConfig[key], "account");
            if (account === process.env.ORIGIN_ACCOUNT) {
              result[key] = changePartaboutArn(principalConfig[key], "account", process.env.ACCOUNT);
            } else {
              result[key] === principalConfig[key];
            }
          } else {
            if (accountIdPattern.test(principalConfig[key])) {
              if (principalConfig[key] === process.env.ORIGIN_ACCOUNT) {
                result[key] = process.env.ACCOUNT;
              } else {
                result[key] = principalConfig[key];
              }
            } else {
              result[key] = principalConfig[key];
            }
          }
        }
      } else {
        result[key] = principalConfig[key];
      }
    }
  } else {
    console.error("[ERROR] Environmental variables are not set");
    process.exit(1);
  }
  // Return
  return result;
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
 * Load a json data (configuration)
 * @param filename file name
 * @returns loaded data
 */
export function loadJsonFile(filename: string) {
  try {
    // Create file path
    const filePath: string = join(CONFIG_DIR, `${filename}.json`);
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