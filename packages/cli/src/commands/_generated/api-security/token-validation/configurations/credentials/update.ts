import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/api-security.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 api-security token-validation configurations credentials update <config-id>\n\nReplaces the configuration's complete key set. Symmetric keys must include their key material."
		)
		.positional("config-id", {
			type: "string",
			description: "Token Configuration ID",
			demandOption: true,
		})
		.option("keys", {
			type: "string",
			description:
				"The keys field. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Request payload for create and PUT credentials operations. Provided keys define the complete stored key set. Key identities (\`{alg,kid}\`) must be unique.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"token-validation-config-credentials-update">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <config-id>",
	describe: "Replace token validation credentials",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command:
					"api-security token-validation configurations credentials update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command:
							"cf api-security token-validation configurations credentials update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/token_validation/config/${argv["config-id"] == null ? "<config-id>" : encodeURIComponent(String(argv["config-id"]))}/credentials`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"config-id": String(argv["config-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										keys: parseObjectArray(argv["keys"], "keys"),
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
					const result = await withProgress(`Updating`, async () =>
						client.apiSecurity.tokenValidation.configurations.credentials.update(
							{
								body: bodyData,
								zone_id: zoneId,
								config_id: argv["config-id"],
							} satisfies Request
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["keys"] === undefined) {
					throw new Error(
						"--keys is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					keys: parseObjectArray(argv["keys"], "keys"),
				});
				const result = await withProgress(`Updating`, async () =>
					client.apiSecurity.tokenValidation.configurations.credentials.update({
						body: bodyData,
						zone_id: zoneId,
						config_id: argv["config-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
