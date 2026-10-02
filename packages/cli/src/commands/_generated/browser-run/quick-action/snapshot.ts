import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
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
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 browser-run quick-action snapshot\n\nReturns the page's HTML content and screenshot. Control page loading with `gotoOptions` and `waitFor*` options. Customize screenshots with `viewport`, `fullPage`, `clip` and others."
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
		.option("reject-request-pattern", {
			type: "string",
			array: true,
			description:
				"Block undesired requests that match the provided regex patterns, eg. '/^.*\\.(css)'.",
		})
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
				"screenshot-options-capture-beyond-viewport",
				"screenshot-options-clip-height",
				"screenshot-options-clip-scale",
				"screenshot-options-clip-width",
				"screenshot-options-clip-x",
				"screenshot-options-clip-y",
				"screenshot-options-from-surface",
				"screenshot-options-full-page",
				"screenshot-options-omit-background",
				"screenshot-options-optimize-for-speed",
				"screenshot-options-quality",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = [
					"screenshot-options-clip-height",
					"screenshot-options-clip-width",
					"screenshot-options-clip-x",
					"screenshot-options-clip-y",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --screenshotOptions-* flag is set`
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

type Request = SdkRequest<"brapi-post_Snapshot">;
type Body = Request["body"];
type Query = SdkQuery<"brapi-post_Snapshot">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "snapshot",
	describe: "Get HTML content and screenshot.",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "browser-run quick-action snapshot",
				classification: {
					safeFlags: [
						"best-attempt",
						"screenshot-options-capture-beyond-viewport",
						"screenshot-options-from-surface",
						"screenshot-options-full-page",
						"screenshot-options-omit-background",
						"screenshot-options-optimize-for-speed",
						"set-java-script-enabled",
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
				const queryParams: Query = {
					cacheTTL: argv["cache-ttl"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun(
						{
							command: "cf browser-run quick-action snapshot",
							method: "POST",
							url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/browser-rendering/snapshot`,
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
											rejectRequestPattern: argv["reject-request-pattern"],
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
											},
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
						},
						{ sensitiveBodyPaths: [["authenticate", "password"]] }
					);
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const qs = new URLSearchParams(
						Object.entries(queryParams)
							.filter(([, v]) => v !== undefined)
							.map(([k, v]) => [k, String(v)])
					).toString();
					const result = await withProgress(`Creating`, async () =>
						client.browserRun.quickAction.snapshot({
							body: bodyData,
							account_id: accountId,
							...queryParams,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					actionTimeout: argv["action-timeout"],
					addScriptTag: parseObjectArray(
						argv["add-script-tag"],
						"add-script-tag"
					),
					addStyleTag: parseObjectArray(argv["add-style-tag"], "add-style-tag"),
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
					rejectRequestPattern: argv["reject-request-pattern"],
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
					},
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
							argv["wait-for-selector-selector"] as string | undefined,
							"wait-for-selector-selector",
							"text"
						),
						timeout: argv["wait-for-selector-timeout"],
						visible: argv["wait-for-selector-visible"],
					},
					waitForTimeout: argv["wait-for-timeout"],
				});
				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const result = await withProgress(`Creating`, async () =>
					client.browserRun.quickAction.snapshot({
						body: bodyData,
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
