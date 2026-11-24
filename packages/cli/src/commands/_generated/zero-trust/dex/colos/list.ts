import operation from "../../../_operations/zero-trust/dex/colos/list.js";
/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
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
	describe: "List Cloudflare colos",
	usage:
		"$0 zero-trust dex colos list\n\nList Cloudflare colos that account's devices were connected to during a time period, sorted by usage starting from the most used colo. Colos without traffic are also returned and sorted alphabetically.",
	flags: {
		from: {
			kind: "parsed",
			brief:
				"Start time for connection period in ISO (RFC3339 - ISO 8601) format.",
			parse: String,
		},
		to: {
			kind: "parsed",
			brief:
				"End time for connection period in ISO (RFC3339 - ISO 8601) format.",
			parse: String,
		},
		"sort-by": {
			kind: "enum",
			brief:
				"Type of usage that colos should be sorted by. If unspecified, returns all Cloudflare colos sorted alphabetically.",
			values: ["fleet-status-usage", "application-tests-usage"],
			optional: true,
		},
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
				command: "zero-trust dex colos list",
				classification: {
					safeFlags: ["sort-by", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					from: argv["from"],
					to: argv["to"],
					sortBy: argv["sort-by"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dex colos list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dex/colos`,
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
