import operation from "../../../../_operations/browser-run/devtools/browser/live-view/create.js";
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
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create <session-id>",
	describe: "Mint live view URLs for a browser session",
	usage:
		"$0 browser-run devtools browser live-view create <session-id>\n\nGenerates time-limited URLs to view a remote browser session. Set `guardrails: { mode: 'readonly' }` to create a view-only link.",
	flags: {
		"expires-in-ms": {
			kind: "parsed",
			brief:
				"How long the live view URLs remain valid, in milliseconds. Default: 5 minutes. Max: 60 minutes.",
			default: "300000",
			parse: Number,
		},
		"guardrails-mode": {
			kind: "parsed",
			brief: "The guardrails.mode field",
			optional: true,
			choices: ["readonly"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-mode", "text"),
		},
		"view-mode": {
			kind: "parsed",
			brief:
				"UI mode: 'devtools' (Chrome DevTools), 'tab' (single tab view), 'full' (multi-tab browser)",
			default: "devtools",
			choices: ["devtools", "tab", "full"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "view-mode", "text"),
		},
		"target-id": {
			kind: "parsed",
			brief:
				"Target ID (page) to connect to. If omitted, auto-resolves to the first active page.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "session-id", brief: "Browser session ID", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "browser-run devtools browser live-view create",
				classification: {
					safeFlags: ["guardrails-mode", "view-mode", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf browser-run devtools browser live-view create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/browser-rendering/devtools/browser/${argv["session-id"] == null ? "<session-id>" : encodeURIComponent(String(argv["session-id"]))}/live_view`,
						pathParams: { "session-id": String(argv["session-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										expiresInMs: argv["expires-in-ms"],
										guardrails: {
											mode: argv["guardrails-mode"],
										},
										mode: argv["view-mode"],
										targetId: resolveFileToken(
											argv["target-id"] as string | undefined,
											"target-id",
											"text"
										),
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							session_id: argv["session-id"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					expiresInMs: argv["expires-in-ms"],
					guardrails: {
						mode: argv["guardrails-mode"],
					},
					mode: argv["view-mode"],
					targetId: resolveFileToken(
						argv["target-id"] as string | undefined,
						"target-id",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						session_id: argv["session-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
