/**
 * create command
 * @generated from apis/overlays/web-assets.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		endpoint: {
			kind: "parsed",
			brief:
				"The endpoint which can contain path parameter templates in curly braces, each will be replaced from left to right with {varN}, starting with {var1}, during insertion. This will further be Cloudflare-normalized upon insertion. See: https://developers.cloudflare.com/rules/normalization/how-it-works/.",
			optional: true,
			parse: String,
		},
		host: {
			kind: "parsed",
			brief: "RFC3986-compliant host.",
			optional: true,
			parse: String,
		},
		method: {
			kind: "parsed",
			brief: "The HTTP method used to access the endpoint.",
			optional: true,
			choices: [
				"GET",
				"POST",
				"HEAD",
				"OPTIONS",
				"PUT",
				"DELETE",
				"CONNECT",
				"PATCH",
				"TRACE",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "method", "text"),
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
	describe: "Create a web or API operation",
	usage:
		"$0 web-assets operations create\n\nCreates one web or API operation. The host, method, and path are normalized; an existing matching operation is returned instead of duplicated.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
