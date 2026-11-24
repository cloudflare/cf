/**
 * update command
 * @generated from apis/overlays/o11y.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		destinations: {
			kind: "parsed",
			brief:
				"Up to 100 OpenTelemetry destination identifiers that receive traces.",
			variadic: true,
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief: "Whether Cloudflare Traces is enabled for the zone.",
			optional: true,
		},
		"forward-context": {
			kind: "boolean",
			brief:
				"Whether trace context is sent externally or across a zone boundary.",
			optional: true,
		},
		persist: {
			kind: "boolean",
			brief: "Whether traces are persisted in Cloudflare.",
			optional: true,
		},
		"propagation-policy": {
			kind: "parsed",
			brief:
				"When inbound trace context may be continued. Authenticated propagation is not supported yet.",
			optional: true,
			choices: ["accept", "authenticated", "reject"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "propagation-policy", "text"),
		},
		"sampling-ratio": {
			kind: "parsed",
			brief: "The ratio of requests sampled for tracing, from 0 to 1.",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Update zone tracing settings",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update",
	describe: "Update zone tracing settings",
	usage:
		"$0 o11y tracing settings update\n\nUpdate the zone-level Cloudflare Traces settings.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
