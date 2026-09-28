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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/rulesets.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 rulesets account-rulesets rules update <rule-id>\n\nUpdates an existing rule in an account or zone ruleset."
		)
		.positional("rule-id", {
			type: "string",
			description: "The unique ID of the rule.",
			demandOption: true,
		})
		.option("ruleset-id", {
			type: "string",
			description: "The unique ID of the ruleset.",
			demandOption: true,
		})
		.option("validate-only", {
			type: "boolean",
			description:
				"Validates the request without persisting changes when set to `true`. Responses that normally return 200 return `result: null`; endpoints that normally return 204 continue to return 204.",
		})
		.option("position-before", {
			type: "string",
			description:
				"The ID of another rule to place the rule before. An empty value causes the rule to be placed at the top.",
		})
		.option("position-after", {
			type: "string",
			description:
				"The ID of another rule to place the rule after. An empty value causes the rule to be placed at the bottom.",
		})
		.option("position-index", {
			type: "number",
			description:
				"An index at which to place the rule, where index 1 is the first rule.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.conflicts("position-before", ["position-after", "position-index"])
		.conflicts("position-after", ["position-before", "position-index"])
		.conflicts("position-index", ["position-before", "position-after"]);
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"generated:patch:/{account_or_zone}/{account_or_zone_id}/rulesets/{ruleset_id}/rules/{rule_id}">;
type Body = Request;
type Query =
	SdkQuery<"generated:patch:/{account_or_zone}/{account_or_zone_id}/rulesets/{ruleset_id}/rules/{rule_id}">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <rule-id>",
	describe: "Update an account or zone ruleset rule",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "rulesets account-rulesets rules update",
				classification: {
					safeFlags: ["validate-only", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
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
						command: "cf rulesets account-rulesets rules update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/rulesets/${argv["ruleset-id"] == null ? "<ruleset-id>" : encodeURIComponent(String(argv["ruleset-id"]))}/rules/${argv["rule-id"] == null ? "<rule-id>" : encodeURIComponent(String(argv["rule-id"]))}`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							"rule-id": String(argv["rule-id"] ?? ""),
							"ruleset-id": String(argv["ruleset-id"] ?? ""),
							"account-or-zone-id": String(accountOrZoneId),
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

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const qs = new URLSearchParams(
						Object.entries(queryParams)
							.filter(([, v]) => v !== undefined)
							.map(([k, v]) => [k, String(v)])
					).toString();
					const result = await withProgress(`Updating`, async () =>
						client.rulesets.accountRulesets.rules.update({
							...bodyData,
							account_or_zone: accountOrZone,
							account_or_zone_id: accountOrZoneId,
							ruleset_id: argv["ruleset-id"],
							rule_id: argv["rule-id"],
							...queryParams,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
				const result = await withProgress(`Updating`, async () =>
					client.rulesets.accountRulesets.rules.update({
						...bodyData,
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
						ruleset_id: argv["ruleset-id"],
						rule_id: argv["rule-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
