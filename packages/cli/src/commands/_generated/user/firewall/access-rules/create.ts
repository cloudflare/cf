import operation from "../../../_operations/user/firewall/access-rules/create.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
 * @generated from apis/overlays/user.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient } from "#lib/auth.js";
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
			"$0 user firewall access-rules create\n\nCreates a new IP Access rule for all zones owned by the current user. Note: To create an IP Access rule that applies to a specific zone, refer to the [IP Access rules for a zone](#ip-access-rules-for-a-zone) endpoints."
		)
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
		.option("notes", {
			type: "string",
			description:
				"An informative summary of the rule, typically used as a reminder or explanation.",
			default: "",
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
	command: "create",
	describe: "Create an IP Access rule",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "user firewall access-rules create",
				classification: {
					safeFlags: ["configuration-target", "access-rule-mode", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user firewall access-rules create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/user/firewall/access_rules/rules`,
						pathParams: {},
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
										mode: argv["access-rule-mode"],
										notes: resolveFileToken(
											argv["notes"] as string | undefined,
											"notes",
											"text"
										),
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData })
					);
					formatOutput(result, { successLabel: `Created` });
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
					mode: argv["access-rule-mode"],
					notes: resolveFileToken(
						argv["notes"] as string | undefined,
						"notes",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
