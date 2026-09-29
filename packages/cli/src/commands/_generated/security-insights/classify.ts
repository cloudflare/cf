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
import type { SdkRequest } from "#sdk";
/**
 * classify command
 * @generated from apis/overlays/security-insights.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 security-insights classify <issue-id>\n\nUpdates the user classification for a Security Center insight. Valid values are 'false_positive' or 'accept_risk'. To reset, set classification to null. Cannot change directly between classification values - must reset to null first."
		)
		.positional("issue-id", {
			type: "string",
			description: "Issue ID",
			demandOption: true,
		})
		.option("classification", {
			type: "string",
			description:
				"User-defined classification for the insight. Can be 'false_positive', 'accept_risk', 'other', or null.",
			choices: ["false_positive", "accept_risk", "other"],
		})
		.option("rationale", {
			type: "string",
			description:
				"Rationale for the classification change. Required when classification is 'accept_risk' or 'other'.",
		})
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

type Request =
	SdkRequest<"generated:patch:/{account_or_zone}/{account_or_zone_id}/security-center/insights/{issue_id}/classification">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "classify <issue-id>",
	describe: "Updates Security Center Insight Classification",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "security-insights classify",
				classification: {
					safeFlags: ["classification", "dry-run"],
				} satisfies ArgClassification<Args>,
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
										classification: resolveFileToken(
											argv["classification"] as string | undefined,
											"classification",
											"text"
										),
										rationale: resolveFileToken(
											argv["rationale"] as string | undefined,
											"rationale",
											"text"
										),
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
					const result = await withProgress(`Updating`, async () =>
						client.securityInsights.classify({
							...bodyData,
							account_or_zone: accountOrZone,
							account_or_zone_id: accountOrZoneId,
							issue_id: argv["issue-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					classification: resolveFileToken(
						argv["classification"] as string | undefined,
						"classification",
						"text"
					),
					rationale: resolveFileToken(
						argv["rationale"] as string | undefined,
						"rationale",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.securityInsights.classify({
						...bodyData,
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
						issue_id: argv["issue-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
