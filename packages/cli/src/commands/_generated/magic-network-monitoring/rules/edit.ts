import operation from "../../_operations/magic-network-monitoring/rules/edit.js";
/**
 * edit command
 * @generated from apis/overlays/magic-network-monitoring.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "edit <rule-id>",
	describe: "Update rule",
	usage:
		"$0 magic-network-monitoring rules edit <rule-id>\n\nUpdate a network monitoring rule for account.",
	flags: {
		"automatic-advertisement": {
			kind: "boolean",
			brief:
				"Toggle on if you would like Cloudflare to automatically advertise the IP Prefixes within the rule via Magic Transit when the rule is triggered. Only available for users of Magic Transit.",
			optional: true,
		},
		"bandwidth-threshold": {
			kind: "parsed",
			brief:
				"The number of bits per second for the rule. When this value is exceeded for the set duration, an alert notification is sent. Minimum of 1 and no maximum.",
			optional: true,
			parse: Number,
		},
		duration: {
			kind: "parsed",
			brief:
				'The amount of time that the rule threshold must be exceeded to send an alert notification. The final value must be equivalent to one of the following 8 values ["1m","5m","10m","15m","20m","30m","45m","60m"].',
			optional: true,
			choices: ["1m", "5m", "10m", "15m", "20m", "30m", "45m", "60m"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "duration", "text"),
		},
		name: {
			kind: "parsed",
			brief:
				"The name of the rule. Must be unique. Supports characters A-Z, a-z, 0-9, underscore (_), dash (-), period (.), and tilde (~). You can’t have a space in the rule name. Max 256 characters.",
			optional: true,
			parse: String,
		},
		"packet-threshold": {
			kind: "parsed",
			brief:
				"The number of packets per second for the rule. When this value is exceeded for the set duration, an alert notification is sent. Minimum of 1 and no maximum.",
			optional: true,
			parse: Number,
		},
		"prefix-match": {
			kind: "parsed",
			brief:
				"Prefix match type to be applied for a prefix auto advertisement when using an advanced_ddos rule.",
			optional: true,
			choices: ["exact", "subnet", "supernet"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "prefix-match", "text"),
		},
		prefixes: {
			kind: "parsed",
			brief: "The prefixes field",
			variadic: true,
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "MNM rule type.",
			optional: true,
			choices: ["threshold", "zscore", "advanced_ddos"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		"zscore-sensitivity": {
			kind: "parsed",
			brief: "Level of sensitivity set for zscore rules.",
			optional: true,
			choices: ["low", "medium", "high"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "zscore-sensitivity", "text"),
		},
		"zscore-target": {
			kind: "parsed",
			brief: "Target of the zscore rule analysis.",
			optional: true,
			choices: ["bits", "packets"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "zscore-target", "text"),
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
			brief: "The id of the rule. Must be unique.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-network-monitoring rules edit",
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
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
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
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-network-monitoring rules edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/mnm/rules/${argv["rule-id"] == null ? "<rule-id>" : encodeURIComponent(String(argv["rule-id"]))}`,
						pathParams: { "rule-id": String(argv["rule-id"] ?? "") },
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
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							rule_id: argv["rule-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
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
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						rule_id: argv["rule-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
