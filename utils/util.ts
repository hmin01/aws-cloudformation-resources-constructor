import { createHash } from "crypto";
import { CfnTag } from "aws-cdk-lib";

/**
 * Create the logical id for resource to be used aws cdk
 * @param content content to create hash value
 * @returns created id
 */
export function createId(content: string): string {
  return createHash("sha256").update(content).digest("hex");
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