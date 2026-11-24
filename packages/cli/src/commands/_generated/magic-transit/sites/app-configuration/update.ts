import operation from "../../../_operations/magic-transit/sites/app-configuration/update.js";
/**
 * update command
 * @generated from apis/overlays/magic-transit.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "update <app-config-id>",
	describe: "Update an App Config",
	usage:
		"$0 magic-transit sites app-configuration update <app-config-id>\n\nUpdates an App Config for a site",
	flags: {
		"site-id": { kind: "parsed", brief: "Identifier", parse: String },
		"account-app-id": {
			kind: "parsed",
			brief: "Magic account app ID.",
			optional: true,
			parse: String,
		},
		breakout: {
			kind: "boolean",
			brief:
				"Whether to breakout traffic to the app's endpoints directly. Null preserves default behavior.",
			optional: true,
		},
		"managed-app-id": {
			kind: "parsed",
			brief: "Managed app ID.",
			optional: true,
			parse: String,
		},
		"preferred-wans": {
			kind: "parsed",
			brief:
				"WAN interfaces to prefer over default WANs, highest-priority first. Can only be specified for breakout rules (breakout must be true).",
			variadic: true,
			optional: true,
			parse: String,
		},
		priority: {
			kind: "parsed",
			brief:
				"Priority of traffic. 0 is default, anything greater is prioritized. (Currently only 0 and 1 are supported)",
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
		{ placeholder: "app-config-id", brief: "Identifier", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-transit sites app-configuration update",
				classification: {
					safeFlags: ["breakout", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-transit sites app-configuration update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/sites/${argv["site-id"] == null ? "<site-id>" : encodeURIComponent(String(argv["site-id"]))}/app_configs/${argv["app-config-id"] == null ? "<app-config-id>" : encodeURIComponent(String(argv["app-config-id"]))}`,
						pathParams: {
							"site-id": String(argv["site-id"] ?? ""),
							"app-config-id": String(argv["app-config-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										account_app_id: resolveFileToken(
											argv["account-app-id"] as string | undefined,
											"account-app-id",
											"text"
										),
										breakout: argv["breakout"],
										managed_app_id: resolveFileToken(
											argv["managed-app-id"] as string | undefined,
											"managed-app-id",
											"text"
										),
										preferred_wans: argv["preferred-wans"],
										priority: argv["priority"],
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
							site_id: argv["site-id"],
							app_config_id: argv["app-config-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					account_app_id: resolveFileToken(
						argv["account-app-id"] as string | undefined,
						"account-app-id",
						"text"
					),
					breakout: argv["breakout"],
					managed_app_id: resolveFileToken(
						argv["managed-app-id"] as string | undefined,
						"managed-app-id",
						"text"
					),
					preferred_wans: argv["preferred-wans"],
					priority: argv["priority"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						site_id: argv["site-id"],
						app_config_id: argv["app-config-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
