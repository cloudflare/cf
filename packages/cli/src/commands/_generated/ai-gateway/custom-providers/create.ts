/**
 * create command
 * @generated from apis/overlays/ai-gateway.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"base-url": {
			kind: "parsed",
			brief: "The base_url field",
			optional: true,
			parse: String,
		},
		beta: { kind: "boolean", brief: "The beta field", optional: true },
		"curl-example": {
			kind: "parsed",
			brief: "The curl_example field",
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "The description field",
			optional: true,
			parse: String,
		},
		enable: { kind: "boolean", brief: "The enable field", optional: true },
		headers: {
			kind: "parsed",
			brief:
				"JSON object of extra HTTP headers that AI Gateway sends to the provider. Values can contain credentials.",
			optional: true,
			parse: String,
		},
		"js-example": {
			kind: "parsed",
			brief: "The js_example field",
			optional: true,
			parse: String,
		},
		link: {
			kind: "parsed",
			brief: "The link field",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		position: {
			kind: "parsed",
			brief: "The position field",
			optional: true,
			parse: Number,
		},
		slug: {
			kind: "parsed",
			brief: "The slug field",
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
	describe: "Create a custom provider",
	usage:
		"$0 ai-gateway custom-providers create\n\nCreates an account-level custom provider that forwards AI Gateway requests to the HTTPS base URL you supply. Requests reference the provider as `custom-{slug}`, so the slug must be unique within the account.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
