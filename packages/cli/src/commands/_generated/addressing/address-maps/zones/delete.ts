import operation from "../../../_operations/addressing/address-maps/zones/delete.js";
/**
 * delete command
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
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "delete <member-zone-id>",
	describe: "Remove a zone membership from an Address Map",
	usage:
		"$0 addressing address-maps zones delete <member-zone-id>\n\nRemove a zone as a member of a particular address map.",
	flags: {
		"address-map-id": {
			kind: "parsed",
			brief: "Identifier of an Address Map.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "member-zone-id",
			brief: "Identifier of a zone.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "addressing address-maps zones delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf addressing address-maps zones delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/addressing/address_maps/${argv["address-map-id"] == null ? "<address-map-id>" : encodeURIComponent(String(argv["address-map-id"]))}/zones/${argv["member-zone-id"] == null ? "<member-zone-id>" : encodeURIComponent(String(argv["member-zone-id"]))}`,
						pathParams: {
							"address-map-id": String(argv["address-map-id"] ?? ""),
							"member-zone-id": String(argv["member-zone-id"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (!(await confirmDelete({ force: Boolean(argv.force) }))) {
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.send(operation, {
						account_id: accountId,
						address_map_id: argv["address-map-id"],
						member_zone_id: argv["member-zone-id"],
					})
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
