import operation from "../../../_operations/user/firewall/access-rules/edit.js";
/**
 * edit command
 * @generated from apis/overlays/user.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "edit <rule-id>",
	describe: "Update an IP Access rule",
	usage:
		"$0 user firewall access-rules edit <rule-id>\n\nUpdates an IP Access rule defined at the user level. You can only update the rule action (`mode` parameter) and notes.",
	flags: {
		"access-rule-mode": {
			kind: "parsed",
			brief: "The action to apply to a matched request.",
			optional: true,
			choices: [
				"block",
				"challenge",
				"whitelist",
				"js_challenge",
				"managed_challenge",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "access-rule-mode", "text"),
		},
		notes: {
			kind: "parsed",
			brief:
				"An informative summary of the rule, typically used as a reminder or explanation.",
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
			brief: "Unique identifier for a rule.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "user firewall access-rules edit",
				classification: {
					safeFlags: ["access-rule-mode", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user firewall access-rules edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/user/firewall/access_rules/rules/${argv["rule-id"] == null ? "<rule-id>" : encodeURIComponent(String(argv["rule-id"]))}`,
						pathParams: { "rule-id": String(argv["rule-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
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
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, { body: bodyData, rule_id: argv["rule-id"] })
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					mode: argv["access-rule-mode"],
					notes: resolveFileToken(
						argv["notes"] as string | undefined,
						"notes",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, rule_id: argv["rule-id"] })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
