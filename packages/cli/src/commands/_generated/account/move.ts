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
			"$0 account move\n\nMove an account within an organization hierarchy or an account outside an organization. (Currently in Public Beta - see https://developers.cloudflare.com/fundamentals/organizations/)"
		)
		.option("destination-organization-id", {
			type: "string",
			description: "The destination_organization_id field",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"The destination organization ID is where the account is to be moved.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"Accounts_moveAccounts">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "move",
	describe: "Move account",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "account move",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf account move",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/move`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
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
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.account.move({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["destination-organization-id"] === undefined) {
					argv["destination-organization-id"] = await promptForRequiredField(
						"destination-organization-id",
						"The destination_organization_id field"
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					destination_organization_id: resolveFileToken(
						argv["destination-organization-id"] as string | undefined,
						"destination-organization-id",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.account.move({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
