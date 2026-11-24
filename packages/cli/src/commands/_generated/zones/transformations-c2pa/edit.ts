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
			brief: "Whether C2PA signing is enabled for image transformations.",
			optional: true,
			choices: ["off", "on"],
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
	describe: "Change Image Transformations C2PA setting",
	usage:
		"$0 zones transformations-c2pa edit\n\nC2PA (Coalition for Content Provenance and Authenticity) signing adds cryptographic metadata to images processed through Cloudflare Image Transformations, enabling verification of image authenticity and provenance.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
