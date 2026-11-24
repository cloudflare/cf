/**
 * create command
 * @generated from apis/overlays/r2.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"cf-r2-jurisdiction": {
			kind: "parsed",
			brief:
				"Jurisdiction where objects in this bucket are guaranteed to be stored.",
			optional: true,
			parse: String,
		},
		"location-hint": {
			kind: "parsed",
			brief: "Location of the bucket.",
			optional: true,
			choices: ["apac", "eeur", "enam", "weur", "wnam", "oc"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "location-hint", "text"),
		},
		name: {
			kind: "parsed",
			brief: "Name of the bucket.",
			optional: true,
			parse: String,
		},
		"storage-class": {
			kind: "parsed",
			brief:
				"Storage class for newly uploaded objects, unless specified otherwise.",
			default: "Standard",
			choices: ["Standard", "InfrequentAccess"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "storage-class", "text"),
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
	describe: "Create Bucket",
	usage:
		"$0 r2 buckets create\n\nCreates an R2 bucket in the account and selected jurisdiction, with an optional location hint and default storage class.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
