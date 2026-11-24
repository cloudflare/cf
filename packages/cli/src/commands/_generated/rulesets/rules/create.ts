import operation from "../../_operations/rulesets/rules/create.js";
/**
 * create command
 * @generated from apis/overlays/rulesets.ts
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
	command: "create <ruleset-id>",
	describe: "Create an account or zone ruleset rule",
	usage:
		"$0 rulesets rules create <ruleset-id>\n\nAdds a new rule to an account or zone ruleset. The rule will be added to the end of the existing list of rules in the ruleset by default.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	flags: {
		"validate-only": {
			kind: "boolean",
			brief:
				"Validates the request without persisting changes when set to `true`. Responses that normally return 200 return `result: null`; endpoints that normally return 204 continue to return 204.",
			optional: true,
		},
		"position-before": {
			kind: "parsed",
			brief:
				"The ID of another rule to place the rule before. An empty value causes the rule to be placed at the top.",
			optional: true,
			parse: String,
		},
		"position-after": {
			kind: "parsed",
			brief:
				"The ID of another rule to place the rule after. An empty value causes the rule to be placed at the bottom.",
			optional: true,
			parse: String,
		},
		"position-index": {
			kind: "parsed",
			brief:
				"An index at which to place the rule, where index 1 is the first rule.",
			optional: true,
			parse: Number,
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
			placeholder: "ruleset-id",
			brief: "The unique ID of the ruleset.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "rulesets rules create",
				classification: {
					safeFlags: ["validate-only", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					dry_run: argv["validate-only"],
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
						command: "cf rulesets rules create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/rulesets/${argv["ruleset-id"] == null ? "<ruleset-id>" : encodeURIComponent(String(argv["ruleset-id"]))}/rules`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							"account-or-zone-id": String(accountOrZoneId),
							"ruleset-id": String(argv["ruleset-id"] ?? ""),
						},
						query: queryParams,
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										position: {
											before: resolveFileToken(
												argv["position-before"] as string | undefined,
												"position-before",
												"text"
											),
											after: resolveFileToken(
												argv["position-after"] as string | undefined,
												"position-after",
												"text"
											),
											index: argv["position-index"],
										},
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
					const qs = new URLSearchParams(
						Object.entries(queryParams)
							.filter(([, v]) => v !== undefined)
							.map(([k, v]) => [k, String(v)])
					).toString();
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_or_zone: accountOrZone,
							account_or_zone_id: accountOrZoneId,
							ruleset_id: argv["ruleset-id"],
							...queryParams,
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					position: {
						before: resolveFileToken(
							argv["position-before"] as string | undefined,
							"position-before",
							"text"
						),
						after: resolveFileToken(
							argv["position-after"] as string | undefined,
							"position-after",
							"text"
						),
						index: argv["position-index"],
					},
				});
				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
						ruleset_id: argv["ruleset-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
