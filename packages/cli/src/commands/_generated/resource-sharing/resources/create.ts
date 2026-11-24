/**
 * create command
 * @generated from apis/overlays/resource-sharing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		meta: {
			kind: "parsed",
			brief:
				'Resource Metadata. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		"resource-account-id": {
			kind: "parsed",
			brief:
				"The account that owns the resource. Must match the `account_id` in the path.",
			optional: true,
			parse: String,
		},
		"resource-id": {
			kind: "parsed",
			brief:
				"Identifier assigned by the service that owns the shared resource.",
			optional: true,
			parse: String,
		},
		"resource-type": {
			kind: "parsed",
			brief: "Resource Type.",
			optional: true,
			choices: [
				"custom-ruleset",
				"gateway-policy",
				"gateway-destination-ip",
				"gateway-block-page-settings",
				"gateway-extended-email-matching",
				"idp-federation-grant",
				"trust-grant",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "resource-type", "text"),
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
	operands: [
		{ placeholder: "share-id", brief: "Share identifier tag.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <share-id>",
	describe: "Trigger a resource addition to a share",
	usage:
		"$0 resource-sharing resources create <share-id>\n\nAdds a resource to an existing share, making it available to share recipients.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
