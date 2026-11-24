/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseJsonMap,
	setNestedValue,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { readFileForFlag, resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <id>",
	describe: "Update integration",
	usage:
		"$0 zero-trust casb integrations update <id>\n\nUpdates an integration's name, permissions, DLP profiles, use cases, credentials, or GitLab resources.",
	flags: {
		"integration-config-gitlab-group-ids": {
			kind: "parsed",
			brief:
				"Selected top-level GitLab group IDs as string-encoded positive integers.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"integration-config-gitlab-project-ids": {
			kind: "parsed",
			brief: "Selected GitLab project IDs as string-encoded positive integers.",
			variadic: true,
			optional: true,
			parse: String,
		},
		credentials: {
			kind: "parsed",
			brief:
				'Partial credential fields to merge with existing. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		"dlp-profiles": {
			kind: "parsed",
			brief: "List of DLP profile IDs to associate with the integration.",
			variadic: true,
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Name of the integration.",
			optional: true,
			parse: String,
		},
		permissions: {
			kind: "parsed",
			brief: "List of permission scopes granted to the integration.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"use-cases": {
			kind: "parsed",
			brief:
				"List of use case or feature slugs to enroll (e.g., ['casb', 'ces', 'auto_remediation']).",
			variadic: true,
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
			brief: "Serializer for v2 integration PATCH requests.",
			optional: true,
			parse: String,
		},
		file: {
			kind: "parsed",
			brief: "Path to a file to upload as the request body",
			optional: true,
			parse: String,
		},
	},
	operands: [{ placeholder: "id", brief: "Integration ID.", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust casb integrations update",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust casb integrations update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/one/integrations/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}`,
						pathParams: { id: String(argv["id"] ?? "") },
						bodyKind: argv.file !== undefined ? "octet-stream" : "json",
						body:
							argv.file !== undefined
								? { file: argv.file }
								: argv.body !== undefined
									? parseBody(argv.body)
									: compactBody(
											{
												config: {
													gitlab: {
														group_ids:
															argv["integration-config-gitlab-group-ids"],
														project_ids:
															argv["integration-config-gitlab-project-ids"],
													},
												},
												credentials: parseJsonMap(
													argv["credentials"],
													"credentials"
												),
												dlp_profiles: argv["dlp-profiles"],
												name: resolveFileToken(
													argv["name"] as string | undefined,
													"name",
													"text"
												),
												permissions: argv["permissions"],
												use_cases: argv["use-cases"],
											},
											[["credentials"]]
										),
					});
					return;
				}
				const parsedBody =
					argv.file !== undefined
						? undefined
						: argv.body !== undefined
							? parseBody(argv.body)
							: undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.file !== undefined) {
					const fileContent = readFileForFlag(argv.file);
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PATCH",
							`/accounts/${accountId}/one/integrations/${encodeURIComponent(String(argv["id"]))}`,
							{
								body: fileContent,
								headers: { "Content-Type": "text/plain;charset=UTF-8" },
							}
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PATCH",
							`/accounts/${accountId}/one/integrations/${encodeURIComponent(String(argv["id"]))}`,
							{ body: bodyData }
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["integration-config-gitlab-group-ids"] !== undefined)
					setNestedValue(
						bodyData,
						["config", "gitlab", "group_ids"],
						argv["integration-config-gitlab-group-ids"]
					);
				if (argv["integration-config-gitlab-project-ids"] !== undefined)
					setNestedValue(
						bodyData,
						["config", "gitlab", "project_ids"],
						argv["integration-config-gitlab-project-ids"]
					);
				if (argv["credentials"] !== undefined)
					setNestedValue(
						bodyData,
						["credentials"],
						parseJsonMap(argv["credentials"], "credentials")
					);
				if (argv["dlp-profiles"] !== undefined)
					setNestedValue(bodyData, ["dlp_profiles"], argv["dlp-profiles"]);
				if (argv["name"] !== undefined)
					setNestedValue(
						bodyData,
						["name"],
						resolveFileToken(argv["name"] as string | undefined, "name", "text")
					);
				if (argv["permissions"] !== undefined)
					setNestedValue(bodyData, ["permissions"], argv["permissions"]);
				if (argv["use-cases"] !== undefined)
					setNestedValue(bodyData, ["use_cases"], argv["use-cases"]);
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PATCH",
						`/accounts/${accountId}/one/integrations/${encodeURIComponent(String(argv["id"]))}`,
						{ body: bodyData }
					)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
