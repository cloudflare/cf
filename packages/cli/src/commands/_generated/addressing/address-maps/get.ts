import operation from "../../_operations/addressing/address-maps/get.js";
/**
 * get command
 * @generated from apis/overlays/addressing.ts
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
	command: "get <address-map-id>",
	describe: "Address Map Details",
	usage:
		"$0 addressing address-maps get <address-map-id>\n\nShow a particular address map owned by the account.",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "address-map-id",
			brief: "Identifier of an Address Map.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "addressing address-maps get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf addressing address-maps get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/addressing/address_maps/${argv["address-map-id"] == null ? "<address-map-id>" : encodeURIComponent(String(argv["address-map-id"]))}`,
						pathParams: {
							"address-map-id": String(argv["address-map-id"] ?? ""),
						},
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
						address_map_id: argv["address-map-id"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
