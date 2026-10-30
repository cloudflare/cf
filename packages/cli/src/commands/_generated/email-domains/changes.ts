import operation from "../_operations/email-domains/changes.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * changes command
 * @generated from apis/overlays/email-domains.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 email-domains changes\n\nReturns retained domain-specific state changes and completed-removal tombstones in a transaction-safe opaque order. The top-level platform field is the current shared gate and must be combined with each domain's state. Store next_cursor after processing every response, and continue immediately while has_more is true. To take a checkpoint, request this operation with modified_since set to the current time, follow has_more to the end, and save the final next_cursor; it replays every change committed after the first of those requests. Initial bootstrap and error 2086 recovery take a checkpoint, list the full inventory, then replay from the saved checkpoint, so changes made during the inventory are not lost. Only a tombstone proves that a domain was removed. Available only to the configured OpenAI pilot account behind a default-off gate; while the gate is off, the pilot account gets 503 with error 2090 and Retry-After, and existing domains are unaffected. Unsupported methods return 405 with error 2091. Authentication failures may use the gateway error envelope."
		)
		.option("per-page", {
			type: "number",
			description: "Maximum changes to return in one page.",
		})
		.option("cursor", {
			type: "string",
			description:
				"Opaque cursor returned by the previous change page. Omit it for the first page.",
		})
		.option("modified-since", {
			type: "string",
			description:
				"Optional RFC 3339 lower bound for the first request only. Values outside the retained history return error 2086. A value up to one minute ahead of the server clock is read as the current time; a later value returns 400.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "changes",
	describe: "List Email Domain changes",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-domains changes",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					per_page: argv["per-page"],
					cursor: argv["cursor"],
					modified_since: argv["modified-since"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-domains changes",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email/domain-changes`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { account_id: accountId, ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
