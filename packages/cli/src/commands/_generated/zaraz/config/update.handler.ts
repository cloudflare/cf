import operation from "../../_operations/zaraz/config/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
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
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
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
				if (argv["triggers"] === undefined) {
					throw new Error(
						"--triggers is required (or pass --body with this field set)."
					);
				}
				if (argv["variables"] === undefined) {
					throw new Error(
						"--variables is required (or pass --body with this field set)."
					);
				}
				if (argv["zaraz-version"] === undefined) {
					throw new Error(
						"--zaraz-version is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				formatDryRun({
					command: "cf zaraz config update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/settings/zaraz/config`,
					pathParams: { "zone-id": String(argv.zone ?? argv["zone-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body, [
									{ path: ["triggers"], flag: "triggers" },
									{ path: ["variables"], flag: "variables" },
								])
							: compactBody(
									{
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
											buttonTextTranslations: {
												accept_all: parseJsonMap(
													argv["consent-button-text-translations-accept-all"],
													"consent-button-text-translations-accept-all"
												),
												confirm_my_choices: parseJsonMap(
													argv[
														"consent-button-text-translations-confirm-my-choices"
													],
													"consent-button-text-translations-confirm-my-choices"
												),
												reject_all: parseJsonMap(
													argv["consent-button-text-translations-reject-all"],
													"consent-button-text-translations-reject-all"
												),
											},
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
											consentModalIntroHTMLWithTranslations: parseJsonMap(
												argv[
													"consent-consent-modal-intro-htmlwith-translations"
												],
												"consent-consent-modal-intro-htmlwith-translations"
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
											purposes: parseJsonMap(
												argv["consent-purposes"],
												"consent-purposes"
											),
											purposesWithTranslations: parseJsonMap(
												argv["consent-purposes-with-translations"],
												"consent-purposes-with-translations"
											),
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
											botScoreThreshold: argv["settings-bot-score-threshold"],
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
										triggers: parseJsonMap(argv["triggers"], "triggers", true),
										variables: parseJsonMap(
											argv["variables"],
											"variables",
											true
										),
										zarazVersion: argv["zaraz-version"],
										tools: parseJsonMap(argv["tools"], "tools"),
									},
									[
										["consent", "buttonTextTranslations", "accept_all"],
										["consent", "buttonTextTranslations", "confirm_my_choices"],
										["consent", "buttonTextTranslations", "reject_all"],
										["consent", "consentModalIntroHTMLWithTranslations"],
										["consent", "purposes"],
										["consent", "purposesWithTranslations"],
										["triggers"],
										["variables"],
										["tools"],
									]
								),
				});
				return;
			}
			const parsedBody =
				argv.body !== undefined
					? parseBody(argv.body, [
							{ path: ["triggers"], flag: "triggers" },
							{ path: ["variables"], flag: "variables" },
						])
					: undefined;
			const client = await createCommandClient(argv);
			const zoneId = await getZoneId({ zone: argv.zone }, client, {
				quiet: argv.quiet,
			});
			argv.zoneId = zoneId;

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody(
				{
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
						buttonTextTranslations: {
							accept_all: parseJsonMap(
								argv["consent-button-text-translations-accept-all"],
								"consent-button-text-translations-accept-all"
							),
							confirm_my_choices: parseJsonMap(
								argv["consent-button-text-translations-confirm-my-choices"],
								"consent-button-text-translations-confirm-my-choices"
							),
							reject_all: parseJsonMap(
								argv["consent-button-text-translations-reject-all"],
								"consent-button-text-translations-reject-all"
							),
						},
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
						consentModalIntroHTMLWithTranslations: parseJsonMap(
							argv["consent-consent-modal-intro-htmlwith-translations"],
							"consent-consent-modal-intro-htmlwith-translations"
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
						purposes: parseJsonMap(
							argv["consent-purposes"],
							"consent-purposes"
						),
						purposesWithTranslations: parseJsonMap(
							argv["consent-purposes-with-translations"],
							"consent-purposes-with-translations"
						),
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
						botScoreThreshold: argv["settings-bot-score-threshold"],
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
					triggers: parseJsonMap(argv["triggers"], "triggers", true),
					variables: parseJsonMap(argv["variables"], "variables", true),
					zarazVersion: argv["zaraz-version"],
					tools: parseJsonMap(argv["tools"], "tools"),
				},
				[
					["consent", "buttonTextTranslations", "accept_all"],
					["consent", "buttonTextTranslations", "confirm_my_choices"],
					["consent", "buttonTextTranslations", "reject_all"],
					["consent", "consentModalIntroHTMLWithTranslations"],
					["consent", "purposes"],
					["consent", "purposesWithTranslations"],
					["triggers"],
					["variables"],
					["tools"],
				]
			);
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, { body: bodyData, zone_id: zoneId })
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
