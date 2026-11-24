/**
 * update command
 * @generated from apis/overlays/pipelines.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"http-authentication": {
			kind: "boolean",
			brief: "Indicates that authentication is required for the HTTP endpoint.",
			optional: true,
		},
		"http-cors-origins": {
			kind: "parsed",
			brief: "The http.cors.origins field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"http-enabled": {
			kind: "boolean",
			brief: "Indicates that the HTTP endpoint is enabled.",
			optional: true,
		},
		"worker-binding-enabled": {
			kind: "boolean",
			brief: "Indicates that the worker binding is enabled.",
			optional: true,
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
		{
			placeholder: "stream-id",
			brief: "Specifies the public ID of the stream.",
			parse: String,
		},
	],
	rules(rules) {
		rules.check((argv) => {
			const groupSet = [
				"http-authentication",
				"http-cors-origins",
				"http-enabled",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = ["http-authentication", "http-enabled"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --http-* flag is set`
					);
				}
			}
			return true;
		});
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <stream-id>",
	describe: "Update Stream",
	usage: "$0 pipelines streams update <stream-id>\n\nUpdate a Stream.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
