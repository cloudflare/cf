import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
 * @generated from apis/overlays/browser-run.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 browser-run script create\n\nAcquires a browser session and runs the provided code in it. The session stays open for reuse; close it with `DELETE /devtools/browser/:sessionId` or `browser.close()`, otherwise it ends at the idle timeout."
		)
		.option("keep-alive", {
			type: "number",
			description: "Keep-alive time in milliseconds",
		})
		.option("lab", {
			type: "boolean",
			description: "Use experimental browser.",
		})
		.option("recording", {
			type: "boolean",
			description:
				"Record the browser session. Retrieve it with `GET /recording/:session_id`.",
		})
		.option("browser", {
			type: "string",
			description:
				"Rendering backend for this script. Set to `kitesurf` to run it on Kitesurf (beta), which supports CDP only and rejects `keep_alive`, `lab` and `recording`.",
			choices: ["kitesurf"],
		})
		.option("code", {
			type: "string",
			description:
				"Function body executed against the selected library's runner.",
		})
		.option("library", {
			type: "string",
			description:
				"Library the script runs with. Defaults to raw CDP when omitted.",
			choices: ["playwright", "puppeteer"],
		})
		.coerce("library", (value) => resolveFileToken(value, "library", "text"))
		.option("timeout", {
			type: "number",
			description: "Maximum script run time in milliseconds.",
			default: 60000,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.option("text", {
			type: "boolean",
			description:
				"Decode the response body as UTF-8 text instead of writing raw bytes",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Dynamic Script - execute code and return browser session details.",
	builder,
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
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					keep_alive: argv["keep-alive"],
					lab: argv["lab"],
					recording: argv["recording"],
					browser: argv["browser"],
				};
				if (argv.dryRun) {
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
				if (argv["code"] === undefined) {
					argv["code"] = await promptForRequiredField(
						"code",
						"Function body executed against the selected library's runner."
					);
				}

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
};

export default command;
