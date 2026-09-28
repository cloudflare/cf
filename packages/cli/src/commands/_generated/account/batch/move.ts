import { createCommandClient } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * move command
 * @generated from apis/overlays/account.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 account batch move\n\nBatch move a collection of accounts to a specific organization. ⚠️ Not implemented."
		)
		.option("account-ids", {
			type: "string",
			array: true,
			description: "Move these accounts to the destination organization.",
		})
		.option("destination-organization-id", {
			type: "string",
			description: "Move accounts to this organization ID.",
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

type Request = SdkRequest<"Accounts_batchMoveAccounts">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "move",
	describe: "Batch move accounts",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "account batch move",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf account batch move",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/move`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										account_ids: argv["account-ids"],
										destination_organization_id: resolveFileToken(
											argv["destination-organization-id"] as string | undefined,
											"destination-organization-id",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.account.batch.move({ ...bodyData } satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["account-ids"] === undefined) {
					throw new Error(
						"--account-ids is required (or pass --body with this field set)."
					);
				}
				if (argv["destination-organization-id"] === undefined) {
					argv["destination-organization-id"] = await promptForRequiredField(
						"destination-organization-id",
						"Move accounts to this organization ID."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					account_ids: argv["account-ids"],
					destination_organization_id: resolveFileToken(
						argv["destination-organization-id"] as string | undefined,
						"destination-organization-id",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.account.batch.move({ ...bodyData } satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
