import operation from "../../../_operations/browser-run/recording/network/get.js";
/**
 * get command
 * @generated from apis/overlays/browser-run.ts
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
	command: "get <session-id>",
	describe: "Get network recording data.",
	usage:
		"$0 browser-run recording network get <session-id>\n\nReturns network recording events for the requested target ID. Use ?format=har for a HAR JSON document.",
	flags: {
		format: {
			kind: "parsed",
			brief: "Set to `har` to return a HAR JSON document.",
			optional: true,
			parse: String,
		},
		target: {
			kind: "parsed",
			brief: "Target ID to include in the response.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "session-id", brief: "Session ID.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "browser-run recording network get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					format: argv["format"],
					target: argv["target"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf browser-run recording network get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/browser-rendering/recording/${argv["session-id"] == null ? "<session-id>" : encodeURIComponent(String(argv["session-id"]))}/network`,
						pathParams: { "session-id": String(argv["session-id"] ?? "") },
						query: queryParams,
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
						session_id: argv["session-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
