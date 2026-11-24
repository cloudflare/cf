import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./pdf.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
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
				setNestedValue(bodyData, ["viewport", "width"], argv["viewport-width"]);
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
				setNestedValue(bodyData, ["waitForTimeout"], argv["wait-for-timeout"]);
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
	);
}
