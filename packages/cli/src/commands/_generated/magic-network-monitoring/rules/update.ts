import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/magic-network-monitoring.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
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
			"$0 magic-network-monitoring rules update\n\nUpdate network monitoring rules for account."
		)
		.option("automatic-advertisement", {
			type: "boolean",
			description:
				"Toggle on if you would like Cloudflare to automatically advertise the IP Prefixes within the rule via Magic Transit when the rule is triggered. Only available for users of Magic Transit.",
		})
		.option("bandwidth-threshold", {
			type: "number",
			description:
				"The number of bits per second for the rule. When this value is exceeded for the set duration, an alert notification is sent. Minimum of 1 and no maximum.",
		})
		.option("duration", {
			type: "string",
			description:
				'The amount of time that the rule threshold must be exceeded to send an alert notification. The final value must be equivalent to one of the following 8 values ["1m","5m","10m","15m","20m","30m","45m","60m"].',
			choices: ["1m", "5m", "10m", "15m", "20m", "30m", "45m", "60m"],
		})
		.coerce("duration", (value: string | undefined) =>
			resolveFileToken(value, "duration", "text")
		)
		.option("name", {
			type: "string",
			description:
				"The name of the rule. Must be unique. Supports characters A-Z, a-z, 0-9, underscore (_), dash (-), period (.), and tilde (~). You can’t have a space in the rule name. Max 256 characters.",
		})
		.option("packet-threshold", {
			type: "number",
			description:
				"The number of packets per second for the rule. When this value is exceeded for the set duration, an alert notification is sent. Minimum of 1 and no maximum.",
		})
		.option("prefix-match", {
			type: "string",
			description:
				"Prefix match type to be applied for a prefix auto advertisement when using an advanced_ddos rule.",
			choices: ["exact", "subnet", "supernet"],
		})
		.coerce("prefix-match", (value: string | undefined) =>
			resolveFileToken(value, "prefix-match", "text")
		)
		.option("prefixes", {
			type: "string",
			array: true,
			description: "The prefixes field",
		})
		.option("type", {
			type: "string",
			description: "MNM rule type.",
			choices: ["threshold", "zscore", "advanced_ddos"],
		})
		.coerce("type", (value: string | undefined) =>
			resolveFileToken(value, "type", "text")
		)
		.option("zscore-sensitivity", {
			type: "string",
			description: "Level of sensitivity set for zscore rules.",
			choices: ["low", "medium", "high"],
		})
		.coerce("zscore-sensitivity", (value: string | undefined) =>
			resolveFileToken(value, "zscore-sensitivity", "text")
		)
		.option("zscore-target", {
			type: "string",
			description: "Target of the zscore rule analysis.",
			choices: ["bits", "packets"],
		})
		.coerce("zscore-target", (value: string | undefined) =>
			resolveFileToken(value, "zscore-target", "text")
		)
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

type Request = SdkRequest<"magic-network-monitoring-rules-update-rules">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update",
	describe: "Update rules",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-network-monitoring rules update",
				classification: {
					safeFlags: [
						"automatic-advertisement",
						"duration",
						"prefix-match",
						"type",
						"zscore-sensitivity",
						"zscore-target",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-network-monitoring rules update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/mnm/rules`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										automatic_advertisement: argv["automatic-advertisement"],
										bandwidth_threshold: argv["bandwidth-threshold"],
										duration: argv["duration"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										packet_threshold: argv["packet-threshold"],
										prefix_match: argv["prefix-match"],
										prefixes: argv["prefixes"],
										type: argv["type"],
										zscore_sensitivity: argv["zscore-sensitivity"],
										zscore_target: argv["zscore-target"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.magicNetworkMonitoring.rules.update({
							body: bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["automatic-advertisement"] === undefined) {
					throw new Error(
						"--automatic-advertisement is required (or pass --body with this field set)."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"The name of the rule. Must be unique. Supports characters A-Z, a-z, 0-9, underscore (_), dash (-), period (.), and tilde (~). You can’t have a space in the rule name. Max 256 characters."
					);
				}
				if (argv["prefixes"] === undefined) {
					throw new Error(
						"--prefixes is required (or pass --body with this field set)."
					);
				}
				if (argv["type"] === undefined) {
					argv["type"] = await promptForRequiredEnumField(
						"type",
						"MNM rule type.",
						["threshold", "zscore", "advanced_ddos"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					automatic_advertisement: argv["automatic-advertisement"],
					bandwidth_threshold: argv["bandwidth-threshold"],
					duration: argv["duration"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					packet_threshold: argv["packet-threshold"],
					prefix_match: argv["prefix-match"],
					prefixes: argv["prefixes"],
					type: argv["type"],
					zscore_sensitivity: argv["zscore-sensitivity"],
					zscore_target: argv["zscore-target"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.magicNetworkMonitoring.rules.update({
						body: bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
