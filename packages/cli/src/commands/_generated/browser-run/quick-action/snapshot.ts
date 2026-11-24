/**
 * snapshot command
 * @generated from apis/overlays/browser-run.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
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
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "snapshot",
	describe: "Capture multiple page formats.",
	usage:
		"$0 browser-run quick-action snapshot\n\nCapture at least two formats from one prepared page: HTML, screenshot, Markdown, accessibility tree, PDF, links, scrape, or JSON. Defaults to HTML and screenshot. Format-specific options use the same fields as standalone actions. Scrape requires elements. An origin 304 returns HTTP 200 with an empty result and meta.status 304, without captures or AI work, and is not cached. JSON snapshots share one actionTimeout budget across navigation, captures, retries, and AI (default 60 seconds, maximum 120 seconds). Other snapshots retain existing timeout behavior. Formats use a fixed capture order, not array order; a live page may change between captures. Any format failure fails the request.",
	...parameters,
	loader: () => import("./snapshot.handler.js"),
});

export default command;
