import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/custom-hostnames.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 custom-hostnames list\n\nList, search, sort, and filter all of your custom hostnames."
		)
		.option("hostname", {
			type: "string",
			description:
				"Fully qualified domain name to match against. This parameter cannot be used with the 'id', 'hostname.exact', 'hostname.contain', or 'hostname.startsWith' parameters.",
		})
		.option("hostname-exact", {
			type: "string",
			description:
				"Fully qualified domain name to match against. This parameter cannot be used with the 'id', 'hostname', 'hostname.contain', or 'hostname.startsWith' parameters.",
		})
		.option("hostname-starts-with", {
			type: "string",
			description:
				"Filters hostnames by a prefix match on the hostname value. This parameter cannot be used with the 'id', 'hostname', 'hostname.exact', or 'hostname.contain' parameters.",
		})
		.option("hostname-contain", {
			type: "string",
			description:
				"Filters hostnames by a substring match on the hostname value. This parameter cannot be used with the 'id', 'hostname', 'hostname.exact', or 'hostname.startsWith' parameters.",
		})
		.option("id", {
			type: "string",
			description:
				"Hostname ID to match against. This ID was generated and returned during the initial custom_hostname creation. This parameter cannot be used with the 'hostname', 'hostname.exact', 'hostname.contain', or 'hostname.startsWith' parameters.",
		})
		.option("page", {
			type: "number",
			description: "Page number of paginated results.",
		})
		.option("per-page", {
			type: "number",
			description: "Number of hostnames per page.",
		})
		.option("order", {
			type: "string",
			description: "Field to order hostnames by.",
			choices: ["ssl", "ssl_status"],
		})
		.option("direction", {
			type: "string",
			description: "Direction to order hostnames.",
			choices: ["asc", "desc"],
		})
		.option("ssl-status", {
			type: "string",
			description: "Filter by SSL certificate status.",
			choices: [
				"initializing",
				"pending_validation",
				"deleted",
				"pending_issuance",
				"pending_deployment",
				"pending_deletion",
				"pending_expiration",
				"expired",
				"active",
				"initializing_timed_out",
				"validation_timed_out",
				"issuance_timed_out",
				"deployment_timed_out",
				"deletion_timed_out",
				"pending_cleanup",
				"staging_deployment",
				"staging_active",
				"deactivating",
				"inactive",
				"backup_issued",
				"holding_deployment",
			],
		})
		.option("hostname-status", {
			type: "string",
			description: "Filter by the hostname's activation status.",
			choices: [
				"active",
				"pending",
				"active_redeploying",
				"moved",
				"pending_deletion",
				"deleted",
				"pending_blocked",
				"pending_migration",
				"pending_provisioned",
				"test_pending",
				"test_active",
				"test_active_apex",
				"test_blocked",
				"test_failed",
				"provisioned",
				"blocked",
			],
		})
		.option("certificate-authority", {
			type: "string",
			description:
				"Filter by the certificate authority that issued the SSL certificate.",
			choices: ["google", "lets_encrypt", "ssl_com"],
		})
		.option("wildcard", {
			type: "boolean",
			description:
				"Filter by whether the custom hostname is a wildcard hostname.",
		})
		.option("custom-origin-server", {
			type: "string",
			description: "Filter by custom origin server name.",
		})
		.option("ssl", {
			type: "string",
			description:
				"Whether to filter hostnames based on if they have SSL enabled.",
			choices: ["0", "1"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"custom-hostname-for-a-zone-list-custom-hostnames">;
type Query = SdkQuery<"custom-hostname-for-a-zone-list-custom-hostnames">;

const typedBuilder = withArgTypes<
	{
		order: Query["order"];
		direction: Query["direction"];
		"ssl-status": Query["ssl_status"];
		"hostname-status": Query["hostname_status"];
		"certificate-authority": Query["certificate_authority"];
		ssl: Query["ssl"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Custom Hostnames",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "custom-hostnames list",
				classification: {
					safeFlags: [
						"order",
						"direction",
						"ssl-status",
						"hostname-status",
						"certificate-authority",
						"wildcard",
						"ssl",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					hostname: argv["hostname"],
					"hostname.exact": argv["hostname-exact"],
					"hostname.startsWith": argv["hostname-starts-with"],
					"hostname.contain": argv["hostname-contain"],
					id: argv["id"],
					page: argv["page"],
					per_page: argv["per-page"],
					order: argv["order"],
					direction: argv["direction"],
					ssl_status: argv["ssl-status"],
					hostname_status: argv["hostname-status"],
					certificate_authority: argv["certificate-authority"],
					wildcard: argv["wildcard"],
					custom_origin_server: argv["custom-origin-server"],
					ssl: argv["ssl"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf custom-hostnames list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/custom_hostnames`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				const result = await withProgress(`Loading`, async () =>
					client.customHostnames.list({
						zone_id: zoneId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, {
					successLabel: `Loaded`,
					paginationQuery: queryParams,
				});
			}
		),
};

export default command;
