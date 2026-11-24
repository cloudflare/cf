import operation from "../../../_operations/browser-run/devtools/browser/create.js";
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
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Get a browser session ID.",
	usage:
		"$0 browser-run devtools browser create\n\nAcquires a browser and returns its session ID and websocket URL. Optionally accepts a JSON body with session guardrails to restrict outbound HTTP/S traffic.",
	flags: {
		"keep-alive": {
			kind: "parsed",
			brief: "Keep-alive time in milliseconds.",
			optional: true,
			parse: Number,
		},
		lab: {
			kind: "boolean",
			brief: "Use experimental browser.",
			optional: true,
		},
		targets: {
			kind: "boolean",
			brief: "Include browser targets in response.",
			optional: true,
		},
		"live-view-url-expires-in-ms": {
			kind: "parsed",
			brief:
				"How long the live view URL remains valid, in milliseconds (max 60 minutes). Only used when targets is true.",
			optional: true,
			parse: Number,
		},
		recording: { kind: "boolean", brief: "Recording", optional: true },
		"guardrails-allowed-domain-sets": {
			kind: "parsed",
			brief:
				"Max 4 entries: curated preset names (common-cdns) and/or https URLs of newline-separated hostname lists.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"guardrails-allowed-domains": {
			kind: "parsed",
			brief:
				"Hostname patterns, max 50. Supports exact hosts (example.com) or a single * wildcard anywhere. Prefer *.example.com (subdomain wildcard) over *example.com (prefix wildcard) to avoid matching overbroad lookalikes like evilexample.com.",
			variadic: true,
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
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "browser-run devtools browser create",
				classification: {
					safeFlags: ["lab", "targets", "recording", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
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
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const qs = new URLSearchParams(
						Object.entries(queryParams)
							.filter(([, v]) => v !== undefined)
							.map(([k, v]) => [k, String(v)])
					).toString();
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							...queryParams,
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
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
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
