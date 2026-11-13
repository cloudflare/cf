import operation from "../../../_operations/ssl/origin-tls-client-auth/hostname-certificates/list.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * list command
 * @generated from apis/overlays/ssl.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 ssl origin-tls-client-auth hostname-certificates list\n\nLists all client certificates configured for per-hostname authenticated origin pulls on the zone."
		)
		.option("page", {
			type: "number",
			description:
				"Page number, starting at 1. Defaults to 1. Ignored when offset is provided.",
		})
		.option("per-page", {
			type: "number",
			description:
				"Number of results per page. Defaults to 50 when neither per_page nor limit is provided. Ignored when limit is provided. Values above 1000 are capped at 1000.",
		})
		.option("limit", {
			type: "number",
			description:
				"Alias for per_page. Defaults to 50 when neither per_page nor limit is provided. Takes precedence over per_page. Values above 1000 are capped at 1000.",
		})
		.option("offset", {
			type: "number",
			description:
				"Number of results to skip. Defaults to 0. Takes precedence over page, including when offset is 0.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Certificates",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ssl origin-tls-client-auth hostname-certificates list",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
					limit: argv["limit"],
					offset: argv["offset"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf ssl origin-tls-client-auth hostname-certificates list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/origin_tls_client_auth/hostnames/certificates`,
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
					client.send(operation, { zone_id: zoneId, ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
