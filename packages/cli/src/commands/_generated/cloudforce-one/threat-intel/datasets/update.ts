import operation from "../../../_operations/cloudforce-one/threat-intel/datasets/update.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
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
			"$0 cloudforce-one threat-intel datasets update <dataset-id>\n\nUpdates a dataset's `name` and `isPublic` setting. Both fields are required."
		)
		.positional("dataset-id", {
			type: "string",
			description: "Dataset ID.",
			demandOption: true,
		})
		.option("is-public", {
			type: "boolean",
			description:
				"If true, then anyone can search the dataset. If false, then its limited to the account.",
		})
		.option("name", {
			type: "string",
			description: "Used to describe the dataset within the account context.",
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
	command: "update <dataset-id>",
	describe: "Update a dataset",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-intel datasets update",
				classification: {
					safeFlags: ["is-public", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-intel datasets update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/dataset/${argv["dataset-id"] == null ? "<dataset-id>" : encodeURIComponent(String(argv["dataset-id"]))}`,
						pathParams: { "dataset-id": String(argv["dataset-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										isPublic: argv["is-public"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
									}),
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
							dataset_id: argv["dataset-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["is-public"] === undefined) {
					throw new Error(
						"--is-public is required (or pass --body with this field set)."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Used to describe the dataset within the account context."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					isPublic: argv["is-public"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						dataset_id: argv["dataset-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
