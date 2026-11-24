/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"ai-context-enabled": {
			kind: "boolean",
			brief: "The ai_context_enabled field",
			optional: true,
		},
		"allowed-match-count": {
			kind: "parsed",
			brief: "The allowed_match_count field",
			optional: true,
			parse: Number,
		},
		"confidence-threshold": {
			kind: "parsed",
			brief: "The confidence_threshold field",
			optional: true,
			parse: String,
		},
		"context-awareness-enabled": {
			kind: "boolean",
			brief:
				"If true, scan the context of predefined entries to only return matches surrounded by keywords.",
			optional: true,
		},
		"context-awareness-skip-files": {
			kind: "boolean",
			brief:
				"If the content type is a file, skip context analysis and return all matches.",
			optional: true,
		},
		entries: {
			kind: "parsed",
			brief:
				'The entries field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"enabled": boolean, "id": string}].',
			optional: true,
			parse: String,
		},
		"ocr-enabled": {
			kind: "boolean",
			brief: "The ocr_enabled field",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "The updated parameters for the predefined profile.",
			optional: true,
			parse: String,
		},
	},
	operands: [{ placeholder: "profile-id", brief: "Profile ID", parse: String }],
	rules(rules) {
		rules.check((argv) => {
			const groupSet = [
				"context-awareness-enabled",
				"context-awareness-skip-files",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"context-awareness-enabled",
					"context-awareness-skip-files",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --context-awareness-* flag is set`
					);
				}
			}
			return true;
		});
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <profile-id>",
	describe: "Update predefined profile",
	usage:
		"$0 zero-trust dlp profiles predefined update <profile-id>\n\nUpdates a DLP predefined profile. Only supports enabling/disabling entries.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
