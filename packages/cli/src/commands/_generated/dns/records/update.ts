import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/dns.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 dns records update <dns-record-id>\n\nOverwrite an existing DNS record. Notes: - A/AAAA records cannot exist on the same name as CNAME records. - NS records cannot exist on the same name as any other record type. - Domain names are always represented in Punycode, even if Unicode characters were used when creating the record."
		)
		.positional("dns-record-id", {
			type: "string",
			description: "Identifier.",
			demandOption: true,
		})
		.option("include-shadow-metadata", {
			type: "boolean",
			description:
				"Whether to include shadow metadata in the `meta` field of each record in the response. See [Shadowed records](https://developers.cloudflare.com/dns/manage-dns-records/reference/shadowed-records).",
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

type Request = SdkRequest<"dns-records-for-a-zone-update-dns-record">;
type Body = Request["body"];
type Query = SdkQuery<"dns-records-for-a-zone-update-dns-record">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <dns-record-id>",
	describe: "Overwrite DNS Record",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "dns records update",
				classification: {
					safeFlags: ["include-shadow-metadata", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					include_shadow_metadata: argv["include-shadow-metadata"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf dns records update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/dns_records/${argv["dns-record-id"] == null ? "<dns-record-id>" : encodeURIComponent(String(argv["dns-record-id"]))}`,
						pathParams: {
							"dns-record-id": String(argv["dns-record-id"] ?? ""),
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						query: queryParams,
						bodyKind: "json",
						body: argv.body !== undefined ? parseBody(argv.body) : undefined,
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const qs = new URLSearchParams(
						Object.entries(queryParams)
							.filter(([, v]) => v !== undefined)
							.map(([k, v]) => [k, String(v)])
					).toString();
					const result = await withProgress(`Updating`, async () =>
						client.dns.records.update({
							body: bodyData,
							zone_id: zoneId,
							dns_record_id: argv["dns-record-id"],
							...queryParams,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				if (argv.body === undefined) {
					throw new Error(
						"--body is required for this command. Pass --body '<json>' or --body @path/to/file.json."
					);
				}
			}
		),
};

export default command;
