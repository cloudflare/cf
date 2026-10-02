import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * get command
 * @generated from apis/overlays/dns.ts
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
			"$0 dns settings account nameserver-sets get <nameserver-set-id>\n\nGets a Custom Nameserver Set owned by an account."
		)
		.positional("nameserver-set-id", {
			type: "string",
			description: "Identifier for a nameserver set.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"dns-settings-for-an-account-get-custom-nameserver-set">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <nameserver-set-id>",
	describe: "Get Custom Nameserver Set",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "dns settings account nameserver-sets get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf dns settings account nameserver-sets get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dns_settings/nameserver_sets/${argv["nameserver-set-id"] == null ? "<nameserver-set-id>" : encodeURIComponent(String(argv["nameserver-set-id"]))}`,
						pathParams: {
							"nameserver-set-id": String(argv["nameserver-set-id"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.dns.settings.account.nameserverSets.get({
						account_id: accountId,
						nameserver_set_id: argv["nameserver-set-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
