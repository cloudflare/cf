import operation from "../../_operations/browser-run/quick-action/snapshot.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * snapshot command
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 browser-run quick-action snapshot\n\nCapture at least two formats from one prepared page: HTML, screenshot, Markdown, accessibility tree, PDF, links, scrape, or JSON. Defaults to HTML and screenshot. Format-specific options use the same fields as standalone actions. Scrape requires elements. An origin 304 returns HTTP 200 with an empty result and meta.status 304, without captures or AI work, and is not cached. JSON snapshots share one actionTimeout budget across navigation, captures, retries, and AI (default 60 seconds, maximum 120 seconds). Other snapshots retain existing timeout behavior. Formats use a fixed capture order, not array order; a live page may change between captures. Any format failure fails the request."
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
				'Adds a script element into the page with the desired URL or content. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"content"?: string, "id"?: string, "type"?: string, "url"?: string}]. ? marks optional keys.',
		})
		.option("add-style-tag", {
			type: "string",
			description:
				'Adds a `<link rel="stylesheet">` tag into the page with the desired URL or a `<style type="text/css">` tag with the content. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"content"?: string, "url"?: string}]. ? marks optional keys.',
		})
		.option("allow-request-pattern", {
			type: "string",
			array: true,
			description:
				"Only allow requests that match the provided regex patterns, eg. '/^.*\\.(css)'. Reject rules are applied first.",
		})
		.option("allow-resource-types", {
			type: "string",
			array: true,
			description:
				"Only allow requests that match the provided resource types, eg. 'image' or 'script'. Reject rules are applied first.",
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
				'Check [options](https://pptr.dev/api/puppeteer.page.setcookie). Provide as a JSON array of objects or @path/to/file.json. Shape: [{"name": string, "value": string, "domain"?: string, "expires"?: number, "httpOnly"?: boolean, ...more}]. ? marks optional keys.',
		})
		.option("custom-ai", {
			type: "string",
			description:
				'Optional list of custom AI models to use for the request. The models will be tried in the order provided, and in case a model returns an error, the next one will be used as fallback. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"model": string, "authorization"?: string}]. ? marks optional keys.',
		})
		.option("elements", {
			type: "string",
			description:
				'The elements field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"selector": string}].',
		})
		.option("emulate-media-type", {
			type: "string",
			description: "The emulateMediaType field",
		})
		.option("exclude-external-links", {
			type: "boolean",
			description: "The excludeExternalLinks field",
			default: false,
		})
		.option("formats", {
			type: "string",
			array: true,
			description: "The formats field",
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
		.option("interesting-only", {
			type: "boolean",
			description: "The interestingOnly field",
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
		.option("pdf-options-height", {
			type: "string",
			description:
				"Sets the height of paper. Can be a number or string with unit. Accepts a JSON scalar or plain string, or @path/to/file.",
		})
		.option("pdf-options-landscape", {
			type: "boolean",
			description: "Whether to print in landscape orientation.",
		})
		.option("pdf-options-margin-bottom", {
			type: "string",
			description:
				"The pdfOptions.margin.bottom field. Accepts a JSON scalar or plain string, or @path/to/file.",
		})
		.option("pdf-options-margin-left", {
			type: "string",
			description:
				"The pdfOptions.margin.left field. Accepts a JSON scalar or plain string, or @path/to/file.",
		})
		.option("pdf-options-margin-right", {
			type: "string",
			description:
				"The pdfOptions.margin.right field. Accepts a JSON scalar or plain string, or @path/to/file.",
		})
		.option("pdf-options-margin-top", {
			type: "string",
			description:
				"The pdfOptions.margin.top field. Accepts a JSON scalar or plain string, or @path/to/file.",
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
		.option("pdf-options-width", {
			type: "string",
			description:
				"Sets the width of paper. Can be a number or string with unit. Accepts a JSON scalar or plain string, or @path/to/file.",
		})
		.option("prompt", { type: "string", description: "The prompt field" })
		.option("reject-request-pattern", {
			type: "string",
			array: true,
			description:
				"Block undesired requests that match the provided regex patterns, eg. '/^.*\\.(css)'.",
		})
		.option("reject-resource-types", {
			type: "string",
			array: true,
			description:
				"Block undesired requests that match the provided resource types, eg. 'image' or 'script'.",
		})
		.option("response-format-json-schema", {
			type: "string",
			description:
				'Schema for the response format. More information here: https://developers.cloudflare.com/workers-ai/json-mode/. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
		})
		.option("response-format-type", {
			type: "string",
			description: "The response_format.type field",
		})
		.option("root", { type: "string", description: "The root field" })
		.option("screenshot-options-capture-beyond-viewport", {
			type: "boolean",
			description: "The screenshotOptions.captureBeyondViewport field",
		})
		.option("screenshot-options-clip-height", {
			type: "number",
			description: "The screenshotOptions.clip.height field",
		})
		.option("screenshot-options-clip-scale", {
			type: "number",
			description: "The screenshotOptions.clip.scale field",
		})
		.option("screenshot-options-clip-width", {
			type: "number",
			description: "The screenshotOptions.clip.width field",
		})
		.option("screenshot-options-clip-x", {
			type: "number",
			description: "The screenshotOptions.clip.x field",
		})
		.option("screenshot-options-clip-y", {
			type: "number",
			description: "The screenshotOptions.clip.y field",
		})
		.option("screenshot-options-from-surface", {
			type: "boolean",
			description: "The screenshotOptions.fromSurface field",
		})
		.option("screenshot-options-full-page", {
			type: "boolean",
			description: "The screenshotOptions.fullPage field",
		})
		.option("screenshot-options-omit-background", {
			type: "boolean",
			description: "The screenshotOptions.omitBackground field",
		})
		.option("screenshot-options-optimize-for-speed", {
			type: "boolean",
			description: "The screenshotOptions.optimizeForSpeed field",
		})
		.option("screenshot-options-quality", {
			type: "number",
			description: "The screenshotOptions.quality field",
		})
		.option("screenshot-options-type", {
			type: "string",
			description: "The screenshotOptions.type field",
			choices: ["png", "jpeg", "webp"],
		})
		.coerce("screenshot-options-type", (value) =>
			resolveFileToken(value, "screenshot-options-type", "text")
		)
		.option("scroll-page", {
			type: "boolean",
			description: "The scrollPage field",
		})
		.option("selector", { type: "string", description: "The selector field" })
		.option("set-extra-httpheaders", {
			type: "string",
			description:
				'The setExtraHTTPHeaders field. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
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
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36",
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
		.option("visible-links-only", {
			type: "boolean",
			description: "The visibleLinksOnly field",
			default: false,
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
		.check((argv) => {
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
		})
		.check((argv) => {
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
		})
		.check((argv) => {
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
		})
		.check((argv) => {
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
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "snapshot",
	describe: "Capture multiple page formats.",
	builder,
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
};

export default command;
