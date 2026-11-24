import operation from "../../_operations/network-interconnects/slots/list.js";
/**
 * list command
 * @generated from apis/overlays/network-interconnects.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "list",
	describe: "Retrieve a list of all slots matching the specified parameters",
	usage:
		"$0 network-interconnects slots list\n\nLists all available infrastructure slots for the account, showing allocation status and capacity.",
	flags: {
		"address-contains": {
			kind: "parsed",
			brief:
				"If specified, only show slots with the given text in their address field",
			optional: true,
			parse: String,
		},
		site: {
			kind: "parsed",
			brief: "If specified, only show slots located at the given site",
			optional: true,
			parse: String,
		},
		speed: {
			kind: "parsed",
			brief: "If specified, only show slots that support the given speed",
			optional: true,
			parse: String,
		},
		occupied: {
			kind: "boolean",
			brief:
				"If specified, only show slots with a specific occupied/unoccupied state",
			optional: true,
		},
		cursor: { kind: "parsed", brief: "Cursor", optional: true, parse: Number },
		limit: { kind: "parsed", brief: "Limit", optional: true, parse: Number },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "network-interconnects slots list",
				classification: {
					safeFlags: ["occupied", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
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
					client.send(operation, { account_id: accountId, ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
