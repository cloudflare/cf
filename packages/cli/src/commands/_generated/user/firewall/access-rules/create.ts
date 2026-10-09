import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 user firewall access-rules create\n\nCreates a new IP Access rule for all zones owned by the current user. Note: To create an IP Access rule that applies to a specific zone, refer to the [IP Access rules for a zone](#ip-access-rules-for-a-zone) endpoints."
		)
		.option("configuration-target", {
			type: "string",
			description:
				"The configuration target. You must set the target to `ip` when specifying an IP address in the rule.",
			choices: ["ip", "ip6", "ip_range", "asn", "country"],
		})
		.coerce("configuration-target", (value: string | undefined) =>
			resolveFileToken(value, "configuration-target", "text")
		)
		.option("configuration-value", {
			type: "string",
			description:
				"The IP address to match. This address will be compared to the IP address of incoming requests.",
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
	SdkRequest<"ip-access-rules-for-a-user-create-an-ip-access-rule">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create an IP Access rule",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "user firewall access-rules create",
				classification: {
					safeFlags: ["configuration-target", "dry-run"],
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
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.user.firewall.accessRules.create({
							...bodyData,
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
				});
				const result = await withProgress(`Creating`, async () =>
					client.user.firewall.accessRules.create({
						...bodyData,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
