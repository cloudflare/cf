import operation from "../../../_operations/api-security/token-validation/rules/edit.js";
/**
 * edit command
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "edit <rule-id>",
	describe: "Edit a token validation rule",
	usage:
		"$0 api-security token-validation rules edit <rule-id>\n\nUpdates only the supplied fields on a token validation rule.",
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
		"position-index": {
			kind: "parsed",
			brief: "Move rule to this position",
			optional: true,
			parse: Number,
		},
		"position-before": {
			kind: "parsed",
			brief: "Move rule to before rule with this ID.",
			optional: true,
			parse: String,
		},
		"position-after": {
			kind: "parsed",
			brief: "Move rule to after rule with this ID.",
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
	operands: [
		{
			placeholder: "rule-id",
			brief: "Token Validation Rule ID",
			parse: String,
		},
	],
	rules(rules) {
		rules.conflicts("position-index", ["position-before", "position-after"]);
		rules.conflicts("position-before", ["position-index", "position-after"]);
		rules.conflicts("position-after", ["position-index", "position-before"]);
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "api-security token-validation rules edit",
				classification: {
					safeFlags: ["action", "enabled", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf api-security token-validation rules edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/token_validation/rules/${argv["rule-id"] == null ? "<rule-id>" : encodeURIComponent(String(argv["rule-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"rule-id": String(argv["rule-id"] ?? ""),
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
										position: {
											index: argv["position-index"],
											before: resolveFileToken(
												argv["position-before"] as string | undefined,
												"position-before",
												"text"
											),
											after: resolveFileToken(
												argv["position-after"] as string | undefined,
												"position-after",
												"text"
											),
										},
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
							rule_id: argv["rule-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

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
					position: {
						index: argv["position-index"],
						before: resolveFileToken(
							argv["position-before"] as string | undefined,
							"position-before",
							"text"
						),
						after: resolveFileToken(
							argv["position-after"] as string | undefined,
							"position-after",
							"text"
						),
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						rule_id: argv["rule-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
