import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/browser-run.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 browser-run devtools browser live-view create <session-id>\n\nGenerates time-limited URLs to view a remote browser session. Set `guardrails: { mode: 'readonly' }` to create a view-only link."
		)
		.positional("session-id", {
			type: "string",
			description: "Browser session ID",
			demandOption: true,
		})
		.option("expires-in-ms", {
			type: "number",
			description:
				"How long the live view URLs remain valid, in milliseconds. Default: 5 minutes. Max: 60 minutes.",
			default: 300000,
		})
		.option("guardrails-mode", {
			type: "string",
			description: "The guardrails.mode field",
			choices: ["readonly"],
		})
		.option("target-id", {
			type: "string",
			description:
				"Target ID (page) to connect to. If omitted, auto-resolves to the first active page.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.check((argv) => {
			const groupSet = ["guardrails-mode"].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = ["guardrails-mode"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --guardrails-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"brapi-post_DevtoolsLiveView">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <session-id>",
	describe: "Mint live view URLs for a browser session",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "browser-run devtools browser live-view create",
				classification: {
					safeFlags: ["guardrails-mode", "dry-run"],
				} satisfies ArgClassification<Args>,
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
											mode: resolveFileToken(
												argv["guardrails-mode"] as string | undefined,
												"guardrails-mode",
												"text"
											),
										},
										targetId: resolveFileToken(
											argv["target-id"] as string | undefined,
											"target-id",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.browserRun.devtools.browser.liveView.create({
							...bodyData,
							account_id: accountId,
							session_id: argv["session-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					expiresInMs: argv["expires-in-ms"],
					guardrails: {
						mode: resolveFileToken(
							argv["guardrails-mode"] as string | undefined,
							"guardrails-mode",
							"text"
						),
					},
					targetId: resolveFileToken(
						argv["target-id"] as string | undefined,
						"target-id",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.browserRun.devtools.browser.liveView.create({
						...bodyData,
						account_id: accountId,
						session_id: argv["session-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
