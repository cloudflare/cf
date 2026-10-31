import operation from "../../../../_operations/zero-trust/dlp/email/rules/bulk-edit.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * bulk-edit command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust dlp email rules bulk-edit\n\nReorders DLP email scanning rules by updating their priority values. Higher priority rules are evaluated first."
		)
		.option("new-priorities", {
			type: "string",
			description:
				"The new_priorities field. Provide as a JSON object or @path/to/file.json.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Rule priorities.",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "bulk-edit",
	describe: "Update email scanner rule priorities",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dlp email rules bulk-edit",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dlp email rules bulk-edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dlp/email/rules`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body, [
										{ path: ["new_priorities"], flag: "new-priorities" },
									])
								: compactBody(
										{
											new_priorities: parseJsonMap(
												argv["new-priorities"],
												"new-priorities",
												true
											),
										},
										[["new_priorities"]]
									),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body, [
						{ path: ["new_priorities"], flag: "new-priorities" },
					]);
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["new-priorities"] === undefined) {
					throw new Error(
						"--new-priorities is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						new_priorities: parseJsonMap(
							argv["new-priorities"],
							"new-priorities",
							true
						),
					},
					[["new_priorities"]]
				);
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
