/**
 * create command
 * @generated from apis/overlays/browser-run.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"keep-alive": {
			kind: "parsed",
			brief: "Keep-alive time in milliseconds.",
			optional: true,
			parse: Number,
		},
		lab: {
			kind: "boolean",
			brief: "Use experimental browser.",
			optional: true,
		},
		targets: {
			kind: "boolean",
			brief: "Include browser targets in response.",
			optional: true,
		},
		"live-view-url-expires-in-ms": {
			kind: "parsed",
			brief:
				"How long the live view URL remains valid, in milliseconds (max 60 minutes). Only used when targets is true.",
			optional: true,
			parse: Number,
		},
		recording: { kind: "boolean", brief: "Recording", optional: true },
		"guardrails-allowed-domain-sets": {
			kind: "parsed",
			brief:
				"Max 4 entries: curated preset names (common-cdns) and/or https URLs of newline-separated hostname lists.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"guardrails-allowed-domains": {
			kind: "parsed",
			brief:
				"Hostname patterns, max 50. Supports exact hosts (example.com) or a single * wildcard anywhere. Prefer *.example.com (subdomain wildcard) over *example.com (prefix wildcard) to avoid matching overbroad lookalikes like evilexample.com.",
			variadic: true,
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
	describe: "Get a browser session ID.",
	usage:
		"$0 browser-run devtools browser create\n\nAcquires a browser and returns its session ID and websocket URL. Optionally accepts a JSON body with session guardrails to restrict outbound HTTP/S traffic.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
