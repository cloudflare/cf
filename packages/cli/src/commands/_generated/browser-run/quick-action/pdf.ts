/**
 * pdf command
 * @generated from apis/overlays/browser-run.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseJsonMap,
	parseObjectArray,
	parseScalarValue,
	setNestedValue,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { fetchRawBytes, writeRawOutput } from "#lib/raw-fetch.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "pdf",
	describe: "Get PDF.",
	usage:
		"$0 browser-run quick-action pdf\n\nFetches rendered PDF from provided URL or HTML. Check available options like `gotoOptions` and `waitFor*` to control page load behaviour.",
	flags: {
		"cache-ttl": {
			kind: "parsed",
			brief: "Cache TTL default is 5s. Set to 0 to disable.",
			optional: true,
			parse: Number,
		},
		browser: {
			kind: "enum",
			brief: "Rendering backend. Set to `kitesurf` to use Kitesurf (beta).",
			values: ["kitesurf"],
			optional: true,
		},
		"action-timeout": {
			kind: "parsed",
			brief:
				"The maximum duration allowed for the browser action to complete after the page has loaded (such as taking screenshots, extracting content, or generating PDFs). If this time limit is exceeded, the action stops and returns a timeout error.",
			optional: true,
			parse: Number,
		},
		"add-script-tag": {
			kind: "parsed",
			brief:
				'Adds a script element into the page with the desired URL or content. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"content"?: string, "id"?: string, "type"?: string, "url"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"add-style-tag": {
			kind: "parsed",
			brief:
				'Adds a `<link rel="stylesheet">` tag into the page with the desired URL or a `<style type="text/css">` tag with the content. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"content"?: string, "url"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"allow-request-pattern": {
			kind: "parsed",
			brief:
				"Only allow requests that match the provided regex patterns, eg. '/^.*\\.(css)'. Reject rules are applied first.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"allow-resource-types": {
			kind: "parsed",
			brief:
				"Only allow requests that match the provided resource types, eg. 'image' or 'script'. Reject rules are applied first.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"authenticate-password": {
			kind: "parsed",
			brief: "The authenticate.password field",
			optional: true,
			parse: String,
		},
		"authenticate-username": {
			kind: "parsed",
			brief: "The authenticate.username field",
			optional: true,
			parse: String,
		},
		"best-attempt": {
			kind: "boolean",
			brief: "Attempt to proceed when 'awaited' events fail or timeout.",
			optional: true,
		},
		cookies: {
			kind: "parsed",
			brief:
				'Check [options](https://pptr.dev/api/puppeteer.page.setcookie). Provide as a JSON array of objects or @path/to/file.json. Shape: [{"name": string, "value": string, "domain"?: string, "expires"?: number, "httpOnly"?: boolean, ...more}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"emulate-media-type": {
			kind: "parsed",
			brief: "The emulateMediaType field",
			optional: true,
			parse: String,
		},
		"goto-options-referer": {
			kind: "parsed",
			brief: "The gotoOptions.referer field",
			optional: true,
			parse: String,
		},
		"goto-options-referrer-policy": {
			kind: "parsed",
			brief: "The gotoOptions.referrerPolicy field",
			optional: true,
			parse: String,
		},
		"goto-options-timeout": {
			kind: "parsed",
			brief: "The gotoOptions.timeout field",
			optional: true,
			parse: Number,
		},
		html: {
			kind: "parsed",
			brief:
				"Set the content of the page, eg: `<h1>Hello World!!</h1>`. Either `html` or `url` must be set.",
			optional: true,
			parse: String,
		},
		"pdf-options-display-header-footer": {
			kind: "boolean",
			brief: "Whether to show the header and footer.",
			optional: true,
		},
		"pdf-options-footer-template": {
			kind: "parsed",
			brief: "HTML template for the print footer.",
			optional: true,
			parse: String,
		},
		"pdf-options-format": {
			kind: "parsed",
			brief: "Paper format. Takes priority over width and height if set.",
			optional: true,
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
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "pdf-options-format", "text"),
		},
		"pdf-options-header-template": {
			kind: "parsed",
			brief: "HTML template for the print header.",
			optional: true,
			parse: String,
		},
		"pdf-options-height": {
			kind: "parsed",
			brief:
				"Sets the height of paper. Can be a number or string with unit. Accepts a JSON scalar or plain string, or @path/to/file.",
			optional: true,
			parse: String,
		},
		"pdf-options-landscape": {
			kind: "boolean",
			brief: "Whether to print in landscape orientation.",
			optional: true,
		},
		"pdf-options-margin-bottom": {
			kind: "parsed",
			brief:
				"The pdfOptions.margin.bottom field. Accepts a JSON scalar or plain string, or @path/to/file.",
			optional: true,
			parse: String,
		},
		"pdf-options-margin-left": {
			kind: "parsed",
			brief:
				"The pdfOptions.margin.left field. Accepts a JSON scalar or plain string, or @path/to/file.",
			optional: true,
			parse: String,
		},
		"pdf-options-margin-right": {
			kind: "parsed",
			brief:
				"The pdfOptions.margin.right field. Accepts a JSON scalar or plain string, or @path/to/file.",
			optional: true,
			parse: String,
		},
		"pdf-options-margin-top": {
			kind: "parsed",
			brief:
				"The pdfOptions.margin.top field. Accepts a JSON scalar or plain string, or @path/to/file.",
			optional: true,
			parse: String,
		},
		"pdf-options-omit-background": {
			kind: "boolean",
			brief:
				"Hides default white background and allows generating pdfs with transparency.",
			optional: true,
		},
		"pdf-options-outline": {
			kind: "boolean",
			brief: "Generate document outline.",
			optional: true,
		},
		"pdf-options-page-ranges": {
			kind: "parsed",
			brief: "Paper ranges to print, e.g. '1-5, 8, 11-13'.",
			optional: true,
			parse: String,
		},
		"pdf-options-prefer-csspage-size": {
			kind: "boolean",
			brief: "Give CSS @page size priority over other size declarations.",
			optional: true,
		},
		"pdf-options-print-background": {
			kind: "boolean",
			brief: "Set to true to print background graphics.",
			optional: true,
		},
		"pdf-options-scale": {
			kind: "parsed",
			brief:
				"Scales the rendering of the web page. Amount must be between 0.1 and 2.",
			optional: true,
			parse: Number,
		},
		"pdf-options-tagged": {
			kind: "boolean",
			brief: "Generate tagged (accessible) PDF.",
			optional: true,
		},
		"pdf-options-timeout": {
			kind: "parsed",
			brief: "Timeout in milliseconds.",
			optional: true,
			parse: Number,
		},
		"pdf-options-width": {
			kind: "parsed",
			brief:
				"Sets the width of paper. Can be a number or string with unit. Accepts a JSON scalar or plain string, or @path/to/file.",
			optional: true,
			parse: String,
		},
		"reject-request-pattern": {
			kind: "parsed",
			brief:
				"Block undesired requests that match the provided regex patterns, eg. '/^.*\\.(css)'.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"reject-resource-types": {
			kind: "parsed",
			brief:
				"Block undesired requests that match the provided resource types, eg. 'image' or 'script'.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"set-extra-httpheaders": {
			kind: "parsed",
			brief:
				'The setExtraHTTPHeaders field. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
			optional: true,
			parse: String,
		},
		"set-java-script-enabled": {
			kind: "boolean",
			brief: "The setJavaScriptEnabled field",
			optional: true,
		},
		url: {
			kind: "parsed",
			brief: "URL to navigate to, eg. `https://example.com`.",
			optional: true,
			parse: String,
		},
		"user-agent": {
			kind: "parsed",
			brief: "The userAgent field",
			default:
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36",
			parse: String,
		},
		"viewport-device-scale-factor": {
			kind: "parsed",
			brief: "The viewport.deviceScaleFactor field",
			optional: true,
			parse: Number,
		},
		"viewport-has-touch": {
			kind: "boolean",
			brief: "The viewport.hasTouch field",
			optional: true,
		},
		"viewport-height": {
			kind: "parsed",
			brief: "The viewport.height field",
			optional: true,
			parse: Number,
		},
		"viewport-is-landscape": {
			kind: "boolean",
			brief: "The viewport.isLandscape field",
			optional: true,
		},
		"viewport-is-mobile": {
			kind: "boolean",
			brief: "The viewport.isMobile field",
			optional: true,
		},
		"viewport-width": {
			kind: "parsed",
			brief: "The viewport.width field",
			optional: true,
			parse: Number,
		},
		"wait-for-selector-hidden": {
			kind: "boolean",
			brief: "The waitForSelector.hidden field",
			optional: true,
		},
		"wait-for-selector-selector": {
			kind: "parsed",
			brief: "The waitForSelector.selector field",
			optional: true,
			parse: String,
		},
		"wait-for-selector-timeout": {
			kind: "parsed",
			brief: "The waitForSelector.timeout field",
			optional: true,
			parse: Number,
		},
		"wait-for-selector-visible": {
			kind: "boolean",
			brief: "The waitForSelector.visible field",
			optional: true,
		},
		"wait-for-timeout": {
			kind: "parsed",
			brief: "Waits for a specified timeout before continuing.",
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
		text: {
			kind: "boolean",
			brief:
				"Decode the response body as UTF-8 text instead of writing raw bytes",
			default: false,
		},
	},
	operands: [],
	rules(rules) {
		rules.check((argv) => {
			const groupSet = ["authenticate-password", "authenticate-username"].some(
				(k) => argv[k] !== undefined
			);
			if (!argv.body && groupSet) {
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
		});
		rules.check((argv) => {
			const groupSet = [
				"viewport-device-scale-factor",
				"viewport-has-touch",
				"viewport-height",
				"viewport-is-landscape",
				"viewport-is-mobile",
				"viewport-width",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
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
		});
		rules.check((argv) => {
			const groupSet = [
				"wait-for-selector-hidden",
				"wait-for-selector-selector",
				"wait-for-selector-timeout",
				"wait-for-selector-visible",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = ["wait-for-selector-selector"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --wait-for-selector-* flag is set`
					);
				}
			}
			return true;
		});
	},
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
				} satisfies ArgClassification<typeof argv>,
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
								: compactBody(
										{
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
											allowResourceTypes: argv["allow-resource-types"],
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
												height: parseScalarValue(
													argv["pdf-options-height"],
													"pdf-options-height"
												),
												landscape: argv["pdf-options-landscape"],
												margin: {
													bottom: parseScalarValue(
														argv["pdf-options-margin-bottom"],
														"pdf-options-margin-bottom"
													),
													left: parseScalarValue(
														argv["pdf-options-margin-left"],
														"pdf-options-margin-left"
													),
													right: parseScalarValue(
														argv["pdf-options-margin-right"],
														"pdf-options-margin-right"
													),
													top: parseScalarValue(
														argv["pdf-options-margin-top"],
														"pdf-options-margin-top"
													),
												},
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
												width: parseScalarValue(
													argv["pdf-options-width"],
													"pdf-options-width"
												),
											},
											rejectRequestPattern: argv["reject-request-pattern"],
											rejectResourceTypes: argv["reject-resource-types"],
											setExtraHTTPHeaders: parseJsonMap(
												argv["set-extra-httpheaders"],
												"set-extra-httpheaders"
											),
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
										},
										[["setExtraHTTPHeaders"]]
									),
						sensitiveBodyPaths: [["authenticate", "password"]],
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
				if (argv["allow-resource-types"] !== undefined)
					setNestedValue(
						bodyData,
						["allowResourceTypes"],
						argv["allow-resource-types"]
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
				if (argv["pdf-options-height"] !== undefined)
					setNestedValue(
						bodyData,
						["pdfOptions", "height"],
						parseScalarValue(argv["pdf-options-height"], "pdf-options-height")
					);
				if (argv["pdf-options-landscape"] !== undefined)
					setNestedValue(
						bodyData,
						["pdfOptions", "landscape"],
						argv["pdf-options-landscape"]
					);
				if (argv["pdf-options-margin-bottom"] !== undefined)
					setNestedValue(
						bodyData,
						["pdfOptions", "margin", "bottom"],
						parseScalarValue(
							argv["pdf-options-margin-bottom"],
							"pdf-options-margin-bottom"
						)
					);
				if (argv["pdf-options-margin-left"] !== undefined)
					setNestedValue(
						bodyData,
						["pdfOptions", "margin", "left"],
						parseScalarValue(
							argv["pdf-options-margin-left"],
							"pdf-options-margin-left"
						)
					);
				if (argv["pdf-options-margin-right"] !== undefined)
					setNestedValue(
						bodyData,
						["pdfOptions", "margin", "right"],
						parseScalarValue(
							argv["pdf-options-margin-right"],
							"pdf-options-margin-right"
						)
					);
				if (argv["pdf-options-margin-top"] !== undefined)
					setNestedValue(
						bodyData,
						["pdfOptions", "margin", "top"],
						parseScalarValue(
							argv["pdf-options-margin-top"],
							"pdf-options-margin-top"
						)
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
				if (argv["pdf-options-width"] !== undefined)
					setNestedValue(
						bodyData,
						["pdfOptions", "width"],
						parseScalarValue(argv["pdf-options-width"], "pdf-options-width")
					);
				if (argv["reject-request-pattern"] !== undefined)
					setNestedValue(
						bodyData,
						["rejectRequestPattern"],
						argv["reject-request-pattern"]
					);
				if (argv["reject-resource-types"] !== undefined)
					setNestedValue(
						bodyData,
						["rejectResourceTypes"],
						argv["reject-resource-types"]
					);
				if (argv["set-extra-httpheaders"] !== undefined)
					setNestedValue(
						bodyData,
						["setExtraHTTPHeaders"],
						parseJsonMap(argv["set-extra-httpheaders"], "set-extra-httpheaders")
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
});

export default command;
