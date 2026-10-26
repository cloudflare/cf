import operation from "../../../../_operations/zero-trust/dlp/validators/worker/update.js";
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
import { compactBody, parseBody, parseScalarValue } from "#lib/body-parser.js";
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
			"$0 zero-trust dlp validators worker update <validator-id>\n\nReplaces the name, script tag and fallback verdict of a `worker` validator. Attachments to detection entries are owned from the entry side and are not affected."
		)
		.positional("validator-id", {
			type: "string",
			description: "Validator ID",
			demandOption: true,
		})
		.option("default", {
			type: "string",
			description:
				"The default field. Accepts a JSON scalar or plain string, or @path/to/file.",
		})
		.option("name", {
			type: "string",
			description: "A name for this validator, at most 50 characters.",
		})
		.option("script-tag", {
			type: "string",
			description:
				"The public script tag of the customer's Worker that scores matches.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Attributes of the validator to update.",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <validator-id>",
	describe: "Update a worker validator",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dlp validators worker update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dlp validators worker update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dlp/validators/worker/${argv["validator-id"] == null ? "<validator-id>" : encodeURIComponent(String(argv["validator-id"]))}`,
						pathParams: { "validator-id": String(argv["validator-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										default: parseScalarValue(argv["default"], "default"),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										script_tag: resolveFileToken(
											argv["script-tag"] as string | undefined,
											"script-tag",
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
							validator_id: argv["validator-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"A name for this validator, at most 50 characters."
					);
				}
				if (argv["script-tag"] === undefined) {
					argv["script-tag"] = await promptForRequiredField(
						"script-tag",
						"The public script tag of the customer's Worker that scores matches."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					default: parseScalarValue(argv["default"], "default"),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					script_tag: resolveFileToken(
						argv["script-tag"] as string | undefined,
						"script-tag",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						validator_id: argv["validator-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
