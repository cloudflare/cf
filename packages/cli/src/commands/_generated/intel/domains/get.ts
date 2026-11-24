import operation from "../../_operations/intel/domains/get.js";
/**
 * get command
 * @generated from apis/overlays/intel.ts
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
	command: "get",
	describe: "Get Domain Details",
	usage:
		"$0 intel domains get\n\nGets security details and statistics about a domain.",
	flags: {
		domain: { kind: "parsed", brief: "Domain", optional: true, parse: String },
		"skip-dns": {
			kind: "boolean",
			brief: "Skip DNS resolution lookups for faster response.",
			optional: true,
		},
		"skip-ranking": {
			kind: "boolean",
			brief:
				"Skip the domain ranking lookup for faster responses. Defaults to\n`false` (ranking is included). Set to `true` to opt out — primarily\nused by callers like Cloudflare Radar that need to avoid a\ncircular dependency when building the domain details page.\nNote: the bulk endpoint (`/intel/domain/bulk`) uses opposite\ndefaults — see `include_ranking` there.",
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
				command: "intel domains get",
				classification: {
					safeFlags: ["skip-dns", "skip-ranking", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					domain: argv["domain"],
					skip_dns: argv["skip-dns"],
					skip_ranking: argv["skip-ranking"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf intel domains get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/intel/domain`,
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
