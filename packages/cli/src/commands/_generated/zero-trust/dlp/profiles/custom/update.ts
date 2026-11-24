import operation from "../../../../_operations/zero-trust/dlp/profiles/custom/update.js";
/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <profile-id>",
	describe: "Update custom profile",
	usage:
		"$0 zero-trust dlp profiles custom update <profile-id>\n\nUpdates a DLP custom profile.",
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
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dlp profiles custom update",
				classification: {
					safeFlags: [
						"ai-context-enabled",
						"context-awareness-enabled",
						"context-awareness-skip-files",
						"ocr-enabled",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"The name field"
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dlp profiles custom update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dlp/profiles/custom/${argv["profile-id"] == null ? "<profile-id>" : encodeURIComponent(String(argv["profile-id"]))}`,
						pathParams: { "profile-id": String(argv["profile-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										ai_context_enabled: argv["ai-context-enabled"],
										allowed_match_count: argv["allowed-match-count"],
										confidence_threshold: resolveFileToken(
											argv["confidence-threshold"] as string | undefined,
											"confidence-threshold",
											"text"
										),
										context_awareness: {
											enabled: argv["context-awareness-enabled"],
											skip: {
												files: argv["context-awareness-skip-files"],
											},
										},
										data_classes: argv["data-classes"],
										data_tags: argv["data-tags"],
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										entries: parseObjectArray(argv["entries"], "entries", true),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										ocr_enabled: argv["ocr-enabled"],
										sensitivity_levels: parseObjectArray(
											argv["sensitivity-levels"],
											"sensitivity-levels",
											true
										),
										shared_entries: parseObjectArray(
											argv["shared-entries"],
											"shared-entries"
										),
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							profile_id: argv["profile-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					ai_context_enabled: argv["ai-context-enabled"],
					allowed_match_count: argv["allowed-match-count"],
					confidence_threshold: resolveFileToken(
						argv["confidence-threshold"] as string | undefined,
						"confidence-threshold",
						"text"
					),
					context_awareness: {
						enabled: argv["context-awareness-enabled"],
						skip: {
							files: argv["context-awareness-skip-files"],
						},
					},
					data_classes: argv["data-classes"],
					data_tags: argv["data-tags"],
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					entries: parseObjectArray(argv["entries"], "entries", true),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					ocr_enabled: argv["ocr-enabled"],
					sensitivity_levels: parseObjectArray(
						argv["sensitivity-levels"],
						"sensitivity-levels",
						true
					),
					shared_entries: parseObjectArray(
						argv["shared-entries"],
						"shared-entries"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						profile_id: argv["profile-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
