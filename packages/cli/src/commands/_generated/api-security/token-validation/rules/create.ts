import operation from "../../../_operations/api-security/token-validation/rules/create.js";
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
	describe: "Create a token validation rule",
	usage:
		"$0 api-security token-validation rules create\n\nCreates a token validation rule for the zone.",
	flags: {
		action: {
			kind: "parsed",
			brief:
				"Action to take on requests that match operations included in `selector` and fail `expression`.",
			optional: true,
			choices: ["log", "block"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "action", "text"),
		},
		description: {
			kind: "parsed",
			brief:
				"A human-readable description that gives more details than `title`.",
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief: "Toggle rule on or off.",
			optional: true,
		},
		expression: {
			kind: "parsed",
			brief:
				"Rule expression. Requests that fail to match this expression will be subject to `action`.\n\nFor details on expressions, see the [Cloudflare Docs](https://developers.cloudflare.com/api-shield/security/jwt-validation/).\n",
			optional: true,
			parse: String,
		},
		"selector-exclude": {
			kind: "parsed",
			brief:
				'Ignore operations that were otherwise included by `include`. Provide as a JSON array of objects, null, or @path/to/file.json. Shape: [{"operation_ids"?: [string]}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"selector-include": {
			kind: "parsed",
			brief:
				'Select all matching operations. Provide as a JSON array of objects, null, or @path/to/file.json. Shape: [{"host"?: [string]}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		title: {
			kind: "parsed",
			brief: "A human-readable name for the rule.",
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
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "api-security token-validation rules create",
				classification: {
					safeFlags: ["action", "enabled", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["action"] === undefined) {
						argv["action"] = await promptForRequiredEnumField(
							"action",
							"Action to take on requests that match operations included in \`selector\` and fail \`expression\`.",
							["log", "block"] as const
						);
					}
					if (argv["description"] === undefined) {
						argv["description"] = await promptForRequiredField(
							"description",
							"A human-readable description that gives more details than \`title\`."
						);
					}
					if (argv["enabled"] === undefined) {
						throw new Error(
							"--enabled is required (or pass --body with this field set)."
						);
					}
					if (argv["expression"] === undefined) {
						argv["expression"] = await promptForRequiredField(
							"expression",
							"Rule expression. Requests that fail to match this expression will be subject to \`action\`.  For details on expressions, see the [Cloudflare Docs](https://developers.cloudflare.com/api-shield/security/jwt-validation/). "
						);
					}
					if (argv["title"] === undefined) {
						argv["title"] = await promptForRequiredField(
							"title",
							"A human-readable name for the rule."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command: "cf api-security token-validation rules create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/token_validation/rules`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										action: argv["action"],
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										enabled: argv["enabled"],
										expression: resolveFileToken(
											argv["expression"] as string | undefined,
											"expression",
											"text"
										),
										selector: {
											exclude: parseObjectArray(
												argv["selector-exclude"],
												"selector-exclude",
												true
											),
											include: parseObjectArray(
												argv["selector-include"],
												"selector-include",
												true
											),
										},
										title: resolveFileToken(
											argv["title"] as string | undefined,
											"title",
											"text"
										),
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
					action: argv["action"],
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					enabled: argv["enabled"],
					expression: resolveFileToken(
						argv["expression"] as string | undefined,
						"expression",
						"text"
					),
					selector: {
						exclude: parseObjectArray(
							argv["selector-exclude"],
							"selector-exclude",
							true
						),
						include: parseObjectArray(
							argv["selector-include"],
							"selector-include",
							true
						),
					},
					title: resolveFileToken(
						argv["title"] as string | undefined,
						"title",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
