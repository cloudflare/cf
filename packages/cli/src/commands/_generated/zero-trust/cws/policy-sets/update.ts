import operation from "../../../_operations/zero-trust/cws/policy-sets/update.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseJsonMap,
	parseObjectArray,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust cws policy-sets update <policy-set-id>\n\nReplaces the policy set's configuration. Omit tags or use {} to clear them."
		)
		.positional("policy-set-id", {
			type: "string",
			description: "ID of the policy set to update",
			demandOption: true,
		})
		.option("description", {
			type: "string",
			description: "Optional free-form description.",
		})
		.option("exclude-workload-ids", {
			type: "string",
			array: true,
			description:
				"Replacement set of excluded workload IDs. Exclusions take precedence.",
		})
		.option("include-workload-ids", {
			type: "string",
			array: true,
			description:
				"Replacement set of included workload IDs. Empty or omitted includes all requests before exclusions.",
		})
		.option("name", { type: "string", description: "Name of the policy set" })
		.option("policies", {
			type: "string",
			description:
				"Replacement set of policies with per-membership enforcement mode. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("tags", {
			type: "string",
			description:
				"Replacement tag set. Omit or use {} to clear. Keys are limited to 256 UTF-8 bytes and values to 1024 UTF-8 bytes. Provide as a JSON object or @path/to/file.json.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <policy-set-id>",
	describe: "Update a policy set",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust cws policy-sets update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust cws policy-sets update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cws/policy-sets/${argv["policy-set-id"] == null ? "<policy-set-id>" : encodeURIComponent(String(argv["policy-set-id"]))}`,
						pathParams: {
							"policy-set-id": String(argv["policy-set-id"] ?? ""),
						},
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
											exclude_workload_ids: argv["exclude-workload-ids"],
											include_workload_ids: argv["include-workload-ids"],
											name: resolveFileToken(
												argv["name"] as string | undefined,
												"name",
												"text"
											),
											policies: parseObjectArray(argv["policies"], "policies"),
											tags: parseJsonMap(argv["tags"], "tags"),
										},
										[["tags"]]
									),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							policy_set_id: argv["policy-set-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Name of the policy set"
					);
				}
				if (argv["policies"] === undefined) {
					throw new Error(
						"--policies is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						description: resolveFileToken(
							argv["description"] as string | undefined,
							"description",
							"text"
						),
						exclude_workload_ids: argv["exclude-workload-ids"],
						include_workload_ids: argv["include-workload-ids"],
						name: resolveFileToken(
							argv["name"] as string | undefined,
							"name",
							"text"
						),
						policies: parseObjectArray(argv["policies"], "policies"),
						tags: parseJsonMap(argv["tags"], "tags"),
					},
					[["tags"]]
				);
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						policy_set_id: argv["policy-set-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
