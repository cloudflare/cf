import operation from "../_operations/security-insights/list.js";
/**
 * list command
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
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "list",
	describe: "Retrieves Security Center Insights",
	usage:
		"$0 security-insights list\n\nLists all Security Center insights for the account or zone, showing security findings and recommendations.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	flags: {
		dismissed: { kind: "boolean", brief: "Dismissed", optional: true },
		"issue-class": {
			kind: "parsed",
			brief: "Issue class",
			variadic: true,
			optional: true,
			parse: String,
		},
		"issue-type": {
			kind: "parsed",
			brief: "Issue type",
			variadic: true,
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
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		product: {
			kind: "parsed",
			brief: "Product",
			variadic: true,
			optional: true,
			parse: String,
		},
		source: {
			kind: "parsed",
			brief: "Source",
			variadic: true,
			optional: true,
			choices: ["cloudflare", "riskrecon"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		severity: {
			kind: "parsed",
			brief: "Severity",
			variadic: true,
			optional: true,
			choices: ["low", "moderate", "critical"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		subject: {
			kind: "parsed",
			brief: "Subject",
			variadic: true,
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Specifies the current page within paginated list of results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Sets the number of results per page of results.",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "security-insights list",
				classification: {
					safeFlags: ["dismissed", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					dismissed: argv["dismissed"],
					issue_class: argv["issue-class"],
					issue_type: argv["issue-type"],
					product: argv["product"],
					source: argv["source"],
					severity: argv["severity"],
					subject: argv["subject"],
					page: argv["page"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId =
						argv.zone === undefined
							? await resolveAccountIdSilent()
							: undefined;
					const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
					const accountOrZoneId =
						argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
					formatDryRun({
						command: "cf security-insights list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/security-center/insights`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							"account-or-zone-id": String(accountOrZoneId),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
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

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
