import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/account-tags.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 account-tags update\n\nCreates or updates tags for a specific account or zone-level resource. Replaces all existing tags for the resource."
		)
		.option("if-match", {
			type: "string",
			description:
				"ETag value for optimistic concurrency control. When provided, the server will\nverify the current resource ETag matches before applying the write. Returns\n412 Precondition Failed if the resource has been modified since the ETag was\nobtained. Omit this header for unconditional writes.",
		})
		.option("resource-id", {
			type: "string",
			description: "Identifies the unique resource.",
		})
		.option("resource-type", {
			type: "string",
			description: "Enum for worker_version resource type.",
			choices: [
				"worker_version",
				"access_application",
				"access_group",
				"access_service_token",
				"account",
				"account_ruleset",
				"ai_gateway",
				"alerting_policy",
				"alerting_webhook",
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
				"pages_project",
				"queue",
				"r2_bucket",
				"resource_share",
				"stream_live_input",
				"stream_video",
				"vectorize_index",
				"worker",
			],
		})
		.coerce("resource-type", (value) =>
			resolveFileToken(value, "resource-type", "text")
		)
		.option("worker-id", {
			type: "string",
			description: "Worker ID is required only for worker_version resources",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Request body schema for setting tags on account-level resources.",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update",
	describe: "Set tags for an account or zone-level resource",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "account-tags update",
				classification: {
					safeFlags: ["resource-type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const headers: Record<string, string> = {};
				if (argv["if-match"] !== undefined)
					headers["If-Match"] = String(argv["if-match"]);
				if (argv.dryRun) {
					const __cfDryRunAccountId =
						argv.zone === undefined
							? await resolveAccountIdSilent()
							: undefined;
					const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
					const accountOrZoneId =
						argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
					formatDryRun({
						command: "cf account-tags update",
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
				const client = await createCommandClient(argv);
				const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
				const accountOrZoneId =
					accountOrZone === "zones"
						? await getZoneId({ zone: argv.zone }, client, {
								quiet: argv.quiet,
							})
						: argv.local
							? LOCAL_ACCOUNT_ID
							: await getAccountId();
				if (accountOrZone === "zones") {
					argv.zoneId = accountOrZoneId;
				} else {
					argv.accountId = accountOrZoneId;
				}

				if (argv.body) {
					const bodyData = parseBody(argv.body);
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
				if (argv["resource-id"] === undefined) {
					argv["resource-id"] = await promptForRequiredField(
						"resource-id",
						"Identifies the unique resource."
					);
				}
				if (argv["resource-type"] === undefined) {
					argv["resource-type"] = await promptForRequiredEnumField(
						"resource-type",
						"Enum for worker_version resource type.",
						[
							"worker_version",
							"access_application",
							"access_group",
							"access_service_token",
							"account",
							"account_ruleset",
							"ai_gateway",
							"alerting_policy",
							"alerting_webhook",
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

				if (
					argv["resource-type"] === "worker_version" &&
					argv["worker-id"] === undefined
				) {
					argv["worker-id"] = await promptForRequiredField(
						"worker-id",
						"Worker ID is required only for worker_version resources",
						{ question: "Enter value for --worker-id" }
					);
				}

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
							body: Object.keys(bodyData).length > 0 ? bodyData : undefined,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
