import operation from "../../../../_operations/api-security/token-validation/configurations/credentials/edit.js";
/**
 * edit command
 * @generated from apis/overlays/api-security.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "edit <config-id>",
	describe: "Edit token validation credentials",
	usage:
		"$0 api-security token-validation configurations credentials edit <config-id>\n\nUpdates the configuration's complete key set while allowing omitted fields on existing keys to retain stored values. Omitted key identities are removed.",
	flags: {
		keys: {
			kind: "parsed",
			brief:
				'The keys field. Provide as a JSON array of objects or @path/to/file.json. Shape: [(({"kid": string} & {"alg": "RS256" | "RS384" | "RS512" | ...more, "e": string, "kty": "RSA", "n": string}) | ({"kid": string} & {"kty": "EC", "x": string, "y": string} & {"alg": "ES256", "crv": "P-256"}) | ...more)].',
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"Request payload for PATCH credentials. Provided keys define the complete stored key set, and stored keys omitted from payload are removed. For each provided key identity (`{alg,kid}`), payload fields overwrite the stored key before validation and omitted fields inherit from the stored key. Key identities must be unique.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "config-id",
			brief: "Token Configuration ID",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command:
					"api-security token-validation configurations credentials edit",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["keys"] === undefined) {
						throw new Error(
							"--keys is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command:
							"cf api-security token-validation configurations credentials edit",
						method: "PATCH",
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
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							zone_id: zoneId,
							config_id: argv["config-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					keys: parseObjectArray(argv["keys"], "keys"),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						config_id: argv["config-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
