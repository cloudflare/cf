import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * launch command
 * @generated from apis/overlays/browser-run.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			'$0 browser-run devtools browser launch\n\nAcquires and establishes a WebSocket connection to a browser session. Session guardrails may be supplied in the `cf-brapi-guardrails` header as base64url-encoded JSON of the same `guardrails` object the POST body accepts (for example `{"allowedDomains":["*.example.com"]}`).'
		)
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
				"Optional base64url-encoded JSON session guardrails (allowedDomains and allowedDomainSets)",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "launch",
	describe: "Acquire and connect to browser session.",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "browser-run devtools browser launch",
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
						command: "cf browser-run devtools browser launch",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/browser-rendering/devtools/browser`,
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
					requestApi<unknown>(
						client,
						"GET",
						`/accounts/${accountId}/browser-rendering/devtools/browser`,
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
