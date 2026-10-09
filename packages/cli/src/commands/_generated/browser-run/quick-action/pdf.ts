import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * pdf command
 * @generated from apis/overlays/browser-run.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseObjectArray,
	setNestedValue,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { fetchRawBytes, writeRawOutput } from "#lib/raw-fetch.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 browser-run quick-action pdf\n\nFetches rendered PDF from provided URL or HTML. Check available options like `gotoOptions` and `waitFor*` to control page load behaviour."
		)
		.option("cache-ttl", {
			type: "number",
			description: "Cache TTL default is 5s. Set to 0 to disable.",
		})
		.option("browser", {
			type: "string",
			description:
				"Rendering backend. Set to `kitesurf` to use Kitesurf (beta).",
			choices: ["kitesurf"],
		})
		.option("action-timeout", {
			type: "number",
			description:
				"The maximum duration allowed for the browser action to complete after the page has loaded (such as taking screenshots, extracting content, or generating PDFs). If this time limit is exceeded, the action stops and returns a timeout error.",
		})
		.option("add-script-tag", {
			type: "string",
			description:
				"Adds a script element into the page with the desired URL or content. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("add-style-tag", {
			type: "string",
			description:
				'Adds a `<link rel="stylesheet">` tag into the page with the desired URL or a `<style type="text/css">` tag with the content. Provide as a JSON array of objects or @path/to/file.json.',
		})
		.option("allow-request-pattern", {
			type: "string",
			array: true,
			description:
				"Only allow requests that match the provided regex patterns, eg. '/^.*\\.(css)'. Reject rules are applied first.",
		})
		.option("authenticate-password", {
			type: "string",
			description: "The authenticate.password field",
		})
		.option("authenticate-username", {
			type: "string",
			description: "The authenticate.username field",
		})
		.option("best-attempt", {
			type: "boolean",
			description: "Attempt to proceed when 'awaited' events fail or timeout.",
		})
		.option("cookies", {
			type: "string",
			description:
				"Check [options](https://pptr.dev/api/puppeteer.page.setcookie). Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("emulate-media-type", {
			type: "string",
			description: "The emulateMediaType field",
		})
		.option("goto-options-referer", {
			type: "string",
			description: "The gotoOptions.referer field",
		})
		.option("goto-options-referrer-policy", {
			type: "string",
			description: "The gotoOptions.referrerPolicy field",
		})
		.option("goto-options-timeout", {
			type: "number",
			description: "The gotoOptions.timeout field",
		})
		.option("html", {
			type: "string",
			description:
				"Set the content of the page, eg: `<h1>Hello World!!</h1>`. Either `html` or `url` must be set.",
		})
		.option("pdf-options-display-header-footer", {
			type: "boolean",
			description: "Whether to show the header and footer.",
		})
		.option("pdf-options-footer-template", {
			type: "string",
			description: "HTML template for the print footer.",
		})
		.option("pdf-options-format", {
			type: "string",
			description: "Paper format. Takes priority over width and height if set.",
			choices: [
				"letter",
				"legal",
				"tabloid",
				"ledger",
				"a0",
				"a1",
				"a2",
				"a3",
				"a4",
				"a5",
				"a6",
			],
		})
		.coerce("pdf-options-format", (value) =>
			resolveFileToken(value, "pdf-options-format", "text")
		)
		.option("pdf-options-header-template", {
			type: "string",
			description: "HTML template for the print header.",
		})
		.option("pdf-options-landscape", {
			type: "boolean",
			description: "Whether to print in landscape orientation.",
		})
		.option("pdf-options-omit-background", {
			type: "boolean",
			description:
				"Hides default white background and allows generating pdfs with transparency.",
		})
		.option("pdf-options-outline", {
			type: "boolean",
			description: "Generate document outline.",
		})
		.option("pdf-options-page-ranges", {
			type: "string",
			description: "Paper ranges to print, e.g. '1-5, 8, 11-13'.",
		})
		.option("pdf-options-prefer-csspage-size", {
			type: "boolean",
			description: "Give CSS @page size priority over other size declarations.",
		})
		.option("pdf-options-print-background", {
			type: "boolean",
			description: "Set to true to print background graphics.",
		})
		.option("pdf-options-scale", {
			type: "number",
			description:
				"Scales the rendering of the web page. Amount must be between 0.1 and 2.",
		})
		.option("pdf-options-tagged", {
			type: "boolean",
			description: "Generate tagged (accessible) PDF.",
		})
		.option("pdf-options-timeout", {
			type: "number",
			description: "Timeout in milliseconds.",
		})
		.option("reject-request-pattern", {
			type: "string",
			array: true,
			description:
				"Block undesired requests that match the provided regex patterns, eg. '/^.*\\.(css)'.",
		})
		.option("set-java-script-enabled", {
			type: "boolean",
			description: "The setJavaScriptEnabled field",
		})
		.option("url", {
			type: "string",
			description: "URL to navigate to, eg. `https://example.com`.",
		})
		.option("user-agent", {
			type: "string",
			description: "The userAgent field",
			default:
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
		})
		.option("viewport-device-scale-factor", {
			type: "number",
			description: "The viewport.deviceScaleFactor field",
		})
		.option("viewport-has-touch", {
			type: "boolean",
			description: "The viewport.hasTouch field",
		})
		.option("viewport-height", {
			type: "number",
			description: "The viewport.height field",
		})
		.option("viewport-is-landscape", {
			type: "boolean",
			description: "The viewport.isLandscape field",
		})
		.option("viewport-is-mobile", {
			type: "boolean",
			description: "The viewport.isMobile field",
		})
		.option("viewport-width", {
			type: "number",
			description: "The viewport.width field",
		})
		.option("wait-for-selector-hidden", {
			type: "boolean",
			description: "The waitForSelector.hidden field",
		})
		.option("wait-for-selector-selector", {
			type: "string",
			description: "The waitForSelector.selector field",
		})
		.option("wait-for-selector-timeout", {
			type: "number",
			description: "The waitForSelector.timeout field",
		})
		.option("wait-for-selector-visible", {
			type: "boolean",
			description: "The waitForSelector.visible field",
		})
		.option("wait-for-timeout", {
			type: "number",
			description: "Waits for a specified timeout before continuing.",
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
		})
		.check((argv) => {
			const groupSet = ["authenticate-password", "authenticate-username"].some(
				(k) => argv[k] !== undefined
			);
			if (groupSet) {
				const missing = [
					"authenticate-password",
					"authenticate-username",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --authenticate-* flag is set`
					);
				}
			}
			return true;
		})
		.check((argv) => {
			const groupSet = [
				"viewport-device-scale-factor",
				"viewport-has-touch",
				"viewport-height",
				"viewport-is-landscape",
				"viewport-is-mobile",
				"viewport-width",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = ["viewport-height", "viewport-width"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --viewport-* flag is set`
					);
				}
			}
			return true;
		})
		.check((argv) => {
			const groupSet = [
				"wait-for-selector-hidden",
				"wait-for-selector-selector",
				"wait-for-selector-timeout",
				"wait-for-selector-visible",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = ["wait-for-selector-selector"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --waitForSelector-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "pdf",
	describe: "Get PDF.",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "browser-run quick-action pdf",
				classification: {
					safeFlags: [
						"browser",
						"best-attempt",
						"pdf-options-display-header-footer",
						"pdf-options-format",
						"pdf-options-landscape",
						"pdf-options-omit-background",
						"pdf-options-outline",
						"pdf-options-prefer-csspage-size",
						"pdf-options-print-background",
						"pdf-options-tagged",
						"set-java-script-enabled",
						"viewport-has-touch",
						"viewport-is-landscape",
						"viewport-is-mobile",
						"wait-for-selector-hidden",
						"wait-for-selector-visible",
						"dry-run",
						"text",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					cacheTTL: argv["cache-ttl"],
					browser: argv["browser"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf browser-run quick-action pdf",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/browser-rendering/pdf`,
						pathParams: {},
						query: queryParams,
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										actionTimeout: argv["action-timeout"],
										addScriptTag: parseObjectArray(
											argv["add-script-tag"],
											"add-script-tag"
										),
										addStyleTag: parseObjectArray(
											argv["add-style-tag"],
											"add-style-tag"
										),
										allowRequestPattern: argv["allow-request-pattern"],
										authenticate: {
											password: resolveFileToken(
												argv["authenticate-password"] as string | undefined,
												"authenticate-password",
												"text"
											),
											username: resolveFileToken(
												argv["authenticate-username"] as string | undefined,
												"authenticate-username",
												"text"
											),
										},
										bestAttempt: argv["best-attempt"],
										cookies: parseObjectArray(argv["cookies"], "cookies"),
										emulateMediaType: resolveFileToken(
											argv["emulate-media-type"] as string | undefined,
											"emulate-media-type",
											"text"
										),
										gotoOptions: {
											referer: resolveFileToken(
												argv["goto-options-referer"] as string | undefined,
												"goto-options-referer",
												"text"
											),
											referrerPolicy: resolveFileToken(
												argv["goto-options-referrer-policy"] as
													| string
													| undefined,
												"goto-options-referrer-policy",
												"text"
											),
											timeout: argv["goto-options-timeout"],
										},
										html: resolveFileToken(
											argv["html"] as string | undefined,
											"html",
											"text"
										),
										pdfOptions: {
											displayHeaderFooter:
												argv["pdf-options-display-header-footer"],
											footerTemplate: resolveFileToken(
												argv["pdf-options-footer-template"] as
													| string
													| undefined,
												"pdf-options-footer-template",
												"text"
											),
											format: argv["pdf-options-format"],
											headerTemplate: resolveFileToken(
												argv["pdf-options-header-template"] as
													| string
													| undefined,
												"pdf-options-header-template",
												"text"
											),
											landscape: argv["pdf-options-landscape"],
											omitBackground: argv["pdf-options-omit-background"],
											outline: argv["pdf-options-outline"],
											pageRanges: resolveFileToken(
												argv["pdf-options-page-ranges"] as string | undefined,
												"pdf-options-page-ranges",
												"text"
											),
											preferCSSPageSize:
												argv["pdf-options-prefer-csspage-size"],
											printBackground: argv["pdf-options-print-background"],
											scale: argv["pdf-options-scale"],
											tagged: argv["pdf-options-tagged"],
											timeout: argv["pdf-options-timeout"],
										},
										rejectRequestPattern: argv["reject-request-pattern"],
										setJavaScriptEnabled: argv["set-java-script-enabled"],
										url: resolveFileToken(
											argv["url"] as string | undefined,
											"url",
											"text"
										),
										userAgent: resolveFileToken(
											argv["user-agent"] as string | undefined,
											"user-agent",
											"text"
										),
										viewport: {
											deviceScaleFactor: argv["viewport-device-scale-factor"],
											hasTouch: argv["viewport-has-touch"],
											height: argv["viewport-height"],
											isLandscape: argv["viewport-is-landscape"],
											isMobile: argv["viewport-is-mobile"],
											width: argv["viewport-width"],
										},
										waitForSelector: {
											hidden: argv["wait-for-selector-hidden"],
											selector: resolveFileToken(
												argv["wait-for-selector-selector"] as
													| string
													| undefined,
												"wait-for-selector-selector",
												"text"
											),
											timeout: argv["wait-for-selector-timeout"],
											visible: argv["wait-for-selector-visible"],
										},
										waitForTimeout: argv["wait-for-timeout"],
									}),
						sensitiveBodyPaths: [["authenticate", "password"]],
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const qs = new URLSearchParams(
						Object.entries(queryParams)
							.filter(([, v]) => v !== undefined)
							.map(([k, v]) => [k, String(v)])
					).toString();
					const __cfRawBytes = await withProgress(`Creating`, async () =>
						fetchRawBytes(
							`/accounts/${accountId}/browser-rendering/pdf${qs ? "?" + qs : ""}`,
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

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["action-timeout"] !== undefined)
					setNestedValue(bodyData, ["actionTimeout"], argv["action-timeout"]);
				if (argv["add-script-tag"] !== undefined)
					setNestedValue(
						bodyData,
						["addScriptTag"],
						parseObjectArray(argv["add-script-tag"], "add-script-tag")
					);
				if (argv["add-style-tag"] !== undefined)
					setNestedValue(
						bodyData,
						["addStyleTag"],
						parseObjectArray(argv["add-style-tag"], "add-style-tag")
					);
				if (argv["allow-request-pattern"] !== undefined)
					setNestedValue(
						bodyData,
						["allowRequestPattern"],
						argv["allow-request-pattern"]
					);
				if (argv["authenticate-password"] !== undefined)
					setNestedValue(
						bodyData,
						["authenticate", "password"],
						resolveFileToken(
							argv["authenticate-password"] as string | undefined,
							"authenticate-password",
							"text"
						)
					);
				if (argv["authenticate-username"] !== undefined)
					setNestedValue(
						bodyData,
						["authenticate", "username"],
						resolveFileToken(
							argv["authenticate-username"] as string | undefined,
							"authenticate-username",
							"text"
						)
					);
				if (argv["best-attempt"] !== undefined)
					setNestedValue(bodyData, ["bestAttempt"], argv["best-attempt"]);
				if (argv["cookies"] !== undefined)
					setNestedValue(
						bodyData,
						["cookies"],
						parseObjectArray(argv["cookies"], "cookies")
					);
				if (argv["emulate-media-type"] !== undefined)
					setNestedValue(
						bodyData,
						["emulateMediaType"],
						resolveFileToken(
							argv["emulate-media-type"] as string | undefined,
							"emulate-media-type",
							"text"
						)
					);
				if (argv["goto-options-referer"] !== undefined)
					setNestedValue(
						bodyData,
						["gotoOptions", "referer"],
						resolveFileToken(
							argv["goto-options-referer"] as string | undefined,
							"goto-options-referer",
							"text"
						)
					);
				if (argv["goto-options-referrer-policy"] !== undefined)
					setNestedValue(
						bodyData,
						["gotoOptions", "referrerPolicy"],
						resolveFileToken(
							argv["goto-options-referrer-policy"] as string | undefined,
							"goto-options-referrer-policy",
							"text"
						)
					);
				if (argv["goto-options-timeout"] !== undefined)
					setNestedValue(
						bodyData,
						["gotoOptions", "timeout"],
						argv["goto-options-timeout"]
					);
				if (argv["html"] !== undefined)
					setNestedValue(
						bodyData,
						["html"],
						resolveFileToken(argv["html"] as string | undefined, "html", "text")
					);
				if (argv["pdf-options-display-header-footer"] !== undefined)
					setNestedValue(
						bodyData,
						["pdfOptions", "displayHeaderFooter"],
						argv["pdf-options-display-header-footer"]
					);
				if (argv["pdf-options-footer-template"] !== undefined)
					setNestedValue(
						bodyData,
						["pdfOptions", "footerTemplate"],
						resolveFileToken(
							argv["pdf-options-footer-template"] as string | undefined,
							"pdf-options-footer-template",
							"text"
						)
					);
				if (argv["pdf-options-format"] !== undefined)
					setNestedValue(
						bodyData,
						["pdfOptions", "format"],
						argv["pdf-options-format"]
					);
				if (argv["pdf-options-header-template"] !== undefined)
					setNestedValue(
						bodyData,
						["pdfOptions", "headerTemplate"],
						resolveFileToken(
							argv["pdf-options-header-template"] as string | undefined,
							"pdf-options-header-template",
							"text"
						)
					);
				if (argv["pdf-options-landscape"] !== undefined)
					setNestedValue(
						bodyData,
						["pdfOptions", "landscape"],
						argv["pdf-options-landscape"]
					);
				if (argv["pdf-options-omit-background"] !== undefined)
					setNestedValue(
						bodyData,
						["pdfOptions", "omitBackground"],
						argv["pdf-options-omit-background"]
					);
				if (argv["pdf-options-outline"] !== undefined)
					setNestedValue(
						bodyData,
						["pdfOptions", "outline"],
						argv["pdf-options-outline"]
					);
				if (argv["pdf-options-page-ranges"] !== undefined)
					setNestedValue(
						bodyData,
						["pdfOptions", "pageRanges"],
						resolveFileToken(
							argv["pdf-options-page-ranges"] as string | undefined,
							"pdf-options-page-ranges",
							"text"
						)
					);
				if (argv["pdf-options-prefer-csspage-size"] !== undefined)
					setNestedValue(
						bodyData,
						["pdfOptions", "preferCSSPageSize"],
						argv["pdf-options-prefer-csspage-size"]
					);
				if (argv["pdf-options-print-background"] !== undefined)
					setNestedValue(
						bodyData,
						["pdfOptions", "printBackground"],
						argv["pdf-options-print-background"]
					);
				if (argv["pdf-options-scale"] !== undefined)
					setNestedValue(
						bodyData,
						["pdfOptions", "scale"],
						argv["pdf-options-scale"]
					);
				if (argv["pdf-options-tagged"] !== undefined)
					setNestedValue(
						bodyData,
						["pdfOptions", "tagged"],
						argv["pdf-options-tagged"]
					);
				if (argv["pdf-options-timeout"] !== undefined)
					setNestedValue(
						bodyData,
						["pdfOptions", "timeout"],
						argv["pdf-options-timeout"]
					);
				if (argv["reject-request-pattern"] !== undefined)
					setNestedValue(
						bodyData,
						["rejectRequestPattern"],
						argv["reject-request-pattern"]
					);
				if (argv["set-java-script-enabled"] !== undefined)
					setNestedValue(
						bodyData,
						["setJavaScriptEnabled"],
						argv["set-java-script-enabled"]
					);
				if (argv["url"] !== undefined)
					setNestedValue(
						bodyData,
						["url"],
						resolveFileToken(argv["url"] as string | undefined, "url", "text")
					);
				if (argv["user-agent"] !== undefined)
					setNestedValue(
						bodyData,
						["userAgent"],
						resolveFileToken(
							argv["user-agent"] as string | undefined,
							"user-agent",
							"text"
						)
					);
				if (argv["viewport-device-scale-factor"] !== undefined)
					setNestedValue(
						bodyData,
						["viewport", "deviceScaleFactor"],
						argv["viewport-device-scale-factor"]
					);
				if (argv["viewport-has-touch"] !== undefined)
					setNestedValue(
						bodyData,
						["viewport", "hasTouch"],
						argv["viewport-has-touch"]
					);
				if (argv["viewport-height"] !== undefined)
					setNestedValue(
						bodyData,
						["viewport", "height"],
						argv["viewport-height"]
					);
				if (argv["viewport-is-landscape"] !== undefined)
					setNestedValue(
						bodyData,
						["viewport", "isLandscape"],
						argv["viewport-is-landscape"]
					);
				if (argv["viewport-is-mobile"] !== undefined)
					setNestedValue(
						bodyData,
						["viewport", "isMobile"],
						argv["viewport-is-mobile"]
					);
				if (argv["viewport-width"] !== undefined)
					setNestedValue(
						bodyData,
						["viewport", "width"],
						argv["viewport-width"]
					);
				if (argv["wait-for-selector-hidden"] !== undefined)
					setNestedValue(
						bodyData,
						["waitForSelector", "hidden"],
						argv["wait-for-selector-hidden"]
					);
				if (argv["wait-for-selector-selector"] !== undefined)
					setNestedValue(
						bodyData,
						["waitForSelector", "selector"],
						resolveFileToken(
							argv["wait-for-selector-selector"] as string | undefined,
							"wait-for-selector-selector",
							"text"
						)
					);
				if (argv["wait-for-selector-timeout"] !== undefined)
					setNestedValue(
						bodyData,
						["waitForSelector", "timeout"],
						argv["wait-for-selector-timeout"]
					);
				if (argv["wait-for-selector-visible"] !== undefined)
					setNestedValue(
						bodyData,
						["waitForSelector", "visible"],
						argv["wait-for-selector-visible"]
					);
				if (argv["wait-for-timeout"] !== undefined)
					setNestedValue(
						bodyData,
						["waitForTimeout"],
						argv["wait-for-timeout"]
					);
				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const __cfRawBytes = await withProgress(`Creating`, async () =>
					fetchRawBytes(
						`/accounts/${accountId}/browser-rendering/pdf${qs ? "?" + qs : ""}`,
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
