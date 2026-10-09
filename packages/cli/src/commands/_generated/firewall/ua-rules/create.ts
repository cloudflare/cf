import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/firewall.ts
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
			"$0 firewall ua-rules create\n\nCreates a new User Agent Blocking rule in a zone."
		)
		.option("configuration-target", {
			type: "string",
			description:
				"The configuration target. You must set the target to `ua` when specifying a user agent in the rule.",
			choices: ["ua"],
		})
		.coerce("configuration-target", (value: string | undefined) =>
			resolveFileToken(value, "configuration-target", "text")
		)
		.option("configuration-value", {
			type: "string",
			description: "the user agent to exactly match",
		})
		.option("description", {
			type: "string",
			description:
				"An informative summary of the rule. This value is sanitized and any tags will be removed.",
		})
		.option("paused", {
			type: "boolean",
			description: "When true, indicates that the rule is currently paused.",
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

type Request =
	SdkRequest<"user-agent-blocking-rules-create-a-user-agent-blocking-rule">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a User Agent Blocking rule",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "firewall ua-rules create",
				classification: {
					safeFlags: ["configuration-target", "paused", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf firewall ua-rules create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/firewall/ua_rules`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										configuration: {
											target: argv["configuration-target"],
											value: resolveFileToken(
												argv["configuration-value"] as string | undefined,
												"configuration-value",
												"text"
											),
										},
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										paused: argv["paused"],
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
						client.firewall.uaRules.create({
							...bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					configuration: {
						target: argv["configuration-target"],
						value: resolveFileToken(
							argv["configuration-value"] as string | undefined,
							"configuration-value",
							"text"
						),
					},
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					paused: argv["paused"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.firewall.uaRules.create({
						...bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
