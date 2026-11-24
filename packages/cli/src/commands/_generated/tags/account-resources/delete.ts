/**
 * delete command
 * @generated from apis/overlays/tags.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	getZoneId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "delete",
	describe: "Delete tags from an account or zone-level resource",
	usage:
		"$0 tags account-resources delete\n\nRemoves all tags from a specific account or zone-level resource.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	flags: {
		"resource-id": {
			kind: "parsed",
			brief: "The ID of the resource to remove tags from.",
			parse: String,
		},
		"resource-type": {
			kind: "enum",
			brief: "The type of the resource.",
			values: [
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
				"worker_version",
			],
		},
		"worker-id": {
			kind: "parsed",
			brief: "Worker identifier. Required for worker_version resources.",
			optional: true,
			parse: String,
		},
		"if-match": {
			kind: "parsed",
			brief:
				"ETag value for optimistic concurrency control. When provided, the server will\nverify the current resource ETag matches before applying the write. Returns\n412 Precondition Failed if the resource has been modified since the ETag was\nobtained. Omit this header for unconditional writes.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "tags account-resources delete",
				classification: {
					safeFlags: ["resource-type", "dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					resource_id: argv["resource-id"],
					resource_type: argv["resource-type"],
					worker_id: argv["worker-id"],
				};

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
						command: "cf tags account-resources delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/tags`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							"account-or-zone-id": String(accountOrZoneId),
						},
						query: queryParams,
						bodyKind: "none",
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

				if (!(await confirmDelete({ force: Boolean(argv.force) }))) {
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					requestApi<unknown>(
						client,
						"DELETE",
						`/${accountOrZone}/${accountOrZoneId}/tags`,
						{
							query: queryParams,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
