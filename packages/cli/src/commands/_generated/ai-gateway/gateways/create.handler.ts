import operation from "../../_operations/ai-gateway/gateways/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "ai-gateway gateways create",
			classification: {
				safeFlags: [
					"authentication",
					"byok-only",
					"cache-invalidate-on-update",
					"collect-logs",
					"guardrails-prompt-p1",
					"guardrails-prompt-s1",
					"guardrails-prompt-s10",
					"guardrails-prompt-s11",
					"guardrails-prompt-s12",
					"guardrails-prompt-s13",
					"guardrails-prompt-s14",
					"guardrails-prompt-s2",
					"guardrails-prompt-s3",
					"guardrails-prompt-s4",
					"guardrails-prompt-s5",
					"guardrails-prompt-s6",
					"guardrails-prompt-s7",
					"guardrails-prompt-s8",
					"guardrails-prompt-s9",
					"guardrails-response-p1",
					"guardrails-response-s1",
					"guardrails-response-s10",
					"guardrails-response-s11",
					"guardrails-response-s12",
					"guardrails-response-s13",
					"guardrails-response-s14",
					"guardrails-response-s2",
					"guardrails-response-s3",
					"guardrails-response-s4",
					"guardrails-response-s5",
					"guardrails-response-s6",
					"guardrails-response-s7",
					"guardrails-response-s8",
					"guardrails-response-s9",
					"log-classification",
					"log-management-strategy",
					"logpush",
					"multiprovider-enabled",
					"rate-limiting-technique",
					"retry-backoff",
					"spend-limits-enabled",
					"workers-ai-billing-mode",
					"zdr",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["cache-invalidate-on-update"] === undefined) {
					throw new Error(
						"--cache-invalidate-on-update is required (or pass --body with this field set)."
					);
				}
				if (argv["cache-ttl"] === undefined) {
					throw new Error(
						"--cache-ttl is required (or pass --body with this field set)."
					);
				}
				if (argv["collect-logs"] === undefined) {
					throw new Error(
						"--collect-logs is required (or pass --body with this field set)."
					);
				}
				if (argv["id"] === undefined) {
					argv["id"] = await promptForRequiredField(
						"id",
						"Unique identifier of the AI Gateway within the account."
					);
				}
				if (argv["rate-limiting-interval"] === undefined) {
					throw new Error(
						"--rate-limiting-interval is required (or pass --body with this field set)."
					);
				}
				if (argv["rate-limiting-limit"] === undefined) {
					throw new Error(
						"--rate-limiting-limit is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf ai-gateway gateways create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-gateway/gateways`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									authentication: argv["authentication"],
									byok_only: argv["byok-only"],
									cache_invalidate_on_update:
										argv["cache-invalidate-on-update"],
									cache_ttl: argv["cache-ttl"],
									collect_logs: argv["collect-logs"],
									guardrails: {
										prompt: {
											P1: argv["guardrails-prompt-p1"],
											S1: argv["guardrails-prompt-s1"],
											S10: argv["guardrails-prompt-s10"],
											S11: argv["guardrails-prompt-s11"],
											S12: argv["guardrails-prompt-s12"],
											S13: argv["guardrails-prompt-s13"],
											S14: argv["guardrails-prompt-s14"],
											S2: argv["guardrails-prompt-s2"],
											S3: argv["guardrails-prompt-s3"],
											S4: argv["guardrails-prompt-s4"],
											S5: argv["guardrails-prompt-s5"],
											S6: argv["guardrails-prompt-s6"],
											S7: argv["guardrails-prompt-s7"],
											S8: argv["guardrails-prompt-s8"],
											S9: argv["guardrails-prompt-s9"],
										},
										response: {
											P1: argv["guardrails-response-p1"],
											S1: argv["guardrails-response-s1"],
											S10: argv["guardrails-response-s10"],
											S11: argv["guardrails-response-s11"],
											S12: argv["guardrails-response-s12"],
											S13: argv["guardrails-response-s13"],
											S14: argv["guardrails-response-s14"],
											S2: argv["guardrails-response-s2"],
											S3: argv["guardrails-response-s3"],
											S4: argv["guardrails-response-s4"],
											S5: argv["guardrails-response-s5"],
											S6: argv["guardrails-response-s6"],
											S7: argv["guardrails-response-s7"],
											S8: argv["guardrails-response-s8"],
											S9: argv["guardrails-response-s9"],
										},
									},
									id: resolveFileToken(
										argv["id"] as string | undefined,
										"id",
										"text"
									),
									log_classification: argv["log-classification"],
									log_management: argv["log-management"],
									log_management_strategy: argv["log-management-strategy"],
									logpush: argv["logpush"],
									logpush_public_key: resolveFileToken(
										argv["logpush-public-key"] as string | undefined,
										"logpush-public-key",
										"text"
									),
									multiprovider_enabled: argv["multiprovider-enabled"],
									otel: parseObjectArray(argv["otel"], "otel", true),
									rate_limiting_interval: argv["rate-limiting-interval"],
									rate_limiting_limit: argv["rate-limiting-limit"],
									rate_limiting_technique: argv["rate-limiting-technique"],
									retry_backoff: argv["retry-backoff"],
									retry_delay: argv["retry-delay"],
									retry_max_attempts: argv["retry-max-attempts"],
									spend_limits: {
										enabled: argv["spend-limits-enabled"],
										rules: parseObjectArray(
											argv["spend-limits-rules"],
											"spend-limits-rules"
										),
									},
									store_id: resolveFileToken(
										argv["store-id"] as string | undefined,
										"store-id",
										"text"
									),
									stripe: {
										authorization: resolveFileToken(
											argv["stripe-authorization"] as string | undefined,
											"stripe-authorization",
											"text"
										),
										usage_events: parseObjectArray(
											argv["stripe-usage-events"],
											"stripe-usage-events"
										),
									},
									workers_ai_billing_mode: argv["workers-ai-billing-mode"],
									zdr: argv["zdr"],
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
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				authentication: argv["authentication"],
				byok_only: argv["byok-only"],
				cache_invalidate_on_update: argv["cache-invalidate-on-update"],
				cache_ttl: argv["cache-ttl"],
				collect_logs: argv["collect-logs"],
				guardrails: {
					prompt: {
						P1: argv["guardrails-prompt-p1"],
						S1: argv["guardrails-prompt-s1"],
						S10: argv["guardrails-prompt-s10"],
						S11: argv["guardrails-prompt-s11"],
						S12: argv["guardrails-prompt-s12"],
						S13: argv["guardrails-prompt-s13"],
						S14: argv["guardrails-prompt-s14"],
						S2: argv["guardrails-prompt-s2"],
						S3: argv["guardrails-prompt-s3"],
						S4: argv["guardrails-prompt-s4"],
						S5: argv["guardrails-prompt-s5"],
						S6: argv["guardrails-prompt-s6"],
						S7: argv["guardrails-prompt-s7"],
						S8: argv["guardrails-prompt-s8"],
						S9: argv["guardrails-prompt-s9"],
					},
					response: {
						P1: argv["guardrails-response-p1"],
						S1: argv["guardrails-response-s1"],
						S10: argv["guardrails-response-s10"],
						S11: argv["guardrails-response-s11"],
						S12: argv["guardrails-response-s12"],
						S13: argv["guardrails-response-s13"],
						S14: argv["guardrails-response-s14"],
						S2: argv["guardrails-response-s2"],
						S3: argv["guardrails-response-s3"],
						S4: argv["guardrails-response-s4"],
						S5: argv["guardrails-response-s5"],
						S6: argv["guardrails-response-s6"],
						S7: argv["guardrails-response-s7"],
						S8: argv["guardrails-response-s8"],
						S9: argv["guardrails-response-s9"],
					},
				},
				id: resolveFileToken(argv["id"] as string | undefined, "id", "text"),
				log_classification: argv["log-classification"],
				log_management: argv["log-management"],
				log_management_strategy: argv["log-management-strategy"],
				logpush: argv["logpush"],
				logpush_public_key: resolveFileToken(
					argv["logpush-public-key"] as string | undefined,
					"logpush-public-key",
					"text"
				),
				multiprovider_enabled: argv["multiprovider-enabled"],
				otel: parseObjectArray(argv["otel"], "otel", true),
				rate_limiting_interval: argv["rate-limiting-interval"],
				rate_limiting_limit: argv["rate-limiting-limit"],
				rate_limiting_technique: argv["rate-limiting-technique"],
				retry_backoff: argv["retry-backoff"],
				retry_delay: argv["retry-delay"],
				retry_max_attempts: argv["retry-max-attempts"],
				spend_limits: {
					enabled: argv["spend-limits-enabled"],
					rules: parseObjectArray(
						argv["spend-limits-rules"],
						"spend-limits-rules"
					),
				},
				store_id: resolveFileToken(
					argv["store-id"] as string | undefined,
					"store-id",
					"text"
				),
				stripe: {
					authorization: resolveFileToken(
						argv["stripe-authorization"] as string | undefined,
						"stripe-authorization",
						"text"
					),
					usage_events: parseObjectArray(
						argv["stripe-usage-events"],
						"stripe-usage-events"
					),
				},
				workers_ai_billing_mode: argv["workers-ai-billing-mode"],
				zdr: argv["zdr"],
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
