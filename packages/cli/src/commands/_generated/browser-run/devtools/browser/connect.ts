import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * connect command
 * @generated from apis/overlays/browser-run.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 browser-run devtools browser connect <session-id>\n\nEstablishes a WebSocket connection to an existing browser session."
		)
		.positional("session-id", {
			type: "string",
			description: "Browser session ID to connect to.",
			demandOption: true,
		})
		.option("keep-alive", {
			type: "number",
			description:
				"Keep-alive time in ms (only valid when acquiring new session).",
		})
		.option("lab", {
			type: "boolean",
			description: "Use experimental browser.",
		})
		.option("recording", { type: "boolean", description: "Recording" })
		.option("cf-brapi-guardrails", {
			type: "string",
			description:
				"Optional base64url-encoded JSON connection guardrails (mode)",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "connect <session-id>",
	describe: "Connect to browser session.",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "browser-run devtools browser connect",
				classification: {
					safeFlags: ["lab", "recording", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					keep_alive: argv["keep-alive"],
					lab: argv["lab"],
					recording: argv["recording"],
				};

				const headers: Record<string, string> = {};
				if (argv["cf-brapi-guardrails"] !== undefined)
					headers["cf-brapi-guardrails"] = String(argv["cf-brapi-guardrails"]);
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf browser-run devtools browser connect",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/browser-rendering/devtools/browser/${argv["session-id"] == null ? "<session-id>" : encodeURIComponent(String(argv["session-id"]))}`,
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
					requestApi<unknown>(
						client,
						"GET",
						`/accounts/${accountId}/browser-rendering/devtools/browser/${encodeURIComponent(String(argv["session-id"]))}`,
						{
							query: queryParams,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
