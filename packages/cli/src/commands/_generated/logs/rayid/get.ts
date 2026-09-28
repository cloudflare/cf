import { createCommandClient, getZoneId } from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * get command
 * @generated from apis/overlays/logs.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 logs rayid get <ray-id>\n\nThe `/rayids` api route allows lookups by specific rayid. The rayids route will return zero, one, or more records (ray ids are not unique)."
		)
		.positional("ray-id", {
			type: "string",
			description: "Ray identifier.",
			demandOption: true,
		})
		.option("fields", {
			type: "string",
			description:
				"The `/received` route by default returns a limited set of fields, and allows customers to override the default field set by specifying individual fields. The reasons for this are: 1. Most customers require only a small subset of fields, but that subset varies from customer to customer; 2. Flat schema is much easier to work with downstream (importing into BigTable etc); 3. Performance (time to process, file size). If `?fields=` is not specified, default field set is returned. This default field set may change at any time. When `?fields=` is provided, each record is returned with the specified fields. `fields` must be specified as a comma separated list without any whitespaces, and all fields must exist. The order in which fields are specified does not matter, and the order of fields in the response is not specified.",
		})
		.option("timestamps", {
			type: "string",
			description:
				"By default, timestamps in responses are returned as Unix nanosecond integers. The `?timestamps=` argument can be set to change the format in which response timestamps are returned. Possible values are: `unix`, `unixnano`, `rfc3339`. Note that `unix` and `unixnano` return timestamps as integers; `rfc3339` returns timestamps as strings.",
			choices: ["unix", "unixnano", "rfc3339"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"get-zones-zone_id-logs-rayids-ray_id">;
type Query = SdkQuery<"get-zones-zone_id-logs-rayids-ray_id">;

const typedBuilder = withArgTypes<
	{
		timestamps: Query["timestamps"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <ray-id>",
	describe: "Get logs RayIDs",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "logs rayid get",
				classification: {
					safeFlags: ["timestamps", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					fields: argv["fields"],
					timestamps: argv["timestamps"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf logs rayid get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/logs/rayids/${argv["ray-id"] == null ? "<ray-id>" : encodeURIComponent(String(argv["ray-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"ray-id": String(argv["ray-id"] ?? ""),
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
					client.logs.rayid.get({
						zone_id: zoneId,
						ray_id: argv["ray-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
