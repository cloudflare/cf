import operation from "../../_operations/firewall/ua-rules/update.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/firewall.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 firewall ua-rules update <ua-rule-id>\n\nUpdates an existing User Agent Blocking rule."
		)
		.positional("ua-rule-id", {
			type: "string",
			description: "The unique identifier of the User Agent Blocking rule.",
			demandOption: true,
		})
		.option("configuration-target", {
			type: "string",
			description:
				"Variant descriptions:\n- `ip`: The configuration target. You must set the target to `ip` when specifying an IP address in the rule.\n- `ip6`: The configuration target. You must set the target to `ip6` when specifying an IPv6 address in the rule.\n- `ip_range`: The configuration target. You must set the target to `ip_range` when specifying an IP address range in the rule.\n- `asn`: The configuration target. You must set the target to `asn` when specifying an Autonomous System Number (ASN) in the rule.\n- `country`: The configuration target. You must set the target to `country` when specifying a country code in the rule.",
			choices: ["ip", "ip6", "ip_range", "asn", "country"],
		})
		.coerce("configuration-target", (value) =>
			resolveFileToken(value, "configuration-target", "text")
		)
		.option("configuration-value", {
			type: "string",
			description:
				"Variant descriptions:\n- The IP address to match. This address will be compared to the IP address of incoming requests.\n- The IPv6 address to match.\n- The IP address range to match. You can only use prefix lengths `/16` and `/24` for IPv4 ranges, and prefix lengths `/32`, `/48`, and `/64` for IPv6 ranges.\n- The AS number to match.\n- The two-letter ISO-3166-1 alpha-2 code to match. For more information, refer to [IP Access rules: Parameters](https://developers.cloudflare.com/waf/tools/ip-access-rules/parameters/#country).",
		})
		.option("description", {
			type: "string",
			description:
				"An informative summary of the rule. This value is sanitized and any tags will be removed.",
		})
		.option("access-rule-mode", {
			type: "string",
			description: "The action to apply to a matched request.",
			choices: [
				"block",
				"challenge",
				"whitelist",
				"js_challenge",
				"managed_challenge",
			],
		})
		.coerce("access-rule-mode", (value) =>
			resolveFileToken(value, "access-rule-mode", "text")
		)
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

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <ua-rule-id>",
	describe: "Update a User Agent Blocking rule",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "firewall ua-rules update",
				classification: {
					safeFlags: [
						"configuration-target",
						"access-rule-mode",
						"paused",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf firewall ua-rules update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/firewall/ua_rules/${argv["ua-rule-id"] == null ? "<ua-rule-id>" : encodeURIComponent(String(argv["ua-rule-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"ua-rule-id": String(argv["ua-rule-id"] ?? ""),
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
										mode: argv["access-rule-mode"],
										paused: argv["paused"],
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
							ua_rule_id: argv["ua-rule-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["access-rule-mode"] === undefined) {
					argv["access-rule-mode"] = await promptForRequiredEnumField(
						"access-rule-mode",
						"The action to apply to a matched request.",
						[
							"block",
							"challenge",
							"whitelist",
							"js_challenge",
							"managed_challenge",
						] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
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
					mode: argv["access-rule-mode"],
					paused: argv["paused"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						ua_rule_id: argv["ua-rule-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
