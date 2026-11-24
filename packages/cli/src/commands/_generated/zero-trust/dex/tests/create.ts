/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"data-host": {
			kind: "parsed",
			brief: "The desired endpoint to test.",
			optional: true,
			parse: String,
		},
		"data-kind": {
			kind: "parsed",
			brief: "The type of test.",
			optional: true,
			choices: ["http", "traceroute"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "data-kind", "text"),
		},
		"data-method": {
			kind: "parsed",
			brief: "The HTTP request method type.",
			optional: true,
			choices: ["GET"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "data-method", "text"),
		},
		description: {
			kind: "parsed",
			brief: "Additional details about the test.",
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief: "Determines whether or not the test is active.",
			optional: true,
		},
		interval: {
			kind: "parsed",
			brief: "How often the test will run.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name of the DEX test. Must be unique.",
			optional: true,
			parse: String,
		},
		"target-policies": {
			kind: "parsed",
			brief:
				'DEX rules targeted by this test. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"id": string, "default"?: boolean, "name"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		targeted: { kind: "boolean", brief: "The targeted field", optional: true },
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
	describe: "Create Device DEX test",
	usage: "$0 zero-trust dex tests create\n\nCreate a DEX test.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
