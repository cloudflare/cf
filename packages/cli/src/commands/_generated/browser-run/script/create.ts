/**
 * create command
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
	command: "create",
	describe: "Dynamic Script - execute code and return browser session details.",
	usage:
		"$0 browser-run script create\n\nAcquires a browser session and runs the provided code in it. The session stays open for reuse; close it with `DELETE /devtools/browser/:sessionId` or `browser.close()`, otherwise it ends at the idle timeout.",
	flags: {
		"keep-alive": {
			kind: "parsed",
			brief: "Keep-alive time in milliseconds",
			optional: true,
			parse: Number,
		},
		lab: {
			kind: "boolean",
			brief: "Use experimental browser.",
			optional: true,
		},
		recording: {
			kind: "boolean",
			brief:
				"Record the browser session. Retrieve it with `GET /recording/:session_id`.",
			optional: true,
		},
		browser: {
			kind: "enum",
			brief:
				"Rendering backend for this script. Set to `kitesurf` to run it on Kitesurf (beta), which supports CDP only and rejects `keep_alive`, `lab` and `recording`.",
			values: ["kitesurf"],
			optional: true,
		},
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
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "browser-run script create",
				classification: {
					safeFlags: [
						"lab",
						"recording",
						"browser",
						"library",
						"dry-run",
						"text",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					keep_alive: argv["keep-alive"],
					lab: argv["lab"],
					recording: argv["recording"],
					browser: argv["browser"],
				};
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
						command: "cf browser-run script create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/browser-rendering/script`,
						pathParams: {},
						query: queryParams,
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
					const qs = new URLSearchParams(
						Object.entries(queryParams)
							.filter(([, v]) => v !== undefined)
							.map(([k, v]) => [k, String(v)])
					).toString();
					const __cfRawBytes = await withProgress(`Creating`, async () =>
						fetchRawBytes(
							`/accounts/${accountId}/browser-rendering/script${qs ? "?" + qs : ""}`,
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
				if (argv["timeout"] !== undefined)
					setNestedValue(bodyData, ["timeout"], argv["timeout"]);
				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const __cfRawBytes = await withProgress(`Creating`, async () =>
					fetchRawBytes(
						`/accounts/${accountId}/browser-rendering/script${qs ? "?" + qs : ""}`,
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
