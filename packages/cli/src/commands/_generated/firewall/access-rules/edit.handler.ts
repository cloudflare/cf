import operation from "../../_operations/firewall/access-rules/edit.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./edit.js";
import {
	createCommandClient,
	getAccountId,
	getZoneId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "firewall access-rules edit",
			classification: {
				safeFlags: ["configuration-target", "access-rule-mode", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
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
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId =
					argv.zone === undefined ? await resolveAccountIdSilent() : undefined;
				const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
				const accountOrZoneId =
					argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
				formatDryRun({
					command: "cf firewall access-rules edit",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/firewall/access_rules/rules/${argv["rule-id"] == null ? "<rule-id>" : encodeURIComponent(String(argv["rule-id"]))}`,
					pathParams: {
						"account-or-zone": String(accountOrZone),
						"account-or-zone-id": String(accountOrZoneId),
						"rule-id": String(argv["rule-id"] ?? ""),
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
			const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
			const accountOrZoneId =
				accountOrZone === "zones"
					? await getZoneId({ zone: argv.zone }, client, { quiet: argv.quiet })
					: argv.local
						? LOCAL_ACCOUNT_ID
						: await getAccountId();
			if (accountOrZone === "zones") {
				argv.zoneId = accountOrZoneId;
			} else {
				argv.accountId = accountOrZoneId;
			}

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
						rule_id: argv["rule-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

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
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_or_zone: accountOrZone,
					account_or_zone_id: accountOrZoneId,
					rule_id: argv["rule-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
