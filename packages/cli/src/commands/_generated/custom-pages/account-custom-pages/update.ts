import operation from "../../_operations/custom-pages/account-custom-pages/update.js";
/**
 * update command
 * @generated from apis/overlays/custom-pages.ts
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <identifier>",
	describe: "Update a custom page",
	usage:
		"$0 custom-pages account-custom-pages update <identifier>\n\nUpdates the configuration for a custom page type.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	flags: {
		state: {
			kind: "parsed",
			brief: "The custom page state.",
			optional: true,
			choices: ["default", "customized"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "state", "text"),
		},
		url: {
			kind: "parsed",
			brief: "The URL associated with the custom page.",
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
	operands: [
		{ placeholder: "identifier", brief: "Custom page type.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "custom-pages account-custom-pages update",
				classification: {
					safeFlags: ["state", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["state"] === undefined) {
						argv["state"] = await promptForRequiredEnumField(
							"state",
							"The custom page state.",
							["default", "customized"] as const
						);
					}
					if (argv["url"] === undefined) {
						argv["url"] = await promptForRequiredField(
							"url",
							"The URL associated with the custom page."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId =
						argv.zone === undefined
							? await resolveAccountIdSilent()
							: undefined;
					const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
					const accountOrZoneId =
						argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
					formatDryRun({
						command: "cf custom-pages account-custom-pages update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/custom_pages/${argv["identifier"] == null ? "<identifier>" : encodeURIComponent(String(argv["identifier"]))}`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							"account-or-zone-id": String(accountOrZoneId),
							identifier: String(argv["identifier"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										state: argv["state"],
										url: resolveFileToken(
											argv["url"] as string | undefined,
											"url",
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
							identifier: argv["identifier"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					state: argv["state"],
					url: resolveFileToken(
						argv["url"] as string | undefined,
						"url",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
						identifier: argv["identifier"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
