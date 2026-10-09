import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/client-side-security.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 client-side-security policies create\n\nCreates a rule that applies a client-side security action when its filter expression matches."
		)
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

type Request = SdkRequest<"page-shield-create-policy">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a content security rule",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "client-side-security policies create",
				classification: {
					safeFlags: ["action", "enabled", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf client-side-security policies create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/page_shield/policies`,
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
					const result = await withProgress(`Creating`, async () =>
						client.clientSideSecurity.policies.create({
							...bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["action"] === undefined) {
					argv["action"] = await promptForRequiredEnumField(
						"action",
						"The action to take if the expression matches",
						["allow", "log", "add_reporting_directives"] as const
					);
				}
				if (argv["description"] === undefined) {
					argv["description"] = await promptForRequiredField(
						"description",
						"A description for the policy"
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
						"The expression which must match for the policy to be applied, using the Cloudflare Firewall rule expression syntax"
					);
				}
				if (argv["value"] === undefined) {
					argv["value"] = await promptForRequiredField(
						"value",
						"The policy which will be applied"
					);
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
				const result = await withProgress(`Creating`, async () =>
					client.clientSideSecurity.policies.create({
						...bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
