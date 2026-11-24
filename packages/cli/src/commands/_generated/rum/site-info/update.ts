import operation from "../../_operations/rum/site-info/update.js";
/**
 * update command
 * @generated from apis/overlays/rum.ts
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
	command: "update <site-id>",
	describe: "Update a Web Analytics site",
	usage:
		"$0 rum site-info update <site-id>\n\nUpdates an existing Web Analytics site.",
	flags: {
		"auto-install": {
			kind: "boolean",
			brief:
				"If enabled, the JavaScript snippet is automatically injected for orange-clouded sites.",
			optional: true,
		},
		enabled: {
			kind: "boolean",
			brief:
				"Enables or disables RUM. This option can be used only when auto_install is set to true.",
			optional: true,
		},
		host: {
			kind: "parsed",
			brief: "The hostname to use for gray-clouded sites.",
			optional: true,
			parse: String,
		},
		lite: {
			kind: "boolean",
			brief:
				"If enabled, the JavaScript snippet will not be injected for visitors from the EU.",
			optional: true,
		},
		"zone-tag": {
			kind: "parsed",
			brief: "The zone identifier.",
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
	operands: [{ placeholder: "site-id", brief: "Identifier.", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "rum site-info update",
				classification: {
					safeFlags: ["auto-install", "enabled", "lite", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf rum site-info update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/rum/site_info/${argv["site-id"] == null ? "<site-id>" : encodeURIComponent(String(argv["site-id"]))}`,
						pathParams: { "site-id": String(argv["site-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										auto_install: argv["auto-install"],
										enabled: argv["enabled"],
										host: resolveFileToken(
											argv["host"] as string | undefined,
											"host",
											"text"
										),
										lite: argv["lite"],
										zone_tag: resolveFileToken(
											argv["zone-tag"] as string | undefined,
											"zone-tag",
											"text"
										),
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
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					auto_install: argv["auto-install"],
					enabled: argv["enabled"],
					host: resolveFileToken(
						argv["host"] as string | undefined,
						"host",
						"text"
					),
					lite: argv["lite"],
					zone_tag: resolveFileToken(
						argv["zone-tag"] as string | undefined,
						"zone-tag",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						site_id: argv["site-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
