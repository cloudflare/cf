import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * batch command
 * @generated from apis/overlays/dns.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			'$0 dns records batch\n\nSend a Batch of DNS Record API calls to be executed together. Notes: - Although Cloudflare will execute the batched operations in a single database transaction, Cloudflare\'s distributed KV store must treat each record change as a single key-value pair. This means that the propagation of changes is not atomic. See [the documentation](https://developers.cloudflare.com/dns/manage-dns-records/how-to/batch-record-changes/ "Batch DNS records") for more information. - The operations you specify within the /batch request body are always executed in the following order: - Deletes - Patches - Puts - Posts'
		)
		.option("include-shadow-metadata", {
			type: "boolean",
			description:
				"Whether to include shadow metadata in the `meta` field of each record in the response. See [Shadowed records](https://developers.cloudflare.com/dns/manage-dns-records/reference/shadowed-records).",
		})
		.option("deletes", {
			type: "string",
			description:
				"The deletes field. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("patches", {
			type: "string",
			description:
				"The patches field. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("posts", {
			type: "string",
			description:
				"The posts field. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("puts", {
			type: "string",
			description:
				"The puts field. Provide as a JSON array of objects or @path/to/file.json.",
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

type Request = SdkRequest<"dns-records-for-a-zone-batch-dns-records">;
type Body = Request;
type Query = SdkQuery<"dns-records-for-a-zone-batch-dns-records">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "batch",
	describe: "Batch DNS Records",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "dns records batch",
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
						command: "cf dns records batch",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/dns_records/batch`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						query: queryParams,
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										deletes: parseObjectArray(argv["deletes"], "deletes"),
										patches: parseObjectArray(argv["patches"], "patches"),
										posts: parseObjectArray(argv["posts"], "posts"),
										puts: parseObjectArray(argv["puts"], "puts"),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const qs = new URLSearchParams(
						Object.entries(queryParams)
							.filter(([, v]) => v !== undefined)
							.map(([k, v]) => [k, String(v)])
					).toString();
					const result = await withProgress(`Creating`, async () =>
						client.dns.records.batch({
							...bodyData,
							zone_id: zoneId,
							...queryParams,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					deletes: parseObjectArray(argv["deletes"], "deletes"),
					patches: parseObjectArray(argv["patches"], "patches"),
					posts: parseObjectArray(argv["posts"], "posts"),
					puts: parseObjectArray(argv["puts"], "puts"),
				});
				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const result = await withProgress(`Creating`, async () =>
					client.dns.records.batch({
						...bodyData,
						zone_id: zoneId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
