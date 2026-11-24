/**
 * edit command
 * @generated from apis/overlays/user.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"check-regions": {
			kind: "parsed",
			brief:
				"A list of regions from which to run health checks. Null means every Cloudflare data center.",
			variadic: true,
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "A human-readable description of the pool.",
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief:
				"Whether to enable (the default) or disable this pool. Disabled pools will not receive traffic and are excluded from health checks. Disabling a pool will cause any load balancers using it to failover to the next pool (if any).",
			optional: true,
		},
		"health-sources": {
			kind: "parsed",
			brief:
				'A list of health sources, ordered from highest to lowest priority, used to evaluate individual origin health and overall pool health. The load balancer uses the first source that has data and falls back to the next. Currently accepted values are null or the exact array ["regional", "global"]; any other combination is rejected. Null (the default) behaves like ["local", "global"]. ["regional", "global"] makes each region steer on its own health, falling back to the global decision when a region has no fresh data. Setting regional requires at least one region in check_regions.',
			variadic: true,
			optional: true,
			parse: String,
		},
		latitude: {
			kind: "parsed",
			brief:
				"The latitude of the data center containing the origins used in this pool in decimal degrees. If this is set, longitude must also be set.",
			optional: true,
			parse: Number,
		},
		"load-shedding-default-percent": {
			kind: "parsed",
			brief:
				"The percent of traffic to shed from the pool, according to the default policy. Applies to new sessions and traffic without session affinity.",
			optional: true,
			parse: Number,
		},
		"load-shedding-default-policy": {
			kind: "parsed",
			brief:
				"The default policy to use when load shedding. A random policy randomly sheds a given percent of requests. A hash policy computes a hash over the CF-Connecting-IP address and sheds all requests originating from a percent of IPs.",
			optional: true,
			choices: ["random", "hash"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "load-shedding-default-policy", "text"),
		},
		"load-shedding-session-percent": {
			kind: "parsed",
			brief:
				"The percent of existing sessions to shed from the pool, according to the session policy.",
			optional: true,
			parse: Number,
		},
		"load-shedding-session-policy": {
			kind: "parsed",
			brief:
				"Only the hash policy is supported for existing sessions (to avoid exponential decay).",
			optional: true,
			choices: ["hash"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "load-shedding-session-policy", "text"),
		},
		longitude: {
			kind: "parsed",
			brief:
				"The longitude of the data center containing the origins used in this pool in decimal degrees. If this is set, latitude must also be set.",
			optional: true,
			parse: Number,
		},
		"minimum-origins": {
			kind: "parsed",
			brief:
				"The minimum number of origins that must be healthy for this pool to serve traffic. If the number of healthy origins falls below this number, the pool will be marked unhealthy and will failover to the next available pool.",
			optional: true,
			parse: Number,
		},
		monitor: {
			kind: "parsed",
			brief:
				"The ID of the Monitor to use for checking the health of origins within this pool.",
			optional: true,
			parse: String,
		},
		"monitor-group": {
			kind: "parsed",
			brief:
				"The ID of the Monitor Group to use for checking the health of origins within this pool.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief:
				"A short name (tag) for the pool. Only alphanumeric characters, hyphens, and underscores are allowed.",
			optional: true,
			parse: String,
		},
		networks: {
			kind: "parsed",
			brief: "List of networks where Load Balancer or Pool is enabled.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"notification-email": {
			kind: "parsed",
			brief:
				"This field is now deprecated. It has been moved to Cloudflare's Centralized Notification service https://developers.cloudflare.com/fundamentals/notifications/. The email address to send health status notifications to. This can be an individual mailbox or a mailing list. Multiple emails can be supplied as a comma delimited list.",
			optional: true,
			parse: String,
		},
		"notification-filter-origin-disable": {
			kind: "boolean",
			brief:
				"If set true, disable notifications for this type of resource (pool or origin).",
			optional: true,
		},
		"notification-filter-origin-healthy": {
			kind: "boolean",
			brief:
				"If present, send notifications only for this health status (e.g. false for only DOWN events). Use null to reset (all events).",
			optional: true,
		},
		"notification-filter-pool-disable": {
			kind: "boolean",
			brief:
				"If set true, disable notifications for this type of resource (pool or origin).",
			optional: true,
		},
		"notification-filter-pool-healthy": {
			kind: "boolean",
			brief:
				"If present, send notifications only for this health status (e.g. false for only DOWN events). Use null to reset (all events).",
			optional: true,
		},
		"origin-steering-policy": {
			kind: "parsed",
			brief:
				'The type of origin steering policy to use.\n- `"random"`: Select an origin randomly.\n- `"hash"`: Select an origin by computing a hash over the CF-Connecting-IP address.\n- `"least_outstanding_requests"`: Select an origin by taking into consideration origin weights, as well as each origin\'s number of outstanding requests. Origins with more pending requests are weighted proportionately less relative to others.\n- `"least_connections"`: Select an origin by taking into consideration origin weights, as well as each origin\'s number of open connections. Origins with more open connections are weighted proportionately less relative to others. Supported for HTTP/1 and HTTP/2 connections.',
			optional: true,
			choices: [
				"random",
				"hash",
				"least_outstanding_requests",
				"least_connections",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "origin-steering-policy", "text"),
		},
		origins: {
			kind: "parsed",
			brief:
				'The list of origins within this pool. Traffic directed at this pool is balanced across all currently healthy origins, provided the pool itself is healthy. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"address"?: string, "enabled"?: boolean, "flatten_cname"?: boolean, "header"?: {...}, "name"?: string, ...more}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [{ placeholder: "pool-id", brief: "Pool ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <pool-id>",
	describe: "Patch Pool",
	usage:
		"$0 user load-balancers pools edit <pool-id>\n\nApply changes to an existing pool, overwriting the supplied properties.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
