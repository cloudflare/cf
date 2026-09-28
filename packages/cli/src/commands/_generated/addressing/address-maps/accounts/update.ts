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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/addressing.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 addressing address-maps accounts update <member-account-id>\n\nAdd an account as a member of a particular address map."
		)
		.positional("member-account-id", {
			type: "string",
			description: "Identifier of a Cloudflare account.",
			demandOption: true,
		})
		.option("address-map-id", {
			type: "string",
			description: "Identifier of an Address Map.",
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
	SdkRequest<"ip-address-management-address-maps-add-an-account-membership-to-an-address-map">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <member-account-id>",
	describe: "Add an account membership to an Address Map",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "addressing address-maps accounts update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf addressing address-maps accounts update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/addressing/address_maps/${argv["address-map-id"] == null ? "<address-map-id>" : encodeURIComponent(String(argv["address-map-id"]))}/accounts/${argv["member-account-id"] == null ? "<member-account-id>" : encodeURIComponent(String(argv["member-account-id"]))}`,
						pathParams: {
							"address-map-id": String(argv["address-map-id"] ?? ""),
							"member-account-id": String(argv["member-account-id"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Updating`, async () =>
					client.addressing.addressMaps.accounts.update({
						account_id: accountId,
						address_map_id: argv["address-map-id"],
						member_account_id: argv["member-account-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
