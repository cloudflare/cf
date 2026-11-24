/**
 * update command
 * @generated from apis/overlays/k2.ts
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
			brief:
				"Indicates whether the HTTP endpoint requires an API token with K2 produce permission. When false, the endpoint accepts unauthenticated records. Defaults to true when HTTP is enabled without a stored value.",
			optional: true,
		},
		"http-cors-origins": {
			kind: "parsed",
			brief:
				"Allows browser requests from these HTTP or HTTPS origins. Use a wildcard only as the sole origin. An empty list blocks cross-origin browser requests. Defaults to `['*']` when HTTP is enabled without stored origins.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"http-enabled": {
			kind: "boolean",
			brief: "Indicates whether the HTTP endpoint accepts records.",
			optional: true,
		},
		"retention-seconds": {
			kind: "parsed",
			brief:
				"Sets the record retention period from 1 hour (3600 seconds) to 30 days (2592000 seconds), inclusive.",
			optional: true,
			parse: Number,
		},
		"worker-binding-enabled": {
			kind: "boolean",
			brief:
				"Indicates whether Workers bindings can produce records to the stream.",
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
			brief: "Specifies the public ID of the K2 stream.",
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
				const missing = ["http-enabled"].filter((k) => argv[k] === undefined);
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
	describe: "Update K2 stream",
	usage:
		"$0 k2 streams update <stream-id>\n\nUpdate a K2 stream. Omitted `http` settings, such as `authentication` and `cors`, keep their current values. Disabling HTTP keeps them, so enabling HTTP again restores them. At least one input must remain enabled.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
