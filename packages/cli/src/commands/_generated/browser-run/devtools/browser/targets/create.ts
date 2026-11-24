import operation from "../../../../_operations/browser-run/devtools/browser/targets/create.js";
/**
 * create command
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
	command: "create <session-id>",
	describe: "Open a new browser tab.",
	usage:
		"$0 browser-run devtools browser targets create <session-id>\n\nOpens a new tab in the browser. Optionally specify a URL to navigate to.",
	flags: {
		url: { kind: "parsed", brief: "Url", optional: true, parse: String },
		"live-view-url-expires-in-ms": {
			kind: "parsed",
			brief:
				"How long the live view URL remains valid, in milliseconds (max 60 minutes)",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "session-id", brief: "Browser session ID.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "browser-run devtools browser targets create",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					url: argv["url"],
					liveViewUrlExpiresInMs: argv["live-view-url-expires-in-ms"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf browser-run devtools browser targets create",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/browser-rendering/devtools/browser/${argv["session-id"] == null ? "<session-id>" : encodeURIComponent(String(argv["session-id"]))}/json/new`,
						pathParams: { "session-id": String(argv["session-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						account_id: accountId,
						session_id: argv["session-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
