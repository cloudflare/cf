/**
 * update command
 * @generated from apis/overlays/o11y.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"configuration-headers": {
			kind: "parsed",
			brief:
				'The configuration.headers field. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": (string | null)}.',
			optional: true,
			parse: String,
		},
		"configuration-replace-headers": {
			kind: "boolean",
			brief: "The configuration.replaceHeaders field",
			optional: true,
		},
		"configuration-type": {
			kind: "parsed",
			brief: "The configuration.type field",
			optional: true,
			choices: ["logpush"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "configuration-type", "text"),
		},
		"configuration-url": {
			kind: "parsed",
			brief: "The configuration.url field",
			optional: true,
			parse: String,
		},
		enabled: { kind: "boolean", brief: "The enabled field", optional: true },
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
	operands: [{ placeholder: "slug", brief: "Slug", parse: String }],
	rules(rules) {
		rules.check((argv) => {
			const groupSet = [
				"configuration-headers",
				"configuration-replace-headers",
				"configuration-type",
				"configuration-url",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"configuration-headers",
					"configuration-type",
					"configuration-url",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --configuration-* flag is set`
					);
				}
			}
			return true;
		});
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <slug>",
	describe: "Update Destination",
	usage:
		"$0 o11y destinations update <slug>\n\nUpdate an existing Workers Observability Telemetry Destination.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
