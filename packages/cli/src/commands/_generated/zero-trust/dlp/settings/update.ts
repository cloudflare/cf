import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
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
			"$0 zero-trust dlp settings update\n\nMissing fields are reset to initial (unconfigured) values."
		)
		.option("ai-context-analysis", {
			type: "boolean",
			description:
				"Whether AI context analysis is enabled at the account level.",
		})
		.option("ocr", {
			type: "boolean",
			description: "Whether OCR is enabled at the account level.",
		})
		.option("payload-logging-masking-level", {
			type: "string",
			description:
				"Masking level for payload logs.\n\n- `full`: The entire payload is masked.\n- `partial`: Only partial payload content is masked.\n- `clear`: No masking is applied to the payload content.\n- `default`: DLP uses its default masking behavior.",
			choices: ["full", "partial", "clear", "default"],
		})
		.coerce("payload-logging-masking-level", (value: string | undefined) =>
			resolveFileToken(value, "payload-logging-masking-level", "text")
		)
		.option("payload-logging-public-key", {
			type: "string",
			description:
				"Base64-encoded public key for encrypting payload logs.\n\n- Set to a non-empty base64 string to enable payload logging with the given key.\n- Set to an empty string to disable payload logging.\n- Omit or set to null to leave unchanged (PATCH) or reset to disabled (PUT).",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "New DLP settings.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"dlp-settings-update">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update",
	describe: "Update DLP account-level settings (full replacement).",
	builder,
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
				} satisfies ArgClassification<Args>,
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.zeroTrust.dlp.settings.update({
							body: bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					client.zeroTrust.dlp.settings.update({
						body: bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
