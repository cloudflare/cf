import operation from "../../../_operations/api-security/token-validation/configurations/create.js";
/**
 * create command
 * @generated from apis/overlays/api-security.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create a token validation configuration",
	usage:
		"$0 api-security token-validation configurations create\n\nCreates a JWT validation configuration for the zone.",
	flags: {
		"credentials-keys": {
			kind: "parsed",
			brief:
				'The credentials.keys field. Provide as a JSON array of objects or @path/to/file.json. Shape: [(({"kid": string} & {"alg": "RS256" | "RS384" | "RS512" | ...more, "e": string, "kty": "RSA", "n": string}) | ({"kid": string} & {"kty": "EC", "x": string, "y": string} & {"alg": "ES256", "crv": "P-256"}) | ...more)].',
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "The description field",
			optional: true,
			parse: String,
		},
		title: {
			kind: "parsed",
			brief: "The title field",
			optional: true,
			parse: String,
		},
		"token-type": {
			kind: "parsed",
			brief: "The token_type field",
			optional: true,
			choices: ["JWT"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "token-type", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "api-security token-validation configurations create",
				classification: {
					safeFlags: ["token-type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["credentials-keys"] === undefined) {
						throw new Error(
							"--credentials-keys is required (or pass --body with this field set)."
						);
					}
					if (argv["description"] === undefined) {
						argv["description"] = await promptForRequiredField(
							"description",
							"The description field"
						);
					}
					if (argv["title"] === undefined) {
						argv["title"] = await promptForRequiredField(
							"title",
							"The title field"
						);
					}
					if (argv["token-type"] === undefined) {
						argv["token-type"] = await promptForRequiredEnumField(
							"token-type",
							"The token_type field",
							["JWT"] as const
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command: "cf api-security token-validation configurations create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/token_validation/config`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										credentials: {
											keys: parseObjectArray(
												argv["credentials-keys"],
												"credentials-keys"
											),
										},
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										title: resolveFileToken(
											argv["title"] as string | undefined,
											"title",
											"text"
										),
										token_type: argv["token-type"],
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
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, zone_id: zoneId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					credentials: {
						keys: parseObjectArray(
							argv["credentials-keys"],
							"credentials-keys"
						),
					},
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					title: resolveFileToken(
						argv["title"] as string | undefined,
						"title",
						"text"
					),
					token_type: argv["token-type"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
