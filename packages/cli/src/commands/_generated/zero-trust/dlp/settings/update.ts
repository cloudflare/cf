import operation from "../../../_operations/zero-trust/dlp/settings/update.js";
/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
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
	command: "update",
	describe: "Update DLP account-level settings (full replacement).",
	usage:
		"$0 zero-trust dlp settings update\n\nMissing fields are reset to initial (unconfigured) values.",
	flags: {
		"ai-context-analysis": {
			kind: "boolean",
			brief: "Whether AI context analysis is enabled at the account level.",
			optional: true,
		},
		ocr: {
			kind: "boolean",
			brief: "Whether OCR is enabled at the account level.",
			optional: true,
		},
		"payload-logging-masking-level": {
			kind: "parsed",
			brief:
				"Masking level for payload logs.\n\n- `full`: The entire payload is masked.\n- `partial`: Only partial payload content is masked.\n- `clear`: No masking is applied to the payload content.\n- `default`: DLP uses its default masking behavior.",
			optional: true,
			choices: ["full", "partial", "clear", "default"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "payload-logging-masking-level", "text"),
		},
		"payload-logging-public-key": {
			kind: "parsed",
			brief:
				"Base64-encoded public key for encrypting payload logs.\n\n- Set to a non-empty base64 string to enable payload logging with the given key.\n- Set to an empty string to disable payload logging.\n- Omit or set to null to leave unchanged (PATCH) or reset to disabled (PUT).",
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
			brief: "New DLP settings.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dlp settings update",
				classification: {
					safeFlags: [
						"ai-context-analysis",
						"ocr",
						"payload-logging-masking-level",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dlp settings update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dlp/settings`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										ai_context_analysis: argv["ai-context-analysis"],
										ocr: argv["ocr"],
										payload_logging: {
											masking_level: argv["payload-logging-masking-level"],
											public_key: resolveFileToken(
												argv["payload-logging-public-key"] as
													| string
													| undefined,
												"payload-logging-public-key",
												"text"
											),
										},
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

				// Assemble request body from individual flags
				const bodyData = compactBody({
					ai_context_analysis: argv["ai-context-analysis"],
					ocr: argv["ocr"],
					payload_logging: {
						masking_level: argv["payload-logging-masking-level"],
						public_key: resolveFileToken(
							argv["payload-logging-public-key"] as string | undefined,
							"payload-logging-public-key",
							"text"
						),
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
