import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * decide command
 * @generated from apis/overlays/pay-per-use.ts
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
			"$0 pay-per-use proposals decide\n\nAccepts or rejects the pending pay-per-use price proposal identified by price_id in the request body. Acceptance requires an enabled operator with a verified name, an enabled publisher zone, and matching billing classifications; rejection remains available for cleanup."
		)
		.option("action", {
			type: "string",
			description: "The action field",
			choices: ["accept", "reject"],
		})
		.coerce("action", (value: string | undefined) =>
			resolveFileToken(value, "action", "text")
		)
		.option("price-id", {
			type: "number",
			description:
				"Pending pay-per-use price id returned in the operator proposal queue.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Pay-per-use operator proposal decision",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"pay-per-crawl.postPPUProposalDecision">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "decide",
	describe: "Decide a pay-per-use price proposal",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "pay-per-use proposals decide",
				classification: {
					safeFlags: ["action", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf pay-per-use proposals decide",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/pay-per-use/proposals`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										action: argv["action"],
										price_id: argv["price-id"],
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
						client.payPerUse.proposals.decide({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["action"] === undefined) {
					argv["action"] = await promptForRequiredEnumField(
						"action",
						"The action field",
						["accept", "reject"] as const
					);
				}
				if (argv["price-id"] === undefined) {
					throw new Error(
						"--price-id is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					action: argv["action"],
					price_id: argv["price-id"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.payPerUse.proposals.decide({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
