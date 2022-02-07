import * as sdkLib from "./sdk/index";
import * as cdkLib from "./cdk/index";
import { loadJsonFile as load } from "./utils/util";

export const sdk = sdkLib;
export const cdk = cdkLib;
export const loadJsonFile = load;