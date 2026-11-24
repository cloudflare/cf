import operation from "../../../../_operations/zero-trust/dex/overview/tests/list.js";
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
	describe: "List DEX test analytics",
	usage:
		"$0 zero-trust dex overview tests list\n\nList DEX tests with overview metrics.",
	flags: {
		colo: {
			kind: "parsed",
			brief:
				"Optionally filter result stats to a Cloudflare colo. Cannot be used in combination with deviceId param.",
			optional: true,
			parse: String,
		},
		"test-name": {
			kind: "parsed",
			brief: "Optionally filter results by test name.",
			optional: true,
			parse: String,
		},
		"device-id": {
			kind: "parsed",
			brief:
				"Optionally filter result stats to a specific device(s). Cannot be used in combination with colo param.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"registration-id": {
			kind: "parsed",
			brief:
				"Optionally filter results to a specific device registration. Must be used in combination with a single deviceId.",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Page number of paginated results",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of items per page",
			optional: true,
			parse: Number,
		},
		kind: {
			kind: "enum",
			brief: "Filter by test type.",
			values: ["http", "traceroute"],
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
				command: "zero-trust dex overview tests list",
				classification: {
					safeFlags: ["kind", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					colo: argv["colo"],
					testName: argv["test-name"],
					deviceId: argv["device-id"],
					registration_id: argv["registration-id"],
					page: argv["page"],
					per_page: argv["per-page"],
					kind: argv["kind"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dex overview tests list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dex/tests/overview`,
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
