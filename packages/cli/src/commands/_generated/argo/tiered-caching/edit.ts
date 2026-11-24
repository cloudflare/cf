/**
 * edit command
 * @generated from apis/overlays/argo.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		value: {
			kind: "parsed",
			brief: "Enables or disables Tiered Cache.",
			optional: true,
			choices: ["on", "off"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "value", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Updates whether Tiered Cache is enabled for a zone.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit",
	describe: "Update Tiered Cache",
	usage:
		"$0 argo tiered-caching edit\n\nEnables or disables Tiered Cache for a zone. Tiered Cache reduces origin traffic by serving lower-tier cache misses from upper-tier data centers before requesting content from your origin.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
