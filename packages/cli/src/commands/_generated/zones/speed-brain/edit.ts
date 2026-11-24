/**
 * edit command
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
		value: {
			kind: "parsed",
			brief: "Whether the feature is enabled or disabled.",
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
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit",
	describe: "Change Cloudflare Speed Brain setting",
	usage:
		"$0 zones speed-brain edit\n\nSpeed Brain lets compatible browsers speculate on content which can be prefetched or preloaded, making website navigation faster. Refer to the Cloudflare Speed Brain documentation for more information.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
