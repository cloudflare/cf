import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/zaraz.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 zaraz config update\n\nUpdates Zaraz configuration for a zone.")
		.option("analytics-default-purpose", {
			type: "string",
			description: "Consent purpose assigned to Monitoring.",
		})
		.option("analytics-enabled", {
			type: "boolean",
			description: "Whether Advanced Monitoring reports are enabled.",
		})
		.option("analytics-session-exp-time", {
			type: "number",
			description: "Session expiration time (seconds).",
		})
		.option("consent-company-email", {
			type: "string",
			description: "The consent.companyEmail field",
		})
		.option("consent-company-name", {
			type: "string",
			description: "The consent.companyName field",
		})
		.option("consent-company-street-address", {
			type: "string",
			description: "The consent.companyStreetAddress field",
		})
		.option("consent-consent-modal-intro-html", {
			type: "string",
			description: "The consent.consentModalIntroHTML field",
		})
		.option("consent-cookie-name", {
			type: "string",
			description: "The consent.cookieName field",
		})
		.option("consent-custom-css", {
			type: "string",
			description: "The consent.customCSS field",
		})
		.option("consent-custom-intro-disclaimer-dismissed", {
			type: "boolean",
			description: "The consent.customIntroDisclaimerDismissed field",
		})
		.option("consent-default-language", {
			type: "string",
			description: "The consent.defaultLanguage field",
		})
		.option("consent-enabled", {
			type: "boolean",
			description: "The consent.enabled field",
		})
		.option("consent-hide-modal", {
			type: "boolean",
			description: "The consent.hideModal field",
		})
		.option("consent-tcf-compliant", {
			type: "boolean",
			description: "The consent.tcfCompliant field",
		})
		.option("data-layer", {
			type: "boolean",
			description: "Data layer compatibility mode enabled.",
		})
		.option("debug-key", {
			type: "string",
			description: "The key for Zaraz debug mode.",
		})
		.option("history-change", {
			type: "boolean",
			description: "Single Page Application support enabled.",
		})
		.option("settings-auto-inject-script", {
			type: "boolean",
			description: "Automatic injection of Zaraz scripts enabled.",
		})
		.option("settings-context-enricher-escaped-worker-name", {
			type: "string",
			description: "The settings.contextEnricher.escapedWorkerName field",
		})
		.option("settings-context-enricher-worker-tag", {
			type: "string",
			description: "The settings.contextEnricher.workerTag field",
		})
		.option("settings-cookie-domain", {
			type: "string",
			description:
				"The domain Zaraz will use for writing and reading its cookies.",
		})
		.option("settings-ecommerce", {
			type: "boolean",
			description: "Ecommerce API enabled.",
		})
		.option("settings-events-api-path", {
			type: "string",
			description: "Custom endpoint for server-side track events.",
		})
		.option("settings-hide-external-referer", {
			type: "boolean",
			description: "Hiding external referrer URL enabled.",
		})
		.option("settings-hide-ipaddress", {
			type: "boolean",
			description: "Trimming IP address enabled.",
		})
		.option("settings-hide-query-params", {
			type: "boolean",
			description: "Removing URL query params enabled.",
		})
		.option("settings-hide-user-agent", {
			type: "boolean",
			description: "Removing sensitive data from User Agent string enabled.",
		})
		.option("settings-init-path", {
			type: "string",
			description: "Custom endpoint for Zaraz init script.",
		})
		.option("settings-inject-iframes", {
			type: "boolean",
			description: "Injection of Zaraz scripts into iframes enabled.",
		})
		.option("settings-mc-root-path", {
			type: "string",
			description: "Custom path for Managed Components server functionalities.",
		})
		.option("settings-script-path", {
			type: "string",
			description: "Custom endpoint for Zaraz main script.",
		})
		.option("settings-track-path", {
			type: "string",
			description: "Custom endpoint for Zaraz tracking requests.",
		})
		.option("zaraz-version", {
			type: "number",
			description: "Zaraz internal version of the config.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Zaraz configuration.",
		})
		.check((argv) => {
			const groupSet = [
				"consent-company-email",
				"consent-company-name",
				"consent-company-street-address",
				"consent-consent-modal-intro-html",
				"consent-cookie-name",
				"consent-custom-css",
				"consent-custom-intro-disclaimer-dismissed",
				"consent-default-language",
				"consent-enabled",
				"consent-hide-modal",
				"consent-tcf-compliant",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = ["consent-enabled"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --consent-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"put-zones-zone_identifier-zaraz-config">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update",
	describe: "Update Zaraz configuration",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zaraz config update",
				classification: {
					safeFlags: [
						"analytics-enabled",
						"consent-custom-intro-disclaimer-dismissed",
						"consent-enabled",
						"consent-hide-modal",
						"consent-tcf-compliant",
						"data-layer",
						"history-change",
						"settings-auto-inject-script",
						"settings-ecommerce",
						"settings-hide-external-referer",
						"settings-hide-ipaddress",
						"settings-hide-query-params",
						"settings-hide-user-agent",
						"settings-inject-iframes",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf zaraz config update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/settings/zaraz/config`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										analytics: {
											defaultPurpose: resolveFileToken(
												argv["analytics-default-purpose"] as string | undefined,
												"analytics-default-purpose",
												"text"
											),
											enabled: argv["analytics-enabled"],
											sessionExpTime: argv["analytics-session-exp-time"],
										},
										consent: {
											companyEmail: resolveFileToken(
												argv["consent-company-email"] as string | undefined,
												"consent-company-email",
												"text"
											),
											companyName: resolveFileToken(
												argv["consent-company-name"] as string | undefined,
												"consent-company-name",
												"text"
											),
											companyStreetAddress: resolveFileToken(
												argv["consent-company-street-address"] as
													| string
													| undefined,
												"consent-company-street-address",
												"text"
											),
											consentModalIntroHTML: resolveFileToken(
												argv["consent-consent-modal-intro-html"] as
													| string
													| undefined,
												"consent-consent-modal-intro-html",
												"text"
											),
											cookieName: resolveFileToken(
												argv["consent-cookie-name"] as string | undefined,
												"consent-cookie-name",
												"text"
											),
											customCSS: resolveFileToken(
												argv["consent-custom-css"] as string | undefined,
												"consent-custom-css",
												"text"
											),
											customIntroDisclaimerDismissed:
												argv["consent-custom-intro-disclaimer-dismissed"],
											defaultLanguage: resolveFileToken(
												argv["consent-default-language"] as string | undefined,
												"consent-default-language",
												"text"
											),
											enabled: argv["consent-enabled"],
											hideModal: argv["consent-hide-modal"],
											tcfCompliant: argv["consent-tcf-compliant"],
										},
										dataLayer: argv["data-layer"],
										debugKey: resolveFileToken(
											argv["debug-key"] as string | undefined,
											"debug-key",
											"text"
										),
										historyChange: argv["history-change"],
										settings: {
											autoInjectScript: argv["settings-auto-inject-script"],
											contextEnricher: {
												escapedWorkerName: resolveFileToken(
													argv[
														"settings-context-enricher-escaped-worker-name"
													] as string | undefined,
													"settings-context-enricher-escaped-worker-name",
													"text"
												),
												workerTag: resolveFileToken(
													argv["settings-context-enricher-worker-tag"] as
														| string
														| undefined,
													"settings-context-enricher-worker-tag",
													"text"
												),
											},
											cookieDomain: resolveFileToken(
												argv["settings-cookie-domain"] as string | undefined,
												"settings-cookie-domain",
												"text"
											),
											ecommerce: argv["settings-ecommerce"],
											eventsApiPath: resolveFileToken(
												argv["settings-events-api-path"] as string | undefined,
												"settings-events-api-path",
												"text"
											),
											hideExternalReferer:
												argv["settings-hide-external-referer"],
											hideIPAddress: argv["settings-hide-ipaddress"],
											hideQueryParams: argv["settings-hide-query-params"],
											hideUserAgent: argv["settings-hide-user-agent"],
											initPath: resolveFileToken(
												argv["settings-init-path"] as string | undefined,
												"settings-init-path",
												"text"
											),
											injectIframes: argv["settings-inject-iframes"],
											mcRootPath: resolveFileToken(
												argv["settings-mc-root-path"] as string | undefined,
												"settings-mc-root-path",
												"text"
											),
											scriptPath: resolveFileToken(
												argv["settings-script-path"] as string | undefined,
												"settings-script-path",
												"text"
											),
											trackPath: resolveFileToken(
												argv["settings-track-path"] as string | undefined,
												"settings-track-path",
												"text"
											),
										},
										zarazVersion: argv["zaraz-version"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.zaraz.config.update({
							...bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["data-layer"] === undefined) {
					throw new Error(
						"--data-layer is required (or pass --body with this field set)."
					);
				}
				if (argv["debug-key"] === undefined) {
					argv["debug-key"] = await promptForRequiredField(
						"debug-key",
						"The key for Zaraz debug mode."
					);
				}
				if (argv["settings-auto-inject-script"] === undefined) {
					throw new Error(
						"--settings-auto-inject-script is required (or pass --body with this field set)."
					);
				}
				if (
					argv["settings-context-enricher-escaped-worker-name"] === undefined
				) {
					argv["settings-context-enricher-escaped-worker-name"] =
						await promptForRequiredField(
							"settings-context-enricher-escaped-worker-name",
							"The settings.contextEnricher.escapedWorkerName field"
						);
				}
				if (argv["settings-context-enricher-worker-tag"] === undefined) {
					argv["settings-context-enricher-worker-tag"] =
						await promptForRequiredField(
							"settings-context-enricher-worker-tag",
							"The settings.contextEnricher.workerTag field"
						);
				}
				if (argv["zaraz-version"] === undefined) {
					throw new Error(
						"--zaraz-version is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					analytics: {
						defaultPurpose: resolveFileToken(
							argv["analytics-default-purpose"] as string | undefined,
							"analytics-default-purpose",
							"text"
						),
						enabled: argv["analytics-enabled"],
						sessionExpTime: argv["analytics-session-exp-time"],
					},
					consent: {
						companyEmail: resolveFileToken(
							argv["consent-company-email"] as string | undefined,
							"consent-company-email",
							"text"
						),
						companyName: resolveFileToken(
							argv["consent-company-name"] as string | undefined,
							"consent-company-name",
							"text"
						),
						companyStreetAddress: resolveFileToken(
							argv["consent-company-street-address"] as string | undefined,
							"consent-company-street-address",
							"text"
						),
						consentModalIntroHTML: resolveFileToken(
							argv["consent-consent-modal-intro-html"] as string | undefined,
							"consent-consent-modal-intro-html",
							"text"
						),
						cookieName: resolveFileToken(
							argv["consent-cookie-name"] as string | undefined,
							"consent-cookie-name",
							"text"
						),
						customCSS: resolveFileToken(
							argv["consent-custom-css"] as string | undefined,
							"consent-custom-css",
							"text"
						),
						customIntroDisclaimerDismissed:
							argv["consent-custom-intro-disclaimer-dismissed"],
						defaultLanguage: resolveFileToken(
							argv["consent-default-language"] as string | undefined,
							"consent-default-language",
							"text"
						),
						enabled: argv["consent-enabled"],
						hideModal: argv["consent-hide-modal"],
						tcfCompliant: argv["consent-tcf-compliant"],
					},
					dataLayer: argv["data-layer"],
					debugKey: resolveFileToken(
						argv["debug-key"] as string | undefined,
						"debug-key",
						"text"
					),
					historyChange: argv["history-change"],
					settings: {
						autoInjectScript: argv["settings-auto-inject-script"],
						contextEnricher: {
							escapedWorkerName: resolveFileToken(
								argv["settings-context-enricher-escaped-worker-name"] as
									| string
									| undefined,
								"settings-context-enricher-escaped-worker-name",
								"text"
							),
							workerTag: resolveFileToken(
								argv["settings-context-enricher-worker-tag"] as
									| string
									| undefined,
								"settings-context-enricher-worker-tag",
								"text"
							),
						},
						cookieDomain: resolveFileToken(
							argv["settings-cookie-domain"] as string | undefined,
							"settings-cookie-domain",
							"text"
						),
						ecommerce: argv["settings-ecommerce"],
						eventsApiPath: resolveFileToken(
							argv["settings-events-api-path"] as string | undefined,
							"settings-events-api-path",
							"text"
						),
						hideExternalReferer: argv["settings-hide-external-referer"],
						hideIPAddress: argv["settings-hide-ipaddress"],
						hideQueryParams: argv["settings-hide-query-params"],
						hideUserAgent: argv["settings-hide-user-agent"],
						initPath: resolveFileToken(
							argv["settings-init-path"] as string | undefined,
							"settings-init-path",
							"text"
						),
						injectIframes: argv["settings-inject-iframes"],
						mcRootPath: resolveFileToken(
							argv["settings-mc-root-path"] as string | undefined,
							"settings-mc-root-path",
							"text"
						),
						scriptPath: resolveFileToken(
							argv["settings-script-path"] as string | undefined,
							"settings-script-path",
							"text"
						),
						trackPath: resolveFileToken(
							argv["settings-track-path"] as string | undefined,
							"settings-track-path",
							"text"
						),
					},
					zarazVersion: argv["zaraz-version"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.zaraz.config.update({
						...bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
