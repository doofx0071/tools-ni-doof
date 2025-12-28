/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as chrono_zone_mutations from "../chrono_zone/mutations.js";
import type * as chrono_zone_queries from "../chrono_zone/queries.js";
import type * as http from "../http.js";
import type * as quick_qr_queries from "../quick_qr/queries.js";
import type * as webhook_tester_mutations from "../webhook_tester/mutations.js";
import type * as webhook_tester_queries from "../webhook_tester/queries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "chrono_zone/mutations": typeof chrono_zone_mutations;
  "chrono_zone/queries": typeof chrono_zone_queries;
  http: typeof http;
  "quick_qr/queries": typeof quick_qr_queries;
  "webhook_tester/mutations": typeof webhook_tester_mutations;
  "webhook_tester/queries": typeof webhook_tester_queries;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
