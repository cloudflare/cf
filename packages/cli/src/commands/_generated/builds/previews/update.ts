/**
 * update command
 * @generated from apis/overlays/builds.ts
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
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <preview>",
	describe: "Update preview",
	usage:
		"$0 builds previews update <preview>\n\nUpdate a single Preview of a Worker. Supports partial updates to the tracked branch, the automation flags, and the build settings.",
	flags: {
		worker: {
			kind: "parsed",
			brief: "Script tag of the Worker.",
			parse: String,
		},
		"auto-build": {
			kind: "boolean",
			brief:
				"Whether pushes to the git branch build this Preview. Deploy hooks, manual builds, and retries run regardless of this setting.",
			optional: true,
		},
		"auto-delete": {
			kind: "boolean",
			brief: "Whether deleting the git branch also deletes this Preview.",
			optional: true,
		},
		branch: {
			kind: "parsed",
			brief: "Git branch this Preview tracks",
			optional: true,
			parse: String,
		},
		"settings-build-caching-enabled": {
			kind: "boolean",
			brief: "Whether builds reuse cached dependencies and build artifacts.",
			optional: true,
		},
		"settings-build-command": {
			kind: "parsed",
			brief: "Command to build the Worker.",
			optional: true,
			parse: String,
		},
		"settings-build-token-uuid": {
			kind: "parsed",
			brief: "UUID of the build token used when deploying the Worker.",
			optional: true,
			parse: String,
		},
		"settings-deploy-command": {
			kind: "parsed",
			brief: "Command to deploy the Worker.",
			optional: true,
			parse: String,
		},
		"settings-environment-variables": {
			kind: "parsed",
			brief:
				'Environment variable updates. Set the variable entry to null to delete it. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"settings-path-excludes": {
			kind: "parsed",
			brief: "Path patterns that must not start builds.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"settings-path-includes": {
			kind: "parsed",
			brief: "Path patterns that can start builds.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"settings-root-directory": {
			kind: "parsed",
			brief: "Repository directory in which build and deploy commands run.",
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
			brief:
				"Request body for updating a Preview. At least one field must be provided, and omitted fields are left unchanged.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "preview", brief: "ID of the Preview.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "builds previews update",
				classification: {
					safeFlags: [
						"auto-build",
						"auto-delete",
						"settings-build-caching-enabled",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf builds previews update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/workers/${argv["worker"] == null ? "<worker>" : encodeURIComponent(String(argv["worker"]))}/previews/${argv["preview"] == null ? "<preview>" : encodeURIComponent(String(argv["preview"]))}`,
						pathParams: {
							worker: String(argv["worker"] ?? ""),
							preview: String(argv["preview"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											auto_build: argv["auto-build"],
											auto_delete: argv["auto-delete"],
											branch: resolveFileToken(
												argv["branch"] as string | undefined,
												"branch",
												"text"
											),
											settings: {
												build_caching_enabled:
													argv["settings-build-caching-enabled"],
												build_command: resolveFileToken(
													argv["settings-build-command"] as string | undefined,
													"settings-build-command",
													"text"
												),
												build_token_uuid: resolveFileToken(
													argv["settings-build-token-uuid"] as
														| string
														| undefined,
													"settings-build-token-uuid",
													"text"
												),
												deploy_command: resolveFileToken(
													argv["settings-deploy-command"] as string | undefined,
													"settings-deploy-command",
													"text"
												),
												environment_variables: parseJsonMap(
													argv["settings-environment-variables"],
													"settings-environment-variables"
												),
												path_excludes: argv["settings-path-excludes"],
												path_includes: argv["settings-path-includes"],
												root_directory: resolveFileToken(
													argv["settings-root-directory"] as string | undefined,
													"settings-root-directory",
													"text"
												),
											},
										},
										[["settings", "environment_variables"]]
									),
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
						requestApi<unknown>(
							client,
							"PATCH",
							`/accounts/${accountId}/builds/workers/${encodeURIComponent(String(argv["worker"]))}/previews/${encodeURIComponent(String(argv["preview"]))}`,
							{ body: bodyData }
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["auto-build"] !== undefined)
					setNestedValue(bodyData, ["auto_build"], argv["auto-build"]);
				if (argv["auto-delete"] !== undefined)
					setNestedValue(bodyData, ["auto_delete"], argv["auto-delete"]);
				if (argv["branch"] !== undefined)
					setNestedValue(
						bodyData,
						["branch"],
						resolveFileToken(
							argv["branch"] as string | undefined,
							"branch",
							"text"
						)
					);
				if (argv["settings-build-caching-enabled"] !== undefined)
					setNestedValue(
						bodyData,
						["settings", "build_caching_enabled"],
						argv["settings-build-caching-enabled"]
					);
				if (argv["settings-build-command"] !== undefined)
					setNestedValue(
						bodyData,
						["settings", "build_command"],
						resolveFileToken(
							argv["settings-build-command"] as string | undefined,
							"settings-build-command",
							"text"
						)
					);
				if (argv["settings-build-token-uuid"] !== undefined)
					setNestedValue(
						bodyData,
						["settings", "build_token_uuid"],
						resolveFileToken(
							argv["settings-build-token-uuid"] as string | undefined,
							"settings-build-token-uuid",
							"text"
						)
					);
				if (argv["settings-deploy-command"] !== undefined)
					setNestedValue(
						bodyData,
						["settings", "deploy_command"],
						resolveFileToken(
							argv["settings-deploy-command"] as string | undefined,
							"settings-deploy-command",
							"text"
						)
					);
				if (argv["settings-environment-variables"] !== undefined)
					setNestedValue(
						bodyData,
						["settings", "environment_variables"],
						parseJsonMap(
							argv["settings-environment-variables"],
							"settings-environment-variables"
						)
					);
				if (argv["settings-path-excludes"] !== undefined)
					setNestedValue(
						bodyData,
						["settings", "path_excludes"],
						argv["settings-path-excludes"]
					);
				if (argv["settings-path-includes"] !== undefined)
					setNestedValue(
						bodyData,
						["settings", "path_includes"],
						argv["settings-path-includes"]
					);
				if (argv["settings-root-directory"] !== undefined)
					setNestedValue(
						bodyData,
						["settings", "root_directory"],
						resolveFileToken(
							argv["settings-root-directory"] as string | undefined,
							"settings-root-directory",
							"text"
						)
					);
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PATCH",
						`/accounts/${accountId}/builds/workers/${encodeURIComponent(String(argv["worker"]))}/previews/${encodeURIComponent(String(argv["preview"]))}`,
						{ body: bodyData }
					)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
