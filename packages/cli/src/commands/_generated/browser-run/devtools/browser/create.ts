import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
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
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 browser-run devtools browser create\n\nAcquires a browser and returns its session ID and websocket URL. Optionally accepts a JSON body with session guardrails to restrict outbound HTTP/S traffic."
		)
		.option("keep-alive", {
			type: "number",
			description: "Keep-alive time in milliseconds.",
		})
		.option("lab", {
			type: "boolean",
			description: "Use experimental browser.",
		})
		.option("targets", {
			type: "boolean",
			description: "Include browser targets in response.",
		})
		.option("live-view-url-expires-in-ms", {
			type: "number",
			description:
				"How long the live view URL remains valid, in milliseconds (max 60 minutes). Only used when targets is true.",
		})
		.option("recording", { type: "boolean", description: "Recording" })
		.option("guardrails-allowed-domain-sets", {
			type: "string",
			array: true,
			description:
				"Max 4 entries: curated preset names (common-cdns) and/or https URLs of newline-separated hostname lists.",
		})
		.option("guardrails-allowed-domains", {
			type: "string",
			array: true,
			description:
				"Hostname patterns, max 50. Supports exact hosts (example.com) or a single * wildcard anywhere. Prefer *.example.com (subdomain wildcard) over *example.com (prefix wildcard) to avoid matching overbroad lookalikes like evilexample.com.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"brapi-post_DevtoolsAcquire">;
type Body = Request;
type Query = SdkQuery<"brapi-post_DevtoolsAcquire">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Get a browser session ID.",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "browser-run devtools browser create",
				classification: {
					safeFlags: ["lab", "targets", "recording", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					keep_alive: argv["keep-alive"],
					lab: argv["lab"],
					targets: argv["targets"],
					liveViewUrlExpiresInMs: argv["live-view-url-expires-in-ms"],
					recording: argv["recording"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf browser-run devtools browser create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/browser-rendering/devtools/browser`,
						pathParams: {},
						query: queryParams,
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										guardrails: {
											allowedDomainSets: argv["guardrails-allowed-domain-sets"],
											allowedDomains: argv["guardrails-allowed-domains"],
										},
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const qs = new URLSearchParams(
						Object.entries(queryParams)
							.filter(([, v]) => v !== undefined)
							.map(([k, v]) => [k, String(v)])
					).toString();
					const result = await withProgress(`Creating`, async () =>
						client.browserRun.devtools.browser.create({
							...bodyData,
							account_id: accountId,
							...queryParams,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					guardrails: {
						allowedDomainSets: argv["guardrails-allowed-domain-sets"],
						allowedDomains: argv["guardrails-allowed-domains"],
					},
				});
				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const result = await withProgress(`Creating`, async () =>
					client.browserRun.devtools.browser.create({
						...bodyData,
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
