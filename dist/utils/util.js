"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamToBuffer = exports.loadJsonFile = exports.initialSetting = exports.extractTags = exports.extractPrincipal = exports.extractDataFromArn = exports.delay = exports.checkAwsArnPattern = exports.createId = exports.changePartaboutArn = void 0;
const crypto_1 = require("crypto");
const fs_1 = require("fs");
// Response
const response_1 = require("../models/response");
/**
 * Change the part about AWS arn
 * @param arn arn for resource
 * @param type part type
 * @param content content
 * @returns changed arn
 */
function changePartaboutArn(arn, type, content) {
    // Split the arn
    const split = arn.split(":");
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
exports.changePartaboutArn = changePartaboutArn;
/**
 * Create the logical id for resource to be used aws cdk
 * @param content content to create hash value
 * @returns created id
 */
function createId(content) {
    return `TOV${(0, crypto_1.createHash)("sha256").update(content).digest("hex")}`;
}
exports.createId = createId;
/**
 * Check if it matches the arn format.
 * @param target the target of comparison
 * @returns comparsion result
 */
function checkAwsArnPattern(target) {
    // Set the regex for arn pattern
    const arnPattern = new RegExp("^arn:([^:\n]*):([^:\n]*):([^:\n]*):([^:\n]*):(([^:\/\n]*)[:\/])?(.*)$");
    // Check pattern
    return arnPattern.test(target);
}
exports.checkAwsArnPattern = checkAwsArnPattern;
/**
 * Delay process
 * @param ms delay time
 * @returns none
 */
async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.delay = delay;
/**
 * Extract the data from arn
 * @description https://docs.aws.amazon.com/ko_kr/general/latest/gr/aws-arns-and-namespaces.html
 * @param arn arn for resource
 * @param type output type [partition|service|region|accout|resource]
 * @returns output data
 */
function extractDataFromArn(arn, type) {
    // Split the arn
    const split = arn.split(":");
    const service = split[2];
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
                const temp = split[5].split("/");
                return temp[1];
            }
            else if (service === "iam") {
                const temp = split[5].split("/");
                return temp.length > 1 ? temp[temp.length - 1] : split[5];
            }
            else if (service === "lambda") {
                return split[6];
            }
            else {
                return split[5];
            }
        case "qualifier":
            if (service === "lambda") {
                return split[7] !== undefined ? split[7] : "";
            }
            else {
                return "";
            }
        default:
            return "";
    }
}
exports.extractDataFromArn = extractDataFromArn;
/**
 * Extract the principal from raw scope data
 * @param principalConfig configuration for principal
 * @returns extracted and modified principal
 */
function extractPrincipal(principalConfig) {
    const result = {};
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
                            const account = extractDataFromArn(elem, "account");
                            if (account === process.env.ORIGIN_ACCOUNT) {
                                result[key].push(changePartaboutArn(elem, "account", process.env.ACCOUNT));
                            }
                            else {
                                result[key].push(elem);
                            }
                        }
                        else {
                            if (accountIdPattern.test(elem)) {
                                if (elem === process.env.ORIGIN_ACCOUNT) {
                                    result[key] = process.env.ACCOUNT;
                                }
                                else {
                                    result[key] = elem;
                                }
                            }
                            else {
                                result[key] = elem;
                            }
                        }
                    }
                }
                else {
                    if (checkAwsArnPattern(principalConfig[key])) {
                        const account = extractDataFromArn(principalConfig[key], "account");
                        if (account === process.env.ORIGIN_ACCOUNT) {
                            result[key] = changePartaboutArn(principalConfig[key], "account", process.env.ACCOUNT);
                        }
                        else {
                            result[key] === principalConfig[key];
                        }
                    }
                    else {
                        if (accountIdPattern.test(principalConfig[key])) {
                            if (principalConfig[key] === process.env.ORIGIN_ACCOUNT) {
                                result[key] = process.env.ACCOUNT;
                            }
                            else {
                                result[key] = principalConfig[key];
                            }
                        }
                        else {
                            result[key] = principalConfig[key];
                        }
                    }
                }
            }
            else {
                result[key] = principalConfig[key];
            }
        }
    }
    else {
        console.error("[ERROR] Environmental variables are not set");
        process.exit(1);
    }
    // Return
    return result;
}
exports.extractPrincipal = extractPrincipal;
/**
 * Extract a list of tag based on input data
 * @param tags content of tags
 * @returns a list of tag
 */
function extractTags(tags) {
    // Check the input parameter type
    const type = Object.prototype.toString.call(tags);
    // 
    if (type === "Object") {
        return Object.entries(tags).map((elem) => { return { key: elem.key, value: elem.value }; });
    }
    else if (type === "Array") {
        return tags.map((elem) => {
            return {
                key: elem.Key !== undefined ? elem.Key : elem.key,
                vallue: elem.Value !== undefined ? elem.Value : elem.value
            };
        });
    }
    else {
        return [];
    }
}
exports.extractTags = extractTags;
/**
 * Initial setting
 * @param envPath environment file path
 */
function initialSetting(envPath) {
    // Load a configuration data
    const env = loadJsonFile(envPath);
    // Set the environment various
    process.env.ASSUME_ROLE_ARN = env.ASSUME_ROLE_ARN;
    process.env.ORIGIN_ACCOUNT = env.ORIGIN_ACCOUNT;
    process.env.ORIGIN_REGION = env.ORIGIN_REGION;
    process.env.TARGET_ACCOUNT = env.TARGET_ACCOUNT;
    process.env.TARGET_REGION = env.TARGET_REGION;
    // Catch error
    if (!process.env.ORIGIN_ACCOUNT || !process.env.ORIGIN_REGION || !process.env.TARGET_ACCOUNT || !process.env.TARGET_REGION) {
        (0, response_1.catchError)(response_1.CODE.ERROR.COMMON.INVALIED_ENV, true);
    }
}
exports.initialSetting = initialSetting;
/**
 * Load a json data (configuration)
 * @param filePath file path
 * @returns loaded data
 */
function loadJsonFile(filePath) {
    try {
        // Read a file ata
        const data = (0, fs_1.readFileSync)(filePath).toString();
        // Transform to json and return data
        return JSON.parse(data);
    }
    catch (err) {
        // Print error message
        if (typeof err === "string" || err instanceof Error) {
            console.error(`[ERROR] ${err}`);
        }
        // Exit
        process.exit(1);
    }
}
exports.loadJsonFile = loadJsonFile;
/**
 * Stream to string
 * @param steam readable stream
 * @returns converted string
 */
async function streamToBuffer(steam) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        steam.on("data", chunk => chunks.push(chunk));
        steam.on("error", err => reject(err));
        steam.on("end", () => resolve(Buffer.concat(chunks)));
    });
}
exports.streamToBuffer = streamToBuffer;
