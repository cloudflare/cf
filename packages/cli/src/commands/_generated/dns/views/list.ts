import operation from "../../_operations/dns/views/list.js";
/**
 * list command
 * @generated from apis/overlays/dns.ts
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
	describe: "List Internal DNS Views",
	usage: "$0 dns views list\n\nList DNS Internal Views for an Account",
	flags: {
		name: {
			kind: "parsed",
			brief:
				"Exact value of the DNS view name. This is a convenience alias for `name.exact`.",
			optional: true,
			parse: String,
		},
		"name-exact": {
			kind: "parsed",
			brief: "Exact value of the DNS view name.",
			optional: true,
			parse: String,
		},
		"name-contains": {
			kind: "parsed",
			brief: "Substring of the DNS view name.",
			optional: true,
			parse: String,
		},
		"name-startswith": {
			kind: "parsed",
			brief: "Prefix of the DNS view name.",
			optional: true,
			parse: String,
		},
		"name-endswith": {
			kind: "parsed",
			brief: "Suffix of the DNS view name.",
			optional: true,
			parse: String,
		},
		"zone-id": {
			kind: "parsed",
			brief: "A zone ID that exists in the zones list for the view.",
			optional: true,
			parse: String,
		},
		"zone-name": {
			kind: "parsed",
			brief: "A zone name that exists in the zones list for the view.",
			optional: true,
			parse: String,
		},
		match: {
			kind: "enum",
			brief:
				"Whether to match all search requirements or at least one (any). If set to `all`, acts like a logical AND between filters. If set to `any`, acts like a logical OR instead.",
			values: ["any", "all"],
			optional: true,
		},
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results per page.",
			optional: true,
			parse: Number,
		},
		order: {
			kind: "enum",
			brief: "Field to order DNS views by.",
			values: ["name", "created_on", "modified_on"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "Direction to order DNS views in.",
			values: ["asc", "desc"],
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
				command: "dns views list",
				classification: {
					safeFlags: ["match", "order", "direction", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					name: argv["name"],
					"name.exact": argv["name-exact"],
					"name.contains": argv["name-contains"],
					"name.startswith": argv["name-startswith"],
					"name.endswith": argv["name-endswith"],
					zone_id: argv["zone-id"],
					zone_name: argv["zone-name"],
					match: argv["match"],
					page: argv["page"],
					per_page: argv["per-page"],
					order: argv["order"],
					direction: argv["direction"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf dns views list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dns_settings/views`,
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
