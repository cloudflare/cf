/**
 * create command
 * @generated from apis/overlays/intel.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"content-adds": {
			kind: "parsed",
			brief: "Content category IDs to add.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"content-removes": {
			kind: "parsed",
			brief: "Content category IDs to remove.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"indicator-type": {
			kind: "parsed",
			brief: "The indicator_type field",
			optional: true,
			choices: ["domain", "ipv4", "ipv6", "url"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "indicator-type", "text"),
		},
		ip: {
			kind: "parsed",
			brief: "Provide only if indicator_type is `ipv4` or `ipv6`.",
			optional: true,
			parse: String,
		},
		"security-adds": {
			kind: "parsed",
			brief: "Security category IDs to add.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"security-removes": {
			kind: "parsed",
			brief: "Security category IDs to remove.",
			variadic: true,
			optional: true,
			parse: String,
		},
		url: {
			kind: "parsed",
			brief:
				"Provide only if indicator_type is `domain` or `url`. Example if indicator_type is `domain`: `example.com`. Example if indicator_type is `url`: `https://example.com/news/`.",
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
	describe: "Create Miscategorization",
	usage:
		"$0 intel miscategorizations create\n\nAllows you to submit requests to change a domain’s category. Requests that include category `169` (New Domains) or category `177` (Newly Seen) in any of `content_adds`, `content_removes`, `security_adds`, or `security_removes` will be rejected with a `400 Bad Request`. These categories are automatically managed and fall off 30 days after they are applied.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
