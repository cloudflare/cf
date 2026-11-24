/**
 * screenshot command
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
	command: "screenshot",
	describe: "Get screenshot.",
	usage:
		"$0 browser-run quick-action screenshot\n\nTakes a screenshot of a webpage from provided URL or HTML. Control page loading with `gotoOptions` and `waitFor*` options. Customize screenshots with `viewport`, `fullPage`, `clip` and others.",
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
		"screenshot-options-encoding": {
			kind: "parsed",
			brief: "The screenshotOptions.encoding field",
			optional: true,
			choices: ["binary", "base64"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "screenshot-options-encoding", "text"),
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
				command: "browser-run quick-action screenshot",
				classification: {
					safeFlags: [
						"browser",
						"best-attempt",
						"screenshot-options-capture-beyond-viewport",
						"screenshot-options-encoding",
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
						command: "cf browser-run quick-action screenshot",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/browser-rendering/screenshot`,
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
											rejectRequestPattern: argv["reject-request-pattern"],
											rejectResourceTypes: argv["reject-resource-types"],
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
												encoding: argv["screenshot-options-encoding"],
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
							`/accounts/${accountId}/browser-rendering/screenshot${qs ? "?" + qs : ""}`,
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
				if (argv["screenshot-options-capture-beyond-viewport"] !== undefined)
					setNestedValue(
						bodyData,
						["screenshotOptions", "captureBeyondViewport"],
						argv["screenshot-options-capture-beyond-viewport"]
					);
				if (argv["screenshot-options-clip-height"] !== undefined)
					setNestedValue(
						bodyData,
						["screenshotOptions", "clip", "height"],
						argv["screenshot-options-clip-height"]
					);
				if (argv["screenshot-options-clip-scale"] !== undefined)
					setNestedValue(
						bodyData,
						["screenshotOptions", "clip", "scale"],
						argv["screenshot-options-clip-scale"]
					);
				if (argv["screenshot-options-clip-width"] !== undefined)
					setNestedValue(
						bodyData,
						["screenshotOptions", "clip", "width"],
						argv["screenshot-options-clip-width"]
					);
				if (argv["screenshot-options-clip-x"] !== undefined)
					setNestedValue(
						bodyData,
						["screenshotOptions", "clip", "x"],
						argv["screenshot-options-clip-x"]
					);
				if (argv["screenshot-options-clip-y"] !== undefined)
					setNestedValue(
						bodyData,
						["screenshotOptions", "clip", "y"],
						argv["screenshot-options-clip-y"]
					);
				if (argv["screenshot-options-encoding"] !== undefined)
					setNestedValue(
						bodyData,
						["screenshotOptions", "encoding"],
						argv["screenshot-options-encoding"]
					);
				if (argv["screenshot-options-from-surface"] !== undefined)
					setNestedValue(
						bodyData,
						["screenshotOptions", "fromSurface"],
						argv["screenshot-options-from-surface"]
					);
				if (argv["screenshot-options-full-page"] !== undefined)
					setNestedValue(
						bodyData,
						["screenshotOptions", "fullPage"],
						argv["screenshot-options-full-page"]
					);
				if (argv["screenshot-options-omit-background"] !== undefined)
					setNestedValue(
						bodyData,
						["screenshotOptions", "omitBackground"],
						argv["screenshot-options-omit-background"]
					);
				if (argv["screenshot-options-optimize-for-speed"] !== undefined)
					setNestedValue(
						bodyData,
						["screenshotOptions", "optimizeForSpeed"],
						argv["screenshot-options-optimize-for-speed"]
					);
				if (argv["screenshot-options-quality"] !== undefined)
					setNestedValue(
						bodyData,
						["screenshotOptions", "quality"],
						argv["screenshot-options-quality"]
					);
				if (argv["screenshot-options-type"] !== undefined)
					setNestedValue(
						bodyData,
						["screenshotOptions", "type"],
						argv["screenshot-options-type"]
					);
				if (argv["scroll-page"] !== undefined)
					setNestedValue(bodyData, ["scrollPage"], argv["scroll-page"]);
				if (argv["selector"] !== undefined)
					setNestedValue(
						bodyData,
						["selector"],
						resolveFileToken(
							argv["selector"] as string | undefined,
							"selector",
							"text"
						)
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
						`/accounts/${accountId}/browser-rendering/screenshot${qs ? "?" + qs : ""}`,
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
