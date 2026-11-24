/**
 * update command
 * @generated from apis/overlays/zaraz.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
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
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update",
	describe: "Update Zaraz configuration",
	usage: "$0 zaraz config update\n\nUpdates Zaraz configuration for a zone.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
