import operation from "../../../_operations/billing/spend-policies/audit/list.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * list command
 * @generated from apis/overlays/billing.ts
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
			"$0 billing spend-policies audit list\n\nReturns the policy's evaluation history, newest first. At most one entry is recorded per trigger (`approaching_limit` or `limit_reached`), policy version and billing period, so a policy update can record a new entry without any change in balance. Disabled policies still return their history; deleted policies return `404`. There is no pagination: use `limit` to set how many entries come back."
		)
		.option("policy-id", {
			type: "string",
			description: "Identifies the spend policy.",
			demandOption: true,
		})
		.option("limit", {
			type: "number",
			description:
				"Maximum number of audit entries to return. Defaults to 50. Values above 100 are capped at 100 rather than rejected.",
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
	describe: "List Spend Policy Audit Entries",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "billing spend-policies audit list",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					limit: argv["limit"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf billing spend-policies audit list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/billing/spend-policies/${argv["policy-id"] == null ? "<policy-id>" : encodeURIComponent(String(argv["policy-id"]))}/audit`,
						pathParams: { "policy-id": String(argv["policy-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						account_id: accountId,
						policy_id: argv["policy-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
