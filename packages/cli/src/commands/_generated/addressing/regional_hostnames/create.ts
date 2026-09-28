import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/addressing.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 addressing regional_hostnames create\n\nCreate a new Regional Hostname entry. Cloudflare will only use data centers that are physically located within the chosen region to decrypt and service HTTPS traffic. Learn more about [Regional Services](https://developers.cloudflare.com/data-localization/regional-services/get-started/)."
		)
		.option("hostname", {
			type: "string",
			description:
				"DNS hostname to be regionalized, must be a subdomain of the zone. Wildcards are supported for one level, e.g `*.example.com`",
		})
		.option("region-key", {
			type: "string",
			description: "Identifying key for the region",
		})
		.option("routing", {
			type: "string",
			description:
				"Configure which routing method to use for the regional hostname",
			default: "dns",
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

type Request = SdkRequest<"dls-zone-regional-hostnames-create">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Regional Hostname",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "addressing regional_hostnames create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf addressing regional_hostnames create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/addressing/regional_hostnames`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										hostname: resolveFileToken(
											argv["hostname"] as string | undefined,
											"hostname",
											"text"
										),
										region_key: resolveFileToken(
											argv["region-key"] as string | undefined,
											"region-key",
											"text"
										),
										routing: resolveFileToken(
											argv["routing"] as string | undefined,
											"routing",
											"text"
										),
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
					const result = await withProgress(`Creating`, async () =>
						client.addressing.regionalHostnames.create({
							...bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["hostname"] === undefined) {
					argv["hostname"] = await promptForRequiredField(
						"hostname",
						"DNS hostname to be regionalized, must be a subdomain of the zone. Wildcards are supported for one level, e.g \`*.example.com\`"
					);
				}
				if (argv["region-key"] === undefined) {
					argv["region-key"] = await promptForRequiredField(
						"region-key",
						"Identifying key for the region"
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					hostname: resolveFileToken(
						argv["hostname"] as string | undefined,
						"hostname",
						"text"
					),
					region_key: resolveFileToken(
						argv["region-key"] as string | undefined,
						"region-key",
						"text"
					),
					routing: resolveFileToken(
						argv["routing"] as string | undefined,
						"routing",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.addressing.regionalHostnames.create({
						...bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
