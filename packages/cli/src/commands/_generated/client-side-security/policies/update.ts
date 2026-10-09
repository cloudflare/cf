import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/client-side-security.ts
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
			"$0 client-side-security policies update <policy-id>\n\nUpdates the description, action, expression, enabled state, and policy value for a content security rule."
		)
		.positional("policy-id", {
			type: "string",
			description: "Identifier",
			demandOption: true,
		})
		.option("action", {
			type: "string",
			description: "The action to take if the expression matches",
			choices: ["allow", "log", "add_reporting_directives"],
		})
		.coerce("action", (value) => resolveFileToken(value, "action", "text"))
		.option("description", {
			type: "string",
			description: "A description for the policy",
		})
		.option("enabled", {
			type: "boolean",
			description: "Whether the policy is enabled",
		})
		.option("expression", {
			type: "string",
			description:
				"The expression which must match for the policy to be applied, using the Cloudflare Firewall rule expression syntax",
		})
		.option("value", {
			type: "string",
			description: "The policy which will be applied",
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

type Request = SdkRequest<"page-shield-update-policy">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <policy-id>",
	describe: "Update a content security rule",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "client-side-security policies update",
				classification: {
					safeFlags: ["action", "enabled", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf client-side-security policies update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/page_shield/policies/${argv["policy-id"] == null ? "<policy-id>" : encodeURIComponent(String(argv["policy-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"policy-id": String(argv["policy-id"] ?? ""),
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
										value: resolveFileToken(
											argv["value"] as string | undefined,
											"value",
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
					const result = await withProgress(`Updating`, async () =>
						client.clientSideSecurity.policies.update({
							...bodyData,
							zone_id: zoneId,
							policy_id: argv["policy-id"],
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
					value: resolveFileToken(
						argv["value"] as string | undefined,
						"value",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.clientSideSecurity.policies.update({
						...bodyData,
						zone_id: zoneId,
						policy_id: argv["policy-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
