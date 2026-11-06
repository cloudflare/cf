import operation from "../../../../_operations/cloudforce-one/threat-intel/datasets/preferences/update.js";
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
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one threat-intel datasets preferences update\n\nSets the datasets to use when a request omits `datasetId`, for you (`scope` `user`) or for the account (`scope` `account`). Your own default datasets take precedence over the account's. Every dataset must exist and be readable by the account."
		)
		.option("dataset-ids", {
			type: "string",
			array: true,
			description:
				"The dataset UUIDs to use when a request omits `datasetId`: 1 to 50 datasets you can read. Duplicates are ignored.",
		})
		.option("scope", {
			type: "string",
			description:
				"`user` sets your own default datasets. `account` sets the default datasets for everyone in the account who has not set their own, and requires permission to edit the account's Cloudforce One settings.",
			choices: ["user", "account"],
		})
		.coerce("scope", (value) => resolveFileToken(value, "scope", "text"))
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
	command: "update",
	describe: "Set default datasets",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-intel datasets preferences update",
				classification: {
					safeFlags: ["scope", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf cloudforce-one threat-intel datasets preferences update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/datasets/preferences`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										datasetIds: argv["dataset-ids"],
										scope: argv["scope"],
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
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["dataset-ids"] === undefined) {
					throw new Error(
						"--dataset-ids is required (or pass --body with this field set)."
					);
				}
				if (argv["scope"] === undefined) {
					argv["scope"] = await promptForRequiredEnumField(
						"scope",
						"\`user\` sets your own default datasets. \`account\` sets the default datasets for everyone in the account who has not set their own, and requires permission to edit the account's Cloudforce One settings.",
						["user", "account"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					datasetIds: argv["dataset-ids"],
					scope: argv["scope"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
