import operation from "../../_operations/browser-run/quick-action/snapshot.js";
/**
 * snapshot command
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
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "snapshot",
	describe: "Capture multiple page formats.",
	usage:
		"$0 browser-run quick-action snapshot\n\nCapture at least two formats from one prepared page: HTML, screenshot, Markdown, accessibility tree, PDF, links, scrape, or JSON. Defaults to HTML and screenshot. Format-specific options use the same fields as standalone actions. Scrape requires elements. An origin 304 returns HTTP 200 with an empty result and meta.status 304, without captures or AI work, and is not cached. JSON snapshots share one actionTimeout budget across navigation, captures, retries, and AI (default 60 seconds, maximum 120 seconds). Other snapshots retain existing timeout behavior. Formats use a fixed capture order, not array order; a live page may change between captures. Any format failure fails the request.",
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
		"custom-ai": {
			kind: "parsed",
			brief:
				'Optional list of custom AI models to use for the request. The models will be tried in the order provided, and in case a model returns an error, the next one will be used as fallback. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"model": string, "authorization"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		elements: {
			kind: "parsed",
			brief:
				'The elements field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"selector": string}].',
			optional: true,
			parse: String,
		},
		"emulate-media-type": {
			kind: "parsed",
			brief: "The emulateMediaType field",
			optional: true,
			parse: String,
		},
		"exclude-external-links": {
			kind: "boolean",
			brief: "The excludeExternalLinks field",
			default: false,
		},
		formats: {
			kind: "parsed",
			brief: "The formats field",
			variadic: true,
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
		"interesting-only": {
			kind: "boolean",
			brief: "The interestingOnly field",
			optional: true,
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
		prompt: {
			kind: "parsed",
			brief: "The prompt field",
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
		"response-format-json-schema": {
			kind: "parsed",
			brief:
				'Schema for the response format. More information here: https://developers.cloudflare.com/workers-ai/json-mode/. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		"response-format-type": {
			kind: "parsed",
			brief: "The response_format.type field",
			optional: true,
			parse: String,
		},
		root: {
			kind: "parsed",
			brief: "The root field",
			optional: true,
			parse: String,
		},
		"screenshot-options-capture-beyond-viewport": {
			kind: "boolean",
			brief: "The screenshotOptions.captureBeyondViewport field",
			optional: true,
		},
		"screenshot-options-clip-height": {
			kind: "parsed",
			brief: "The screenshotOptions.clip.height field",
			optional: true,
			parse: Number,
		},
		"screenshot-options-clip-scale": {
			kind: "parsed",
			brief: "The screenshotOptions.clip.scale field",
			optional: true,
			parse: Number,
		},
		"screenshot-options-clip-width": {
			kind: "parsed",
			brief: "The screenshotOptions.clip.width field",
			optional: true,
			parse: Number,
		},
		"screenshot-options-clip-x": {
			kind: "parsed",
			brief: "The screenshotOptions.clip.x field",
			optional: true,
			parse: Number,
		},
		"screenshot-options-clip-y": {
			kind: "parsed",
			brief: "The screenshotOptions.clip.y field",
			optional: true,
			parse: Number,
		},
		"screenshot-options-from-surface": {
			kind: "boolean",
			brief: "The screenshotOptions.fromSurface field",
			optional: true,
		},
		"screenshot-options-full-page": {
			kind: "boolean",
			brief: "The screenshotOptions.fullPage field",
			optional: true,
		},
		"screenshot-options-omit-background": {
			kind: "boolean",
			brief: "The screenshotOptions.omitBackground field",
			optional: true,
		},
		"screenshot-options-optimize-for-speed": {
			kind: "boolean",
			brief: "The screenshotOptions.optimizeForSpeed field",
			optional: true,
		},
		"screenshot-options-quality": {
			kind: "parsed",
			brief: "The screenshotOptions.quality field",
			optional: true,
			parse: Number,
		},
		"screenshot-options-type": {
			kind: "parsed",
			brief: "The screenshotOptions.type field",
			optional: true,
			choices: ["png", "jpeg", "webp"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "screenshot-options-type", "text"),
		},
		"scroll-page": {
			kind: "boolean",
			brief: "The scrollPage field",
			optional: true,
		},
		selector: {
			kind: "parsed",
			brief: "The selector field",
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
		"visible-links-only": {
			kind: "boolean",
			brief: "The visibleLinksOnly field",
			default: false,
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
				"response-format-json-schema",
				"response-format-type",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = ["response-format-type"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --response-format-* flag is set`
					);
				}
			}
			return true;
		});
		rules.check((argv) => {
			const groupSet = [
				"screenshot-options-clip-height",
				"screenshot-options-clip-scale",
				"screenshot-options-clip-width",
				"screenshot-options-clip-x",
				"screenshot-options-clip-y",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"screenshot-options-clip-height",
					"screenshot-options-clip-width",
					"screenshot-options-clip-x",
					"screenshot-options-clip-y",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --screenshot-options-clip-* flag is set`
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
				command: "browser-run quick-action snapshot",
				classification: {
					safeFlags: [
						"browser",
						"best-attempt",
						"exclude-external-links",
						"interesting-only",
						"pdf-options-display-header-footer",
						"pdf-options-format",
						"pdf-options-landscape",
						"pdf-options-omit-background",
						"pdf-options-outline",
						"pdf-options-prefer-csspage-size",
						"pdf-options-print-background",
						"pdf-options-tagged",
						"screenshot-options-capture-beyond-viewport",
						"screenshot-options-from-surface",
						"screenshot-options-full-page",
						"screenshot-options-omit-background",
						"screenshot-options-optimize-for-speed",
						"screenshot-options-type",
						"scroll-page",
						"set-java-script-enabled",
						"viewport-has-touch",
						"viewport-is-landscape",
						"viewport-is-mobile",
						"visible-links-only",
						"wait-for-selector-hidden",
						"wait-for-selector-visible",
						"dry-run",
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
						command: "cf browser-run quick-action snapshot",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/browser-rendering/snapshot`,
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
											custom_ai: parseObjectArray(
												argv["custom-ai"],
												"custom-ai"
											),
											elements: parseObjectArray(argv["elements"], "elements"),
											emulateMediaType: resolveFileToken(
												argv["emulate-media-type"] as string | undefined,
												"emulate-media-type",
												"text"
											),
											excludeExternalLinks: argv["exclude-external-links"],
											formats: argv["formats"],
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
											interestingOnly: argv["interesting-only"],
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
											prompt: resolveFileToken(
												argv["prompt"] as string | undefined,
												"prompt",
												"text"
											),
											rejectRequestPattern: argv["reject-request-pattern"],
											rejectResourceTypes: argv["reject-resource-types"],
											response_format: {
												json_schema: parseJsonMap(
													argv["response-format-json-schema"],
													"response-format-json-schema"
												),
												type: resolveFileToken(
													argv["response-format-type"] as string | undefined,
													"response-format-type",
													"text"
												),
											},
											root: resolveFileToken(
												argv["root"] as string | undefined,
												"root",
												"text"
											),
											screenshotOptions: {
												captureBeyondViewport:
													argv["screenshot-options-capture-beyond-viewport"],
												clip: {
													height: argv["screenshot-options-clip-height"],
													scale: argv["screenshot-options-clip-scale"],
													width: argv["screenshot-options-clip-width"],
													x: argv["screenshot-options-clip-x"],
													y: argv["screenshot-options-clip-y"],
												},
												fromSurface: argv["screenshot-options-from-surface"],
												fullPage: argv["screenshot-options-full-page"],
												omitBackground:
													argv["screenshot-options-omit-background"],
												optimizeForSpeed:
													argv["screenshot-options-optimize-for-speed"],
												quality: argv["screenshot-options-quality"],
												type: argv["screenshot-options-type"],
											},
											scrollPage: argv["scroll-page"],
											selector: resolveFileToken(
												argv["selector"] as string | undefined,
												"selector",
												"text"
											),
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
											visibleLinksOnly: argv["visible-links-only"],
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
										[
											["response_format", "json_schema"],
											["setExtraHTTPHeaders"],
										]
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
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							...queryParams,
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody(
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
						custom_ai: parseObjectArray(argv["custom-ai"], "custom-ai"),
						elements: parseObjectArray(argv["elements"], "elements"),
						emulateMediaType: resolveFileToken(
							argv["emulate-media-type"] as string | undefined,
							"emulate-media-type",
							"text"
						),
						excludeExternalLinks: argv["exclude-external-links"],
						formats: argv["formats"],
						gotoOptions: {
							referer: resolveFileToken(
								argv["goto-options-referer"] as string | undefined,
								"goto-options-referer",
								"text"
							),
							referrerPolicy: resolveFileToken(
								argv["goto-options-referrer-policy"] as string | undefined,
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
						interestingOnly: argv["interesting-only"],
						pdfOptions: {
							displayHeaderFooter: argv["pdf-options-display-header-footer"],
							footerTemplate: resolveFileToken(
								argv["pdf-options-footer-template"] as string | undefined,
								"pdf-options-footer-template",
								"text"
							),
							format: argv["pdf-options-format"],
							headerTemplate: resolveFileToken(
								argv["pdf-options-header-template"] as string | undefined,
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
							preferCSSPageSize: argv["pdf-options-prefer-csspage-size"],
							printBackground: argv["pdf-options-print-background"],
							scale: argv["pdf-options-scale"],
							tagged: argv["pdf-options-tagged"],
							timeout: argv["pdf-options-timeout"],
							width: parseScalarValue(
								argv["pdf-options-width"],
								"pdf-options-width"
							),
						},
						prompt: resolveFileToken(
							argv["prompt"] as string | undefined,
							"prompt",
							"text"
						),
						rejectRequestPattern: argv["reject-request-pattern"],
						rejectResourceTypes: argv["reject-resource-types"],
						response_format: {
							json_schema: parseJsonMap(
								argv["response-format-json-schema"],
								"response-format-json-schema"
							),
							type: resolveFileToken(
								argv["response-format-type"] as string | undefined,
								"response-format-type",
								"text"
							),
						},
						root: resolveFileToken(
							argv["root"] as string | undefined,
							"root",
							"text"
						),
						screenshotOptions: {
							captureBeyondViewport:
								argv["screenshot-options-capture-beyond-viewport"],
							clip: {
								height: argv["screenshot-options-clip-height"],
								scale: argv["screenshot-options-clip-scale"],
								width: argv["screenshot-options-clip-width"],
								x: argv["screenshot-options-clip-x"],
								y: argv["screenshot-options-clip-y"],
							},
							fromSurface: argv["screenshot-options-from-surface"],
							fullPage: argv["screenshot-options-full-page"],
							omitBackground: argv["screenshot-options-omit-background"],
							optimizeForSpeed: argv["screenshot-options-optimize-for-speed"],
							quality: argv["screenshot-options-quality"],
							type: argv["screenshot-options-type"],
						},
						scrollPage: argv["scroll-page"],
						selector: resolveFileToken(
							argv["selector"] as string | undefined,
							"selector",
							"text"
						),
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
						visibleLinksOnly: argv["visible-links-only"],
						waitForSelector: {
							hidden: argv["wait-for-selector-hidden"],
							selector: resolveFileToken(
								argv["wait-for-selector-selector"] as string | undefined,
								"wait-for-selector-selector",
								"text"
							),
							timeout: argv["wait-for-selector-timeout"],
							visible: argv["wait-for-selector-visible"],
						},
						waitForTimeout: argv["wait-for-timeout"],
					},
					[["response_format", "json_schema"], ["setExtraHTTPHeaders"]]
				);
				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
