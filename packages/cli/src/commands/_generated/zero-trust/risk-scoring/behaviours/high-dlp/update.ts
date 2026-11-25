import operation from "../../../../_operations/zero-trust/risk-scoring/behaviours/high-dlp/update.js";
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
			"$0 zero-trust risk-scoring behaviours high-dlp update\n\nUpdates the high_dlp risk behavior and its DLP configuration. Returns 404 when the account does not have the gates or entitlements for the behavior."
		)
		.option("dlp-config-duration-secs", {
			type: "number",
			description: "Rolling window in seconds, from 60 to 172800.",
		})
		.option("dlp-config-hits", {
			type: "number",
			description: "Number of DLP policy matches that triggers the behavior.",
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
				"Settings for the high_dlp risk behavior. Supply risk_level, points, or both. When you supply both, points must be in the range of risk_level. An omitted or null config keeps the stored configuration. ",
		})
		.check((argv) => {
			const groupSet = ["dlp-config-duration-secs", "dlp-config-hits"].some(
				(k) => argv[k] !== undefined
			);
			if (!argv.body && groupSet) {
				const missing = ["dlp-config-duration-secs", "dlp-config-hits"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when one of --dlp-config-duration-secs, --dlp-config-hits is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update",
	describe: "Update the high_dlp risk behavior",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust risk-scoring behaviours high-dlp update",
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
						command: "cf zero-trust risk-scoring behaviours high-dlp update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/zt_risk_scoring/behaviors/high_dlp`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										config: {
											duration_secs: argv["dlp-config-duration-secs"],
											hits: argv["dlp-config-hits"],
										},
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
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					config: {
						duration_secs: argv["dlp-config-duration-secs"],
						hits: argv["dlp-config-hits"],
					},
					enabled: argv["enabled"],
					points: argv["points"],
					risk_level: argv["risk-level"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
