import operation from "../../../_operations/zero-trust/cws/workloads/update.js";
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
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <workload-id>",
	describe: "Update a workload",
	usage:
		"$0 zero-trust cws workloads update <workload-id>\n\nReplaces the workload's configuration. Omit tags or use {} to clear them.",
	flags: {
		description: {
			kind: "parsed",
			brief: "Optional free-form description.",
			optional: true,
			parse: String,
		},
		filter: {
			kind: "parsed",
			brief:
				"Filter expression selecting the requests this workload matches. Maximum 4096 UTF-8 bytes.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Human-readable handle; unique per account.",
			optional: true,
			parse: String,
		},
		tags: {
			kind: "parsed",
			brief:
				'Replacement tag set. Omit or use {} to clear. Keys are limited to 256 UTF-8 bytes and values to 1024 UTF-8 bytes. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
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
	operands: [
		{
			placeholder: "workload-id",
			brief: "ID of the workload to update",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust cws workloads update",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["filter"] === undefined) {
						argv["filter"] = await promptForRequiredField(
							"filter",
							"Filter expression selecting the requests this workload matches. Maximum 4096 UTF-8 bytes."
						);
					}
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"Human-readable handle; unique per account."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust cws workloads update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cws/workloads/${argv["workload-id"] == null ? "<workload-id>" : encodeURIComponent(String(argv["workload-id"]))}`,
						pathParams: { "workload-id": String(argv["workload-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											description: resolveFileToken(
												argv["description"] as string | undefined,
												"description",
												"text"
											),
											filter: resolveFileToken(
												argv["filter"] as string | undefined,
												"filter",
												"text"
											),
											name: resolveFileToken(
												argv["name"] as string | undefined,
												"name",
												"text"
											),
											tags: parseJsonMap(argv["tags"], "tags"),
										},
										[["tags"]]
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
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							workload_id: argv["workload-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						description: resolveFileToken(
							argv["description"] as string | undefined,
							"description",
							"text"
						),
						filter: resolveFileToken(
							argv["filter"] as string | undefined,
							"filter",
							"text"
						),
						name: resolveFileToken(
							argv["name"] as string | undefined,
							"name",
							"text"
						),
						tags: parseJsonMap(argv["tags"], "tags"),
					},
					[["tags"]]
				);
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						workload_id: argv["workload-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
