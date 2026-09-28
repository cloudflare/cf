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
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/network-interconnects.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 network-interconnects slots list\n\nLists all available infrastructure slots for the account, showing allocation status and capacity."
		)
		.option("address-contains", {
			type: "string",
			description:
				"If specified, only show slots with the given text in their address field",
		})
		.option("site", {
			type: "string",
			description: "If specified, only show slots located at the given site",
		})
		.option("speed", {
			type: "string",
			description: "If specified, only show slots that support the given speed",
		})
		.option("occupied", {
			type: "boolean",
			description:
				"If specified, only show slots with a specific occupied/unoccupied state",
		})
		.option("cursor", { type: "number", description: "Cursor" })
		.option("limit", { type: "number", description: "Limit" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"list_slots">;
type Query = SdkQuery<"list_slots">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "Retrieve a list of all slots matching the specified parameters",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "network-interconnects slots list",
				classification: {
					safeFlags: ["occupied", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					address_contains: argv["address-contains"],
					site: argv["site"],
					speed: argv["speed"],
					occupied: argv["occupied"],
					cursor: argv["cursor"],
					limit: argv["limit"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf network-interconnects slots list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cni/slots`,
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
					client.networkInterconnects.slots.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
