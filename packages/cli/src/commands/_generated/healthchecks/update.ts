/**
 * update command
 * @generated from apis/overlays/healthchecks.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		address: {
			kind: "parsed",
			brief:
				"The hostname or IP address of the origin server to run health checks on.",
			optional: true,
			parse: String,
		},
		"check-regions": {
			kind: "parsed",
			brief:
				"A list of regions from which to run health checks. Null means Cloudflare will pick a default region.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"consecutive-fails": {
			kind: "parsed",
			brief:
				"The number of consecutive fails required from a health check before changing the health to unhealthy.",
			optional: true,
			parse: Number,
		},
		"consecutive-successes": {
			kind: "parsed",
			brief:
				"The number of consecutive successes required from a health check before changing the health to healthy.",
			optional: true,
			parse: Number,
		},
		description: {
			kind: "parsed",
			brief: "A human-readable description of the health check.",
			optional: true,
			parse: String,
		},
		"http-config-allow-insecure": {
			kind: "boolean",
			brief:
				"Do not validate the certificate when the health check uses HTTPS.",
			optional: true,
		},
		"http-config-expected-body": {
			kind: "parsed",
			brief:
				"A case-insensitive sub-string to look for in the response body. If this string is not found, the origin will be marked as unhealthy.",
			optional: true,
			parse: String,
		},
		"http-config-expected-codes": {
			kind: "parsed",
			brief:
				'The expected HTTP response codes (e.g. "200") or code ranges (e.g. "2xx" for all codes starting with 2) of the health check.',
			variadic: true,
			optional: true,
			parse: String,
		},
		"http-config-follow-redirects": {
			kind: "boolean",
			brief: "Follow redirects if the origin returns a 3xx status code.",
			optional: true,
		},
		"http-config-header": {
			kind: "parsed",
			brief:
				'The HTTP request headers to send in the health check. It is recommended you set a Host header by default. The User-Agent header cannot be overridden. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": [string]}.',
			optional: true,
			parse: String,
		},
		"http-config-method": {
			kind: "parsed",
			brief: "The HTTP method to use for the health check.",
			optional: true,
			choices: ["GET", "HEAD"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "http-config-method", "text"),
		},
		"http-config-path": {
			kind: "parsed",
			brief: "The endpoint path to health check against.",
			optional: true,
			parse: String,
		},
		"http-config-port": {
			kind: "parsed",
			brief:
				"Port number to connect to for the health check. Defaults to 80 if type is HTTP or 443 if type is HTTPS.",
			optional: true,
			parse: Number,
		},
		interval: {
			kind: "parsed",
			brief:
				"The interval between each health check. Shorter intervals may give quicker notifications if the origin status changes, but will increase load on the origin as we check from multiple locations.",
			optional: true,
			parse: Number,
		},
		name: {
			kind: "parsed",
			brief:
				"A short name to identify the health check. Only alphanumeric characters, hyphens and underscores are allowed.",
			optional: true,
			parse: String,
		},
		retries: {
			kind: "parsed",
			brief:
				"The number of retries to attempt in case of a timeout before marking the origin as unhealthy. Retries are attempted immediately.",
			optional: true,
			parse: Number,
		},
		suspended: {
			kind: "boolean",
			brief: "If suspended, no health checks are sent to the origin.",
			optional: true,
		},
		"tcp-config-method": {
			kind: "parsed",
			brief: "The TCP connection method to use for the health check.",
			optional: true,
			choices: ["connection_established"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "tcp-config-method", "text"),
		},
		"tcp-config-port": {
			kind: "parsed",
			brief: "Port number to connect to for the health check. Defaults to 80.",
			optional: true,
			parse: Number,
		},
		timeout: {
			kind: "parsed",
			brief:
				"The timeout (in seconds) before marking the health check as failed.",
			optional: true,
			parse: Number,
		},
		type: {
			kind: "parsed",
			brief:
				"The protocol to use for the health check. Currently supported protocols are 'HTTP', 'HTTPS' and 'TCP'.",
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
	operands: [
		{ placeholder: "healthcheck-id", brief: "Identifier", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <healthcheck-id>",
	describe: "Update Health Check",
	usage:
		"$0 healthchecks update <healthcheck-id>\n\nUpdate a configured health check.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
