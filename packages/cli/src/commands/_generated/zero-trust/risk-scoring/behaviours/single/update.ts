import operation from "../../../../_operations/zero-trust/risk-scoring/behaviours/single/update.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust risk-scoring behaviours single update <behavior-id>\n\nUpdates one risk behavior that has no additional configuration. Returns 404 when the account does not have the gates or entitlements for the behavior."
		)
		.positional("behavior-id", {
			type: "string",
			description:
				"ID of a risk behavior that has no additional configuration.",
			demandOption: true,
		})
		.option("enabled", {
			type: "boolean",
			description: "Whether the behavior counts toward the risk score.",
		})
		.option("points", {
			type: "number",
			description:
				"Risk score points of the behavior. A null value is the same as an omitted value.",
		})
		.option("risk-level", {
			type: "string",
			description: "Risk level of a behavior or an event.",
			choices: ["info", "low", "medium", "high"],
		})
		.coerce("risk-level", (value) =>
			resolveFileToken(value, "risk-level", "text")
		)
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Settings for one risk behavior. Supply risk_level, points, or both. When you supply both, points must be in the range of risk_level. When you supply only one, the server derives the other. ",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <behavior-id>",
	describe: "Update a risk behavior",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust risk-scoring behaviours single update",
				classification: {
					safeFlags: ["enabled", "risk-level", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["enabled"] === undefined) {
						throw new Error(
							"--enabled is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust risk-scoring behaviours single update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/zt_risk_scoring/behaviors/${argv["behavior-id"] == null ? "<behavior-id>" : encodeURIComponent(String(argv["behavior-id"]))}`,
						pathParams: { "behavior-id": String(argv["behavior-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										enabled: argv["enabled"],
										points: argv["points"],
										risk_level: argv["risk-level"],
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
							behavior_id: argv["behavior-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					enabled: argv["enabled"],
					points: argv["points"],
					risk_level: argv["risk-level"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						behavior_id: argv["behavior-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
