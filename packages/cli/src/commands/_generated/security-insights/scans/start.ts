import operation from "../../_operations/security-insights/scans/start.js";
/**
 * start command
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
	command: "start",
	describe: "Start On-Demand account or zone Scan",
	usage:
		"$0 security-insights scans start\n\nInitiates an on-demand security scan for the entire account or zone, scanning all zones associated with the account or zone. Rate limited to 5 scans per account or zone per 24-hour window.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	flags: {
		"issue-type": {
			kind: "parsed",
			brief: "The issue_type field",
			optional: true,
			choices: [
				"compliance_violation",
				"email_security",
				"exposed_infrastructure",
				"insecure_configuration",
				"weak_authentication",
				"configuration_suggestion",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "issue-type", "text"),
		},
		"issue-class": {
			kind: "parsed",
			brief: "The issue_class field",
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
			brief:
				"Request body for starting an on-demand scan. Specify issue_type or issue_class to scope the scan, or provide an empty object to scan all issue types.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	rules(rules) {
		rules.conflicts("issue-type", ["issue-class"]);
		rules.conflicts("issue-class", ["issue-type"]);
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "security-insights scans start",
				classification: {
					safeFlags: ["issue-type", "dry-run"],
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
						command: "cf security-insights scans start",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/security-center/insights/scans`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							"account-or-zone-id": String(accountOrZoneId),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										issue_type: argv["issue-type"],
										issue_class: resolveFileToken(
											argv["issue-class"] as string | undefined,
											"issue-class",
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
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_or_zone: accountOrZone,
							account_or_zone_id: accountOrZoneId,
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					issue_type: argv["issue-type"],
					issue_class: resolveFileToken(
						argv["issue-class"] as string | undefined,
						"issue-class",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
