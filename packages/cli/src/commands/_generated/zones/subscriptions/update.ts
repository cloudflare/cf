/**
 * update command
 * @generated from apis/overlays/zones.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"app-install-id": {
			kind: "parsed",
			brief: "app install id.",
			optional: true,
			parse: String,
		},
		"component-values": {
			kind: "parsed",
			brief:
				'Configurable component values for the subscription. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"default"?: number, "display_name"?: string, "kind"?: "enum" | "sum" | "usage", "name"?: string, "price"?: number, ...more}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		frequency: {
			kind: "parsed",
			brief: "How often the subscription is renewed automatically.",
			optional: true,
			choices: ["weekly", "monthly", "quarterly", "yearly"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "frequency", "text"),
		},
		"rate-plan-currency": {
			kind: "parsed",
			brief: "The currency applied to the rate plan subscription.",
			optional: true,
			parse: String,
		},
		"rate-plan-externally-managed": {
			kind: "boolean",
			brief: "Whether this rate plan is managed externally from Cloudflare.",
			optional: true,
		},
		"rate-plan-id": {
			kind: "parsed",
			brief: "The ID of the rate plan.",
			optional: true,
			parse: String,
		},
		"rate-plan-is-contract": {
			kind: "boolean",
			brief:
				"Whether a rate plan is enterprise-based (or newly adopted term contract).",
			optional: true,
		},
		"rate-plan-public-name": {
			kind: "parsed",
			brief: "The full name of the rate plan.",
			optional: true,
			parse: String,
		},
		"rate-plan-scope": {
			kind: "parsed",
			brief: "The scope that this rate plan applies to.",
			optional: true,
			parse: String,
		},
		"rate-plan-sets": {
			kind: "parsed",
			brief:
				"The list of sets this rate plan applies to. Returns array of strings.",
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
	command: "update",
	describe: "Update Zone Subscription",
	usage:
		"$0 zones subscriptions update\n\nUpdates zone subscriptions, either plan or add-ons.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
