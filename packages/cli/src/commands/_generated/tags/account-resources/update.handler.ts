import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import {
	createCommandClient,
	getAccountId,
	getZoneId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, setNestedValue } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "tags account-resources update",
			classification: {
				safeFlags: ["resource-type", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const headers: Record<string, string> = {};
			if (argv["if-match"] !== undefined)
				headers["If-Match"] = String(argv["if-match"]);
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["resource-id"] === undefined) {
					argv["resource-id"] = await promptForRequiredField(
						"resource-id",
						"Identifies the unique resource."
					);
				}
				if (argv["resource-type"] === undefined) {
					argv["resource-type"] = await promptForRequiredEnumField(
						"resource-type",
						"Variant descriptions: - \`worker_version\`: Enum for worker_version resource type. - \`access_application\`, \`access_group\`, \`access_service_token\`, \`account\`, \`account_ruleset\`, \`ai_gateway\`, \`ai_search_instance\`, \`ai_search_namespace\`, \`alerting_policy\`, \`alerting_webhook\`, \`app_library_application\`, \`cloudflared_tunnel\`, \`cws_deployment\`, \`cws_policy\`, \`cws_policy_set\`, \`cws_workload\`, \`d1_database\`, \`device\`, \`durable_object_namespace\`, \`gateway_list\`, \`gateway_rule\`, \`image\`, \`infrastructure_target\`, \`kv_namespace\`, \`load_balancer_monitor\`, \`load_balancer_pool\`, \`namespace_worker\`, \`pages_project\`, \`queue\`, \`r2_bucket\`, \`resource_share\`, \`stream_live_input\`, \`stream_video\`, \`vectorize_index\`, \`worker\`: Enum for base account-level resource types (those with no extra required fields).",
						[
							"worker_version",
							"access_application",
							"access_group",
							"access_service_token",
							"account",
							"account_ruleset",
							"ai_gateway",
							"ai_search_instance",
							"ai_search_namespace",
							"alerting_policy",
							"alerting_webhook",
							"app_library_application",
							"cloudflared_tunnel",
							"cws_deployment",
							"cws_policy",
							"cws_policy_set",
							"cws_workload",
							"d1_database",
							"device",
							"durable_object_namespace",
							"gateway_list",
							"gateway_rule",
							"image",
							"infrastructure_target",
							"kv_namespace",
							"load_balancer_monitor",
							"load_balancer_pool",
							"namespace_worker",
							"pages_project",
							"queue",
							"r2_bucket",
							"resource_share",
							"stream_live_input",
							"stream_video",
							"vectorize_index",
							"worker",
						] as const
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId =
					argv.zone === undefined ? await resolveAccountIdSilent() : undefined;
				const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
				const accountOrZoneId =
					argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
				formatDryRun({
					command: "cf tags account-resources update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/tags`,
					pathParams: {
						"account-or-zone": String(accountOrZone),
						"account-or-zone-id": String(accountOrZoneId),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									resource_id: resolveFileToken(
										argv["resource-id"] as string | undefined,
										"resource-id",
										"text"
									),
									resource_type: argv["resource-type"],
									worker_id: resolveFileToken(
										argv["worker-id"] as string | undefined,
										"worker-id",
										"text"
									),
								}),
				});
				return;
			}
			const parsedBody =
				argv.body !== undefined ? parseBody(argv.body) : undefined;
			const client = await createCommandClient(argv);
			const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
			const accountOrZoneId =
				accountOrZone === "zones"
					? await getZoneId({ zone: argv.zone }, client, { quiet: argv.quiet })
					: argv.local
						? LOCAL_ACCOUNT_ID
						: await getAccountId();
			if (accountOrZone === "zones") {
				argv.zoneId = accountOrZoneId;
			} else {
				argv.accountId = accountOrZoneId;
			}

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PUT",
						`/${accountOrZone}/${accountOrZoneId}/tags`,
						{
							body: bodyData,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData: Record<string, unknown> = {};
			if (argv["resource-id"] !== undefined)
				setNestedValue(
					bodyData,
					["resource_id"],
					resolveFileToken(
						argv["resource-id"] as string | undefined,
						"resource-id",
						"text"
					)
				);
			if (argv["resource-type"] !== undefined)
				setNestedValue(bodyData, ["resource_type"], argv["resource-type"]);
			if (argv["worker-id"] !== undefined)
				setNestedValue(
					bodyData,
					["worker_id"],
					resolveFileToken(
						argv["worker-id"] as string | undefined,
						"worker-id",
						"text"
					)
				);
			const result = await withProgress(`Updating`, async () =>
				requestApi<unknown>(
					client,
					"PUT",
					`/${accountOrZone}/${accountOrZoneId}/tags`,
					{
						body: bodyData,
						headers: Object.keys(headers).length > 0 ? headers : undefined,
					}
				)
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
