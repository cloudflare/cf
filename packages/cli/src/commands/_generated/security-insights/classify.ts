import operation from "../_operations/security-insights/classify.js";
/**
 * classify command
 * @generated from apis/overlays/security-insights.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "classify <issue-id>",
	describe: "Updates Security Center Insight Classification",
	usage:
		"$0 security-insights classify <issue-id>\n\nUpdates the user classification for a Security Center insight. Valid values are 'false_positive' or 'accept_risk'. To reset, set classification to null. Cannot change directly between classification values - must reset to null first.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	flags: {
		classification: {
			kind: "parsed",
			brief:
				"User-defined classification for the insight. Can be 'false_positive', 'accept_risk', 'other', or null.",
			optional: true,
			choices: ["false_positive", "accept_risk", "other"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "classification", "text"),
		},
		rationale: {
			kind: "parsed",
			brief:
				"Rationale for the classification change. Required when classification is 'accept_risk' or 'other'.",
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
	operands: [{ placeholder: "issue-id", brief: "Issue ID", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "security-insights classify",
				classification: {
					safeFlags: ["classification", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId =
						argv.zone === undefined
							? await resolveAccountIdSilent()
							: undefined;
					const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
					const accountOrZoneId =
						argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
					formatDryRun({
						command: "cf security-insights classify",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/security-center/insights/${argv["issue-id"] == null ? "<issue-id>" : encodeURIComponent(String(argv["issue-id"]))}/classification`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							"account-or-zone-id": String(accountOrZoneId),
							"issue-id": String(argv["issue-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										classification: argv["classification"],
										rationale: resolveFileToken(
											argv["rationale"] as string | undefined,
											"rationale",
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
						? await getZoneId({ zone: argv.zone }, client, {
								quiet: argv.quiet,
							})
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
							issue_id: argv["issue-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					classification: argv["classification"],
					rationale: resolveFileToken(
						argv["rationale"] as string | undefined,
						"rationale",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
						issue_id: argv["issue-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
