/**
 * create command
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
		"configuration-headers": {
			kind: "parsed",
			brief:
				'The configuration.headers field. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
			optional: true,
			parse: String,
		},
		"configuration-logpush-dataset": {
			kind: "parsed",
			brief: "The configuration.logpushDataset field",
			optional: true,
			choices: [
				"opentelemetry-traces",
				"opentelemetry-logs",
				"opentelemetry-metrics",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "configuration-logpush-dataset", "text"),
		},
		"configuration-type": {
			kind: "parsed",
			brief: "The configuration.type field",
			optional: true,
			choices: ["logpush"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "configuration-type", "text"),
		},
		"configuration-url": {
			kind: "parsed",
			brief: "The configuration.url field",
			optional: true,
			parse: String,
		},
		enabled: { kind: "boolean", brief: "The enabled field", optional: true },
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		"skip-preflight-check": {
			kind: "boolean",
			brief: "The skipPreflightCheck field",
			optional: true,
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
	describe: "Create Destination",
	usage:
		"$0 o11y destinations create\n\nCreate a new Workers Observability Telemetry Destination.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
