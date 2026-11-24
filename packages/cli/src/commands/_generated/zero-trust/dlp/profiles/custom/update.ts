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
		"data-classes": {
			kind: "parsed",
			brief:
				"Data class IDs to associate with the profile. If omitted, existing associations are unchanged.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"data-tags": {
			kind: "parsed",
			brief:
				"Data tag IDs to associate with the profile. If omitted, existing associations are unchanged.",
			variadic: true,
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "The description of the profile.",
			optional: true,
			parse: String,
		},
		entries: {
			kind: "parsed",
			brief:
				'Custom entries from this profile.\nIf this field is omitted, entries owned by this profile will not be changed. Provide as a JSON array of objects, null, or @path/to/file.json. Shape: [(({"enabled": boolean, "name": string, "pattern": {...}, "description"?: (string | null)} & {"entry_id": string}) | {"enabled": boolean, "name": string, "pattern": {...}, "description"?: (string | null)})]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		"ocr-enabled": {
			kind: "boolean",
			brief: "The ocr_enabled field",
			optional: true,
		},
		"sensitivity-levels": {
			kind: "parsed",
			brief:
				'Sensitivity levels to associate with the profile. If omitted, existing associations are unchanged. Provide as a JSON array of objects, null, or @path/to/file.json. Shape: [{"group_id": string, "level_id": string}].',
			optional: true,
			parse: String,
		},
		"shared-entries": {
			kind: "parsed",
			brief:
				'Other entries, e.g. predefined or integration. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"enabled": boolean, "entry_id": string}].',
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
			brief: "The updated parameters for the profile.",
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
	describe: "Update custom profile",
	usage:
		"$0 zero-trust dlp profiles custom update <profile-id>\n\nUpdates a DLP custom profile.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
