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
 * update command
 * @generated from apis/overlays/api-security.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 api-security session-identifiers update\n\nReplaces the zone's authentication identifier characteristics used to identify distinct API sessions."
		)
		.option("normalize", {
			type: "boolean",
			description:
				"Ensures that the configuration is written or retrieved in normalized fashion",
		})
		.option("auth-id-characteristics", {
			type: "string",
			description:
				"The auth_id_characteristics field. Provide as a JSON array of objects or @path/to/file.json.",
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

type Request = SdkRequest<"api-shield-settings-set-configuration-properties">;
type Body = Request["body"];
type Query = SdkQuery<"api-shield-settings-set-configuration-properties">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update",
	describe: "Update session identifier settings",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "api-security session-identifiers update",
				classification: {
					safeFlags: ["normalize", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					normalize: argv["normalize"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf api-security session-identifiers update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/api_gateway/configuration`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						query: queryParams,
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										auth_id_characteristics: parseObjectArray(
											argv["auth-id-characteristics"],
											"auth-id-characteristics"
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
					const bodyData = parseBody<Request["body"]>(argv.body);
					const qs = new URLSearchParams(
						Object.entries(queryParams)
							.filter(([, v]) => v !== undefined)
							.map(([k, v]) => [k, String(v)])
					).toString();
					const result = await withProgress(`Updating`, async () =>
						client.apiSecurity.sessionIdentifiers.update({
							body: bodyData,
							zone_id: zoneId,
							...queryParams,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["auth-id-characteristics"] === undefined) {
					throw new Error(
						"--auth-id-characteristics is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					auth_id_characteristics: parseObjectArray(
						argv["auth-id-characteristics"],
						"auth-id-characteristics"
					),
				});
				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const result = await withProgress(`Updating`, async () =>
					client.apiSecurity.sessionIdentifiers.update({
						body: bodyData,
						zone_id: zoneId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
