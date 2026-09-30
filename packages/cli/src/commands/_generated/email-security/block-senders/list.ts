import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/email-security.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 email-security block-senders list\n\nReturns a paginated list of blocked email sender patterns. These patterns prevent emails from matching senders from being delivered. Supports filtering by pattern type and searching across patterns."
		)
		.option("page", {
			type: "number",
			description: "Current page within paginated list of results.",
		})
		.option("per-page", {
			type: "number",
			description: "The number of results per page. Maximum value is 1000.",
		})
		.option("search", {
			type: "string",
			description: "Search term for filtering records. Behavior may change.",
		})
		.option("order", {
			type: "string",
			description: "Field to sort by.",
			choices: ["pattern", "created_at"],
		})
		.option("direction", {
			type: "string",
			description: "The sorting direction.",
			choices: ["asc", "desc"],
		})
		.option("pattern-type", {
			type: "string",
			description: "Filter by pattern type.",
			choices: ["EMAIL", "DOMAIN", "IP", "UNKNOWN"],
		})
		.option("pattern", {
			type: "string",
			description: "Filter by pattern value.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"email_security_list_blocked_senders">;
type Query = SdkQuery<"email_security_list_blocked_senders">;

const typedBuilder = withArgTypes<
	{
		order: Query["order"];
		direction: Query["direction"];
		"pattern-type": Query["pattern_type"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List blocked email senders",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security block-senders list",
				classification: {
					safeFlags: ["order", "direction", "pattern-type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					page: argv["page"],
					per_page: argv["per-page"],
					search: argv["search"],
					order: argv["order"],
					direction: argv["direction"],
					pattern_type: argv["pattern-type"],
					pattern: argv["pattern"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security block-senders list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/settings/block_senders`,
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
					client.emailSecurity.blockSenders.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, {
					successLabel: `Loaded`,
					paginationQuery: queryParams,
				});
			}
		),
};

export default command;
