import operation from "../../_operations/magic-network-monitoring/rules/edit.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./edit.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
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
	);
}
