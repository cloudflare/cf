/**
 * create command
 * @generated from apis/overlays/custom-pages.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		act: {
			kind: "parsed",
			brief:
				'The preview action type. Required for request parsing but not used in token generation. Typically set to "preview".',
			optional: true,
			parse: String,
		},
		target: {
			kind: "parsed",
			brief:
				'The target custom page type to preview (e.g. "block:waf"). Encoded as the "endpoint" claim in the resulting JWT.',
			optional: true,
			parse: String,
		},
		url: {
			kind: "parsed",
			brief:
				'The URL of the custom page content to preview. Encoded as the "zone" claim in the resulting JWT.',
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
	describe: "Create a preview token",
	usage:
		"$0 custom-pages account-custom-pages preview-tokens create\n\nCreates a signed JWT for previewing an account or zone-level custom page before it is published.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
