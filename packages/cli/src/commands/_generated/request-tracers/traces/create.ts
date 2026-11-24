/**
 * create command
 * @generated from apis/overlays/request-tracers.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"body-base64": {
			kind: "parsed",
			brief: "Base64 encoded request body",
			optional: true,
			parse: String,
		},
		"body-json": {
			kind: "parsed",
			brief:
				'Arbitrary json as request body. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		"body-plain-text": {
			kind: "parsed",
			brief: "Request body as plain text",
			optional: true,
			parse: String,
		},
		"context-bot-score": {
			kind: "parsed",
			brief: "Bot score used for evaluating tracing request processing",
			optional: true,
			parse: Number,
		},
		"context-geoloc-city": {
			kind: "parsed",
			brief: "The context.geoloc.city field",
			optional: true,
			parse: String,
		},
		"context-geoloc-continent": {
			kind: "parsed",
			brief: "The context.geoloc.continent field",
			optional: true,
			parse: String,
		},
		"context-geoloc-is-eu-country": {
			kind: "boolean",
			brief: "The context.geoloc.is_eu_country field",
			optional: true,
		},
		"context-geoloc-iso-code": {
			kind: "parsed",
			brief: "The context.geoloc.iso_code field",
			optional: true,
			parse: String,
		},
		"context-geoloc-latitude": {
			kind: "parsed",
			brief: "The context.geoloc.latitude field",
			optional: true,
			parse: Number,
		},
		"context-geoloc-longitude": {
			kind: "parsed",
			brief: "The context.geoloc.longitude field",
			optional: true,
			parse: Number,
		},
		"context-geoloc-postal-code": {
			kind: "parsed",
			brief: "The context.geoloc.postal_code field",
			optional: true,
			parse: String,
		},
		"context-geoloc-region-code": {
			kind: "parsed",
			brief: "The context.geoloc.region_code field",
			optional: true,
			parse: String,
		},
		"context-geoloc-subdivision-2-iso-code": {
			kind: "parsed",
			brief: "The context.geoloc.subdivision_2_iso_code field",
			optional: true,
			parse: String,
		},
		"context-geoloc-timezone": {
			kind: "parsed",
			brief: "The context.geoloc.timezone field",
			optional: true,
			parse: String,
		},
		"context-skip-challenge": {
			kind: "boolean",
			brief:
				"Whether to skip any challenges for tracing request (e.g.: captcha)",
			optional: true,
		},
		"context-threat-score": {
			kind: "parsed",
			brief: "Threat score used for evaluating tracing request processing",
			optional: true,
			parse: Number,
		},
		cookies: {
			kind: "parsed",
			brief:
				'Cookies added to tracing request. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
			optional: true,
			parse: String,
		},
		headers: {
			kind: "parsed",
			brief:
				'Headers added to tracing request. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
			optional: true,
			parse: String,
		},
		method: {
			kind: "parsed",
			brief: "HTTP Method of tracing request",
			optional: true,
			parse: String,
		},
		protocol: {
			kind: "parsed",
			brief: "HTTP Protocol of tracing request",
			optional: true,
			parse: String,
		},
		"skip-response": {
			kind: "boolean",
			brief:
				"Skip sending the request to the Origin server after all rules evaluation",
			optional: true,
		},
		url: {
			kind: "parsed",
			brief: "URL to which perform tracing request",
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Request Trace",
	usage:
		"$0 request-tracers traces create\n\nTraces a simulated HTTP request through Cloudflare's edge to analyze how rules, settings, and configurations would process the request. Useful for debugging firewall rules, page rules, and other request transformations without sending actual traffic. Supports custom headers, cookies, body content, and geolocation context.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
