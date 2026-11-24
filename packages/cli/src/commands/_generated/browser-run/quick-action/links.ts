/**
 * links command
 * @generated from apis/overlays/browser-run.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

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
	command: "links",
	describe: "Get Links.",
	usage: "$0 browser-run quick-action links\n\nGet links from a web page.",
	...parameters,
	loader: () => import("./links.handler.js"),
});

export default command;
