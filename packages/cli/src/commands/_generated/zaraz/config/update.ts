import operation from "../../_operations/zaraz/config/update.js";
/**
 * update command
 * @generated from apis/overlays/zaraz.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update",
	describe: "Update Zaraz configuration",
	usage: "$0 zaraz config update\n\nUpdates Zaraz configuration for a zone.",
	flags: {
		"analytics-default-purpose": {
			kind: "parsed",
			brief: "Consent purpose assigned to Monitoring.",
			optional: true,
			parse: String,
		},
		"analytics-enabled": {
			kind: "boolean",
			brief: "Whether Advanced Monitoring reports are enabled.",
			optional: true,
		},
		"analytics-session-exp-time": {
			kind: "parsed",
			brief: "Session expiration time (seconds).",
			optional: true,
			parse: Number,
		},
		"consent-button-text-translations-accept-all": {
			kind: "parsed",
			brief:
				'Object where keys are language codes. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
			optional: true,
			parse: String,
		},
		"consent-button-text-translations-confirm-my-choices": {
			kind: "parsed",
			brief:
				'Object where keys are language codes. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
			optional: true,
			parse: String,
		},
		"consent-button-text-translations-reject-all": {
			kind: "parsed",
			brief:
				'Object where keys are language codes. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
			optional: true,
			parse: String,
		},
		"consent-company-email": {
			kind: "parsed",
			brief: "The consent.companyEmail field",
			optional: true,
			parse: String,
		},
		"consent-company-name": {
			kind: "parsed",
			brief: "The consent.companyName field",
			optional: true,
			parse: String,
		},
		"consent-company-street-address": {
			kind: "parsed",
			brief: "The consent.companyStreetAddress field",
			optional: true,
			parse: String,
		},
		"consent-consent-modal-intro-html": {
			kind: "parsed",
			brief: "The consent.consentModalIntroHTML field",
			optional: true,
			parse: String,
		},
		"consent-consent-modal-intro-htmlwith-translations": {
			kind: "parsed",
			brief:
				'Object where keys are language codes. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
			optional: true,
			parse: String,
		},
		"consent-cookie-name": {
			kind: "parsed",
			brief: "The consent.cookieName field",
			optional: true,
			parse: String,
		},
		"consent-custom-css": {
			kind: "parsed",
			brief: "The consent.customCSS field",
			optional: true,
			parse: String,
		},
		"consent-custom-intro-disclaimer-dismissed": {
			kind: "boolean",
			brief: "The consent.customIntroDisclaimerDismissed field",
			optional: true,
		},
		"consent-default-language": {
			kind: "parsed",
			brief: "The consent.defaultLanguage field",
			optional: true,
			parse: String,
		},
		"consent-enabled": {
			kind: "boolean",
			brief: "The consent.enabled field",
			optional: true,
		},
		"consent-hide-modal": {
			kind: "boolean",
			brief: "The consent.hideModal field",
			optional: true,
		},
		"consent-purposes": {
			kind: "parsed",
			brief:
				'Object where keys are purpose alpha-numeric IDs. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": {...}}.',
			optional: true,
			parse: String,
		},
		"consent-purposes-with-translations": {
			kind: "parsed",
			brief:
				'Object where keys are purpose alpha-numeric IDs. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": {...}}.',
			optional: true,
			parse: String,
		},
		"consent-tcf-compliant": {
			kind: "boolean",
			brief: "The consent.tcfCompliant field",
			optional: true,
		},
		"data-layer": {
			kind: "boolean",
			brief: "Data layer compatibility mode enabled.",
			optional: true,
		},
		"debug-key": {
			kind: "parsed",
			brief: "The key for Zaraz debug mode.",
			optional: true,
			parse: String,
		},
		"history-change": {
			kind: "boolean",
			brief: "Single Page Application support enabled.",
			optional: true,
		},
		"settings-auto-inject-script": {
			kind: "boolean",
			brief: "Automatic injection of Zaraz scripts enabled.",
			optional: true,
		},
		"settings-bot-score-threshold": {
			kind: "parsed",
			brief: "Minimum bot score required to load Zaraz.",
			optional: true,
			parse: Number,
		},
		"settings-context-enricher-escaped-worker-name": {
			kind: "parsed",
			brief: "The settings.contextEnricher.escapedWorkerName field",
			optional: true,
			parse: String,
		},
		"settings-context-enricher-worker-tag": {
			kind: "parsed",
			brief: "The settings.contextEnricher.workerTag field",
			optional: true,
			parse: String,
		},
		"settings-cookie-domain": {
			kind: "parsed",
			brief: "The domain Zaraz will use for writing and reading its cookies.",
			optional: true,
			parse: String,
		},
		"settings-ecommerce": {
			kind: "boolean",
			brief: "Ecommerce API enabled.",
			optional: true,
		},
		"settings-events-api-path": {
			kind: "parsed",
			brief: "Custom endpoint for server-side track events.",
			optional: true,
			parse: String,
		},
		"settings-hide-external-referer": {
			kind: "boolean",
			brief: "Hiding external referrer URL enabled.",
			optional: true,
		},
		"settings-hide-ipaddress": {
			kind: "boolean",
			brief: "Trimming IP address enabled.",
			optional: true,
		},
		"settings-hide-query-params": {
			kind: "boolean",
			brief: "Removing URL query params enabled.",
			optional: true,
		},
		"settings-hide-user-agent": {
			kind: "boolean",
			brief: "Removing sensitive data from User Agent string enabled.",
			optional: true,
		},
		"settings-init-path": {
			kind: "parsed",
			brief: "Custom endpoint for Zaraz init script.",
			optional: true,
			parse: String,
		},
		"settings-inject-iframes": {
			kind: "boolean",
			brief: "Injection of Zaraz scripts into iframes enabled.",
			optional: true,
		},
		"settings-mc-root-path": {
			kind: "parsed",
			brief: "Custom path for Managed Components server functionalities.",
			optional: true,
			parse: String,
		},
		"settings-script-path": {
			kind: "parsed",
			brief: "Custom endpoint for Zaraz main script.",
			optional: true,
			parse: String,
		},
		"settings-track-path": {
			kind: "parsed",
			brief: "Custom endpoint for Zaraz tracking requests.",
			optional: true,
			parse: String,
		},
		triggers: {
			kind: "parsed",
			brief:
				'Triggers set up under Zaraz configuration, where key is the trigger alpha-numeric ID and value is the trigger configuration. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": {...}}.',
			optional: true,
			parse: String,
		},
		variables: {
			kind: "parsed",
			brief:
				'Variables set up under Zaraz configuration, where key is the variable alpha-numeric ID and value is the variable configuration. Values of variables of type secret are not included. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": {...}}.',
			optional: true,
			parse: String,
		},
		"zaraz-version": {
			kind: "parsed",
			brief: "Zaraz internal version of the config.",
			optional: true,
			parse: Number,
		},
		tools: {
			kind: "parsed",
			brief:
				'Tools set up under Zaraz configuration, where key is the alpha-numeric tool ID and value is the tool configuration object. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": {...}}.',
			optional: true,
			parse: String,
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
			const groupSet = [
				"consent-button-text-translations-accept-all",
				"consent-button-text-translations-confirm-my-choices",
				"consent-button-text-translations-reject-all",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"consent-button-text-translations-accept-all",
					"consent-button-text-translations-confirm-my-choices",
					"consent-button-text-translations-reject-all",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --consent-button-text-translations-* flag is set`
					);
				}
			}
			return true;
		});
		rules.check((argv) => {
			const groupSet = [
				"consent-button-text-translations-accept-all",
				"consent-button-text-translations-confirm-my-choices",
				"consent-button-text-translations-reject-all",
				"consent-company-email",
				"consent-company-name",
				"consent-company-street-address",
				"consent-consent-modal-intro-html",
				"consent-consent-modal-intro-htmlwith-translations",
				"consent-cookie-name",
				"consent-custom-css",
				"consent-custom-intro-disclaimer-dismissed",
				"consent-default-language",
				"consent-enabled",
				"consent-hide-modal",
				"consent-purposes",
				"consent-purposes-with-translations",
				"consent-tcf-compliant",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
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
		rules.check((argv) => {
			const groupSet = [
				"settings-context-enricher-escaped-worker-name",
				"settings-context-enricher-worker-tag",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"settings-context-enricher-escaped-worker-name",
					"settings-context-enricher-worker-tag",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --settings-context-enricher-* flag is set`
					);
				}
			}
			return true;
		});
	},
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
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
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
													argv["analytics-default-purpose"] as
														| string
														| undefined,
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
													argv["consent-default-language"] as
														| string
														| undefined,
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
													argv["settings-events-api-path"] as
														| string
														| undefined,
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
											triggers: parseJsonMap(
												argv["triggers"],
												"triggers",
												true
											),
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
											[
												"consent",
												"buttonTextTranslations",
												"confirm_my_choices",
											],
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
		),
});

export default command;
