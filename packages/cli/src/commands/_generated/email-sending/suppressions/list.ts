import operation from "../../_operations/email-sending/suppressions/list.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * list command
 * @generated from apis/overlays/email-sending.ts
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
			"$0 email-sending suppressions list\n\nLists every active Email Sending suppression owned by the account: sending-domain suppressions first, then account-wide suppressions (including legacy rows with internal zone memberships). Each group is newest first."
		)
		.option("per-page", {
			type: "number",
			description: "Maximum number of suppressions to return per page.",
		})
		.option("cursor", {
			type: "string",
			description:
				"Opaque pagination cursor returned as `result_info.next_cursor`. It carries the filters that produced it.",
		})
		.option("email", {
			type: "string",
			description: "Exact email-address filter.",
		})
		.option("search", {
			type: "string",
			description:
				"A complete address is an exact match; a value ending in `@` matches that username across every domain. Prefix searches may return short intermediate pages while the bounded account scan advances.",
		})
		.option("reason", {
			type: "string",
			description: "Filter to suppressions with this reason.",
			choices: ["manual", "complaint", "hard_bounce", "soft_bounce", "policy"],
		})
		.option("scope-type", {
			type: "string",
			description:
				"Filter by scope: `account` returns only account-wide suppressions, `sending_domain` only sending-domain suppressions. Omit to list both, sending-domain suppressions first.",
			choices: ["account", "sending_domain"],
		})
		.option("scope-value", {
			type: "string",
			description:
				"Exact sending-domain filter. Requires `scope_type=sending_domain`.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List account Email Sending suppressions",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-sending suppressions list",
				classification: {
					safeFlags: ["reason", "scope-type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					per_page: argv["per-page"],
					cursor: argv["cursor"],
					email: argv["email"],
					search: argv["search"],
					reason: argv["reason"],
					scope_type: argv["scope-type"],
					scope_value: argv["scope-value"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-sending suppressions list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email/sending/suppressions`,
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
