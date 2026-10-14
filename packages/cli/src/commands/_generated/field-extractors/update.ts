import operation from "../_operations/field-extractors/update.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/field-extractors.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 field-extractors update <extractor>\n\nReplaces all custom extraction rules for an extractor type. Omitted rules are deleted."
		)
		.positional("extractor", {
			type: "string",
			description: "Extractor type.",
			demandOption: true,
		})
		.option("rules", {
			type: "string",
			description:
				"The rules field. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Desired-state replacement of all rules for this extractor type.",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <extractor>",
	describe: "Update Field Extractor",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "field-extractors update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf field-extractors update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/field_extractors/${argv["extractor"] == null ? "<extractor>" : encodeURIComponent(String(argv["extractor"]))}`,
						pathParams: { extractor: String(argv["extractor"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										rules: parseObjectArray(argv["rules"], "rules"),
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
							extractor: argv["extractor"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["rules"] === undefined) {
					throw new Error(
						"--rules is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					rules: parseObjectArray(argv["rules"], "rules"),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						extractor: argv["extractor"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
