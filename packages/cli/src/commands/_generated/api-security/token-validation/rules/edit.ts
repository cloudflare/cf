import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/api-security.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 api-security token-validation rules edit <rule-id>\n\nUpdates only the supplied fields on a token validation rule."
		)
		.positional("rule-id", {
			type: "string",
			description: "Token Validation Rule ID",
			demandOption: true,
		})
		.option("action", {
			type: "string",
			description:
				"Action to take on requests that match operations included in `selector` and fail `expression`.",
			choices: ["log", "block"],
		})
		.coerce("action", (value: string | undefined) =>
			resolveFileToken(value, "action", "text")
		)
		.option("description", {
			type: "string",
			description:
				"A human-readable description that gives more details than `title`.",
		})
		.option("enabled", {
			type: "boolean",
			description: "Toggle rule on or off.",
		})
		.option("expression", {
			type: "string",
			description:
				"Rule expression. Requests that fail to match this expression will be subject to `action`.\n\nFor details on expressions, see the [Cloudflare Docs](https://developers.cloudflare.com/api-shield/security/jwt-validation/).\n",
		})
		.option("title", {
			type: "string",
			description: "A human-readable name for the rule.",
		})
		.option("position-index", {
			type: "number",
			description: "Move rule to this position",
		})
		.option("position-before", {
			type: "string",
			description: "Move rule to before rule with this ID.",
		})
		.option("position-after", {
			type: "string",
			description: "Move rule to after rule with this ID.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.conflicts("position-index", ["position-before", "position-after"])
		.conflicts("position-before", ["position-index", "position-after"])
		.conflicts("position-after", ["position-index", "position-before"]);
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"token-validation-rules-edit">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <rule-id>",
	describe: "Edit a token validation rule",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "api-security token-validation rules edit",
				classification: {
					safeFlags: ["action", "enabled", "dry-run"],
				} satisfies ArgClassification<Args>,
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
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.apiSecurity.tokenValidation.rules.edit({
							body: bodyData,
							zone_id: zoneId,
							rule_id: argv["rule-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					client.apiSecurity.tokenValidation.rules.edit({
						body: bodyData,
						zone_id: zoneId,
						rule_id: argv["rule-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
