import operation from "../../_operations/browser-run/crawl/create.js";
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
import {
	compactBody,
	parseBody,
	parseJsonMap,
	parseObjectArray,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 browser-run crawl create\n\nStarts a crawl job for the provided URL and its children. Check available options like `gotoOptions` and `waitFor*` to control page load behaviour."
		)
		.option("cache-ttl", {
			type: "number",
			description: "Cache TTL default is 5s. Set to 0 to disable.",
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
		.option("browser", {
			type: "string",
			description:
				"Rendering backend for this crawl. Set to `kitesurf` to render pages with Kitesurf (beta). Only valid when `render` is `true`.",
			choices: ["kitesurf"],
		})
		.coerce("browser", (value) => resolveFileToken(value, "browser", "text"))
		.option("content-use", {
			type: "string",
			description:
				"Intended content use level to respect the `use` Content-Signal directive in robots.txt. Levels (least to most permissive): 'reference', 'full'. A URL is disallowed when the publisher's declared `use` level is lower than this intent. Learn more: https://contentsignals.org/. Default: 'full'.",
			choices: ["reference", "full"],
			default: "full",
		})
		.coerce("content-use", (value) =>
			resolveFileToken(value, "content-use", "text")
		)
		.option("cookies", {
			type: "string",
			description:
				'Check [options](https://pptr.dev/api/puppeteer.page.setcookie). Provide as a JSON array of objects or @path/to/file.json. Shape: [{"name": string, "value": string, "domain"?: string, "expires"?: number, "httpOnly"?: boolean, ...more}]. ? marks optional keys.',
		})
		.option("crawl-purposes", {
			type: "string",
			array: true,
			description:
				"List of crawl purposes to respect Content-Signal directives in robots.txt. Allowed values: 'search', 'ai-input', 'ai-train'. Learn more: https://contentsignals.org/. Default: ['search', 'ai-input', 'ai-train'].",
		})
		.option("depth", {
			type: "number",
			description:
				"Maximum number of levels deep the crawler will traverse from the starting URL.",
			default: 100000,
		})
		.option("emulate-media-type", {
			type: "string",
			description: "The emulateMediaType field",
		})
		.option("formats", {
			type: "string",
			array: true,
			description: "Formats to return. Default is `html`.",
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
		.option("json-options-custom-ai", {
			type: "string",
			description:
				'Optional list of custom AI models to use for the request. The models will be tried in the order provided, and in case a model returns an error, the next one will be used as fallback. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"model": string, "authorization"?: string}]. ? marks optional keys.',
		})
		.option("json-options-prompt", {
			type: "string",
			description: "The jsonOptions.prompt field",
		})
		.option("json-options-response-format-type", {
			type: "string",
			description: "The jsonOptions.response_format.type field",
		})
		.option("limit", {
			type: "number",
			description: "Maximum number of URLs to crawl.",
			default: 10,
		})
		.option("max-age", {
			type: "number",
			description:
				"Maximum age of a resource that can be returned from cache in seconds. Default is 1 day.",
			default: 86400,
		})
		.option("modified-since", {
			type: "number",
			description:
				"Unix timestamp (seconds since epoch) indicating to only crawl pages that were modified since this time. For sitemap URLs with a lastmod field, this is compared directly. For other URLs, the crawler will use If-Modified-Since header when fetching. URLs without modification information (no lastmod in sitemap and no Last-Modified header support) will be crawled. Note: This works in conjunction with maxAge - both filters must pass for a cached resource to be used. Must be within the last year and not in the future.",
		})
		.option("options-exclude-patterns", {
			type: "string",
			array: true,
			description:
				"Exclude links matching the provided wildcard patterns in the crawl job. Example: 'https://example.com/privacy/**'.",
		})
		.option("options-include-external-links", {
			type: "boolean",
			description:
				"Include external links in the crawl job. If set to true, includeSubdomains is ignored.",
		})
		.option("options-include-patterns", {
			type: "string",
			array: true,
			description:
				"Include only links matching the provided wildcard patterns in the crawl job. Include patterns are evaluated before exclude patterns. URLs that match any of the specified include patterns will be included in the crawl job. Example: 'https://example.com/blog/**'.",
		})
		.option("options-include-subdomains", {
			type: "boolean",
			description:
				"Include links to subdomains in the crawl job. This option is ignored if includeExternalLinks is true.",
		})
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
		.option("render", {
			type: "boolean",
			description:
				"Whether to render the page or fetch static content. True by default.",
			default: true,
		})
		.option("set-extra-httpheaders", {
			type: "string",
			description:
				'The setExtraHTTPHeaders field. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
		})
		.option("set-java-script-enabled", {
			type: "boolean",
			description: "The setJavaScriptEnabled field",
		})
		.option("source", {
			type: "string",
			description:
				"Source of links to crawl. 'sitemaps' - only crawl URLs from sitemaps, 'links' - only crawl URLs scraped from pages, 'all' - crawl both sitemap and scraped links (default).",
			choices: ["sitemaps", "links", "all"],
			default: "all",
		})
		.coerce("source", (value) => resolveFileToken(value, "source", "text"))
		.option("url", {
			type: "string",
			description: "URL to navigate to, eg. `https://example.com`.",
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
		.implies("authenticate-password", ["authenticate-username"])
		.implies("authenticate-username", ["authenticate-password"])
		.implies("viewport-device-scale-factor", [
			"viewport-height",
			"viewport-width",
		])
		.implies("viewport-has-touch", ["viewport-height", "viewport-width"])
		.implies("viewport-height", ["viewport-width"])
		.implies("viewport-is-landscape", ["viewport-height", "viewport-width"])
		.implies("viewport-is-mobile", ["viewport-height", "viewport-width"])
		.implies("viewport-width", ["viewport-height"])
		.implies("wait-for-selector-hidden", ["wait-for-selector-selector"])
		.implies("wait-for-selector-timeout", ["wait-for-selector-selector"])
		.implies("wait-for-selector-visible", ["wait-for-selector-selector"]);
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Crawl websites.",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "browser-run crawl create",
				classification: {
					safeFlags: [
						"best-attempt",
						"browser",
						"content-use",
						"options-include-external-links",
						"options-include-subdomains",
						"render",
						"set-java-script-enabled",
						"source",
						"viewport-has-touch",
						"viewport-is-landscape",
						"viewport-is-mobile",
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
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf browser-run crawl create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/browser-rendering/crawl`,
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
											browser: argv["browser"],
											contentUse: argv["content-use"],
											cookies: parseObjectArray(argv["cookies"], "cookies"),
											crawlPurposes: argv["crawl-purposes"],
											depth: argv["depth"],
											emulateMediaType: resolveFileToken(
												argv["emulate-media-type"] as string | undefined,
												"emulate-media-type",
												"text"
											),
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
											jsonOptions: {
												custom_ai: parseObjectArray(
													argv["json-options-custom-ai"],
													"json-options-custom-ai"
												),
												prompt: resolveFileToken(
													argv["json-options-prompt"] as string | undefined,
													"json-options-prompt",
													"text"
												),
												response_format: {
													type: resolveFileToken(
														argv["json-options-response-format-type"] as
															| string
															| undefined,
														"json-options-response-format-type",
														"text"
													),
												},
											},
											limit: argv["limit"],
											maxAge: argv["max-age"],
											modifiedSince: argv["modified-since"],
											options: {
												excludePatterns: argv["options-exclude-patterns"],
												includeExternalLinks:
													argv["options-include-external-links"],
												includePatterns: argv["options-include-patterns"],
												includeSubdomains: argv["options-include-subdomains"],
											},
											rejectRequestPattern: argv["reject-request-pattern"],
											rejectResourceTypes: argv["reject-resource-types"],
											render: argv["render"],
											setExtraHTTPHeaders: parseJsonMap(
												argv["set-extra-httpheaders"],
												"set-extra-httpheaders"
											),
											setJavaScriptEnabled: argv["set-java-script-enabled"],
											source: argv["source"],
											url: resolveFileToken(
												argv["url"] as string | undefined,
												"url",
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
				if (argv["url"] === undefined) {
					argv["url"] = await promptForRequiredField(
						"url",
						"URL to navigate to, eg. \`https://example.com\`."
					);
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
						browser: argv["browser"],
						contentUse: argv["content-use"],
						cookies: parseObjectArray(argv["cookies"], "cookies"),
						crawlPurposes: argv["crawl-purposes"],
						depth: argv["depth"],
						emulateMediaType: resolveFileToken(
							argv["emulate-media-type"] as string | undefined,
							"emulate-media-type",
							"text"
						),
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
						jsonOptions: {
							custom_ai: parseObjectArray(
								argv["json-options-custom-ai"],
								"json-options-custom-ai"
							),
							prompt: resolveFileToken(
								argv["json-options-prompt"] as string | undefined,
								"json-options-prompt",
								"text"
							),
							response_format: {
								type: resolveFileToken(
									argv["json-options-response-format-type"] as
										| string
										| undefined,
									"json-options-response-format-type",
									"text"
								),
							},
						},
						limit: argv["limit"],
						maxAge: argv["max-age"],
						modifiedSince: argv["modified-since"],
						options: {
							excludePatterns: argv["options-exclude-patterns"],
							includeExternalLinks: argv["options-include-external-links"],
							includePatterns: argv["options-include-patterns"],
							includeSubdomains: argv["options-include-subdomains"],
						},
						rejectRequestPattern: argv["reject-request-pattern"],
						rejectResourceTypes: argv["reject-resource-types"],
						render: argv["render"],
						setExtraHTTPHeaders: parseJsonMap(
							argv["set-extra-httpheaders"],
							"set-extra-httpheaders"
						),
						setJavaScriptEnabled: argv["set-java-script-enabled"],
						source: argv["source"],
						url: resolveFileToken(
							argv["url"] as string | undefined,
							"url",
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
								argv["wait-for-selector-selector"] as string | undefined,
								"wait-for-selector-selector",
								"text"
							),
							timeout: argv["wait-for-selector-timeout"],
							visible: argv["wait-for-selector-visible"],
						},
						waitForTimeout: argv["wait-for-timeout"],
					},
					[["setExtraHTTPHeaders"]]
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
