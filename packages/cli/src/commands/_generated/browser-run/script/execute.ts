/**
 * execute command
 * @generated from apis/overlays/browser-run.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, setNestedValue } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { fetchRawBytes, writeRawOutput } from "#lib/raw-fetch.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "execute <session-id>",
	describe: "Dynamic Script - execute code in an existing browser session.",
	usage:
		"$0 browser-run script execute <session-id>\n\nRuns the provided code in an existing browser session. The session stays open; close it with `DELETE /devtools/browser/:sessionId` or `browser.close()`, otherwise it ends at the idle timeout.",
	flags: {
		code: {
			kind: "parsed",
			brief: "Function body executed against the selected library's runner.",
			optional: true,
			parse: String,
		},
		library: {
			kind: "parsed",
			brief: "Library the script runs with. Defaults to raw CDP when omitted.",
			optional: true,
			choices: ["playwright", "puppeteer"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "library", "text"),
		},
		"target-id": {
			kind: "parsed",
			brief:
				"Page target the script attaches to. Defaults to the session's first page.",
			optional: true,
			parse: String,
		},
		timeout: {
			kind: "parsed",
			brief: "Maximum script run time in milliseconds.",
			default: "60000",
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
		text: {
			kind: "boolean",
			brief:
				"Decode the response body as UTF-8 text instead of writing raw bytes",
			default: false,
		},
	},
	operands: [
		{ placeholder: "session-id", brief: "Browser session ID", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "browser-run script execute",
				classification: {
					safeFlags: ["library", "dry-run", "text"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["code"] === undefined) {
						argv["code"] = await promptForRequiredField(
							"code",
							"Function body executed against the selected library's runner."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf browser-run script execute",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/browser-rendering/script/${argv["session-id"] == null ? "<session-id>" : encodeURIComponent(String(argv["session-id"]))}`,
						pathParams: { "session-id": String(argv["session-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										code: resolveFileToken(
											argv["code"] as string | undefined,
											"code",
											"text"
										),
										library: argv["library"],
										targetId: resolveFileToken(
											argv["target-id"] as string | undefined,
											"target-id",
											"text"
										),
										timeout: argv["timeout"],
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
					const __cfRawBytes = await withProgress(`Creating`, async () =>
						fetchRawBytes(
							`/accounts/${accountId}/browser-rendering/script/${encodeURIComponent(String(argv["session-id"]))}`,
							{
								method: "POST",
								local: argv.local === true,
								persistTo: argv.persistTo as string | undefined,
								body: JSON.stringify(bodyData),
								contentType: "application/json",
							}
						)
					);
					writeRawOutput(
						argv.text === true ? __cfRawBytes.toString("utf-8") : __cfRawBytes
					);
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["code"] !== undefined)
					setNestedValue(
						bodyData,
						["code"],
						resolveFileToken(argv["code"] as string | undefined, "code", "text")
					);
				if (argv["library"] !== undefined)
					setNestedValue(bodyData, ["library"], argv["library"]);
				if (argv["target-id"] !== undefined)
					setNestedValue(
						bodyData,
						["targetId"],
						resolveFileToken(
							argv["target-id"] as string | undefined,
							"target-id",
							"text"
						)
					);
				if (argv["timeout"] !== undefined)
					setNestedValue(bodyData, ["timeout"], argv["timeout"]);
				const __cfRawBytes = await withProgress(`Creating`, async () =>
					fetchRawBytes(
						`/accounts/${accountId}/browser-rendering/script/${encodeURIComponent(String(argv["session-id"]))}`,
						{
							method: "POST",
							local: argv.local === true,
							persistTo: argv.persistTo as string | undefined,
							body: Object.keys(bodyData).length > 0 ? bodyData : undefined,
						}
					)
				);
				writeRawOutput(
					argv.text === true ? __cfRawBytes.toString("utf-8") : __cfRawBytes
				);
				return;
			}
		),
});

export default command;
