/**
 * create command
 * @generated from apis/overlays/registrar-sandbox.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		prefer: {
			kind: "parsed",
			brief:
				"Set to `respond-async` to receive an immediate `202 Accepted` without\nwaiting for the operation to complete (RFC 7240).\n\nThe header may be combined with other preferences using standard\ncomma-separated syntax.",
			optional: true,
			parse: String,
		},
		acknowledgements: {
			kind: "parsed",
			brief:
				'Provides user acknowledgements for a specific extension or premium\nregistration flow. The extension registration schema from the\nextension discovery endpoint identifies the required keys. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		"auto-renew": {
			kind: "boolean",
			brief:
				"Enable or disable automatic renewal. Defaults to `false` if omitted.\nSetting this field to `true` is an explicit opt-in authorizing\nCloudflare to charge the account's default payment method up to 30\ndays before domain expiry to renew the domain automatically.\nRenewal pricing may change over time based on registry pricing.\n",
			default: false,
		},
		"contact-extensions": {
			kind: "parsed",
			brief:
				'Provides registry-specific contact extension values for the registrant.\n`GET /accounts/{account_id}/registrar/extensions/{extension}` identifies\nthe required keys and allowed values for each extension in the\n`registration_schema.properties.contact_extensions` object.\n\nExamples include `.us` nexus fields, `.uk` registrant type fields,\nand `.ca` legal type fields. Omit this object when the extension\'s\nregistration schema excludes `contact_extensions`. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		"contacts-administrator-email": {
			kind: "parsed",
			brief:
				"Email address for the registrant. Used for domain-related\ncommunications from the registry, including ownership verification\nand renewal notices.\n",
			optional: true,
			parse: String,
		},
		"contacts-administrator-fax": {
			kind: "parsed",
			brief:
				"Fax number in E.164 format (e.g., `+1.5555555555`). Optional.\nMost registrations do not require a fax number.\n",
			optional: true,
			parse: String,
		},
		"contacts-administrator-phone": {
			kind: "parsed",
			brief:
				"Phone number in E.164 format: `+{country_code}.{number}` without spaces or dashes. Examples: `+1.5555555555` (US), `+44.2071234567` (UK), `+81.312345678` (Japan).",
			optional: true,
			parse: String,
		},
		"contacts-administrator-postal-info-name": {
			kind: "parsed",
			brief:
				"Full legal name of the contact, including all required name components for an individual or authorized representative. Some registries require a complete personal name that includes a family or last name where applicable. Provide the complete name in this single field, for example `Ada Lovelace`; do not send separate first-name or last-name fields.",
			optional: true,
			parse: String,
		},
		"contacts-administrator-postal-info-organization": {
			kind: "parsed",
			brief:
				"Organization or company name. Optional for individual registrants.",
			optional: true,
			parse: String,
		},
		"contacts-billing-email": {
			kind: "parsed",
			brief:
				"Email address for the registrant. Used for domain-related\ncommunications from the registry, including ownership verification\nand renewal notices.\n",
			optional: true,
			parse: String,
		},
		"contacts-billing-fax": {
			kind: "parsed",
			brief:
				"Fax number in E.164 format (e.g., `+1.5555555555`). Optional.\nMost registrations do not require a fax number.\n",
			optional: true,
			parse: String,
		},
		"contacts-billing-phone": {
			kind: "parsed",
			brief:
				"Phone number in E.164 format: `+{country_code}.{number}` without spaces or dashes. Examples: `+1.5555555555` (US), `+44.2071234567` (UK), `+81.312345678` (Japan).",
			optional: true,
			parse: String,
		},
		"contacts-billing-postal-info-name": {
			kind: "parsed",
			brief:
				"Full legal name of the contact, including all required name components for an individual or authorized representative. Some registries require a complete personal name that includes a family or last name where applicable. Provide the complete name in this single field, for example `Ada Lovelace`; do not send separate first-name or last-name fields.",
			optional: true,
			parse: String,
		},
		"contacts-billing-postal-info-organization": {
			kind: "parsed",
			brief:
				"Organization or company name. Optional for individual registrants.",
			optional: true,
			parse: String,
		},
		"contacts-registrant-email": {
			kind: "parsed",
			brief:
				"Email address for the registrant. Used for domain-related\ncommunications from the registry, including ownership verification\nand renewal notices.\n",
			optional: true,
			parse: String,
		},
		"contacts-registrant-fax": {
			kind: "parsed",
			brief:
				"Fax number in E.164 format (e.g., `+1.5555555555`). Optional.\nMost registrations do not require a fax number.\n",
			optional: true,
			parse: String,
		},
		"contacts-registrant-phone": {
			kind: "parsed",
			brief:
				"Phone number in E.164 format: `+{country_code}.{number}` without spaces or dashes. Examples: `+1.5555555555` (US), `+44.2071234567` (UK), `+81.312345678` (Japan).",
			optional: true,
			parse: String,
		},
		"contacts-registrant-postal-info-name": {
			kind: "parsed",
			brief:
				"Full legal name of the contact, including all required name components for an individual or authorized representative. Some registries require a complete personal name that includes a family or last name where applicable. Provide the complete name in this single field, for example `Ada Lovelace`; do not send separate first-name or last-name fields.",
			optional: true,
			parse: String,
		},
		"contacts-registrant-postal-info-organization": {
			kind: "parsed",
			brief:
				"Organization or company name. Optional for individual registrants.",
			optional: true,
			parse: String,
		},
		"contacts-technical-email": {
			kind: "parsed",
			brief:
				"Email address for the registrant. Used for domain-related\ncommunications from the registry, including ownership verification\nand renewal notices.\n",
			optional: true,
			parse: String,
		},
		"contacts-technical-fax": {
			kind: "parsed",
			brief:
				"Fax number in E.164 format (e.g., `+1.5555555555`). Optional.\nMost registrations do not require a fax number.\n",
			optional: true,
			parse: String,
		},
		"contacts-technical-phone": {
			kind: "parsed",
			brief:
				"Phone number in E.164 format: `+{country_code}.{number}` without spaces or dashes. Examples: `+1.5555555555` (US), `+44.2071234567` (UK), `+81.312345678` (Japan).",
			optional: true,
			parse: String,
		},
		"contacts-technical-postal-info-name": {
			kind: "parsed",
			brief:
				"Full legal name of the contact, including all required name components for an individual or authorized representative. Some registries require a complete personal name that includes a family or last name where applicable. Provide the complete name in this single field, for example `Ada Lovelace`; do not send separate first-name or last-name fields.",
			optional: true,
			parse: String,
		},
		"contacts-technical-postal-info-organization": {
			kind: "parsed",
			brief:
				"Organization or company name. Optional for individual registrants.",
			optional: true,
			parse: String,
		},
		"domain-name": {
			kind: "parsed",
			brief:
				"Provides a fully qualified domain name (FQDN), including the extension\n(e.g., `example.com`, `mybrand.app`). The domain name uniquely identifies\na registration. Cloudflare permits only one registration per domain, making\nthe domain name a natural idempotency key for registration requests.\n",
			optional: true,
			parse: String,
		},
		"privacy-mode": {
			kind: "parsed",
			brief:
				"Sets the WHOIS privacy mode for the registration. Defaults to `redaction`.\n- `off`: Disables WHOIS privacy.\n- `redaction`: Requests WHOIS redaction where the extension supports it.\n  Some extensions exclude privacy and redaction.\n",
			default: "redaction",
			choices: ["off", "redaction"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "privacy-mode", "text"),
		},
		years: {
			kind: "parsed",
			brief:
				"Sets the registration term from 1 to 10 years. When omitted, this\nfield defaults to the registry's minimum registration period for the\nextension. Most extensions require 1 year, while some require longer\nminimum terms (e.g., `.ai` requires 2 years).\n\nEach registry may also enforce its own maximum registration term. A\nrequest above that maximum fails. When uncertain, omit this field to\nuse the default.\n",
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
			const groupSet = [
				"contacts-administrator-email",
				"contacts-administrator-fax",
				"contacts-administrator-phone",
				"contacts-administrator-postal-info-name",
				"contacts-administrator-postal-info-organization",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"contacts-administrator-email",
					"contacts-administrator-phone",
					"contacts-administrator-postal-info-name",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --contacts-administrator-* flag is set`
					);
				}
			}
			return true;
		});
		rules.check((argv) => {
			const groupSet = [
				"contacts-billing-email",
				"contacts-billing-fax",
				"contacts-billing-phone",
				"contacts-billing-postal-info-name",
				"contacts-billing-postal-info-organization",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"contacts-billing-email",
					"contacts-billing-phone",
					"contacts-billing-postal-info-name",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --contacts-billing-* flag is set`
					);
				}
			}
			return true;
		});
		rules.check((argv) => {
			const groupSet = [
				"contacts-registrant-email",
				"contacts-registrant-fax",
				"contacts-registrant-phone",
				"contacts-registrant-postal-info-name",
				"contacts-registrant-postal-info-organization",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"contacts-registrant-email",
					"contacts-registrant-phone",
					"contacts-registrant-postal-info-name",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --contacts-registrant-* flag is set`
					);
				}
			}
			return true;
		});
		rules.check((argv) => {
			const groupSet = [
				"contacts-technical-email",
				"contacts-technical-fax",
				"contacts-technical-phone",
				"contacts-technical-postal-info-name",
				"contacts-technical-postal-info-organization",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"contacts-technical-email",
					"contacts-technical-phone",
					"contacts-technical-postal-info-name",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --contacts-technical-* flag is set`
					);
				}
			}
			return true;
		});
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create Registration",
	usage:
		"$0 registrar-sandbox registrations create\n\nStarts a domain registration workflow. ### Prerequisites - The account must not already be at the maximum supported domain limit. A single account may own up to 500 domains in total across registrations created through either the dashboard or this API. - The domain must be on a supported extension for programmatic registration. - Use `POST /domain-check` immediately before calling this endpoint to confirm real-time availability and pricing. ### Defaults - `years`: defaults to the extension's minimum registration period (1 year for most extensions, but varies — for example, `.ai` (if supported) requires a minimum of 2 years). - `auto_renew`: defaults to `false`. Setting it to `true` is an explicit opt-in authorizing Cloudflare to charge the account's default payment method up to 30 days before domain expiry to renew the registration. Renewal pricing may change over time based on registry pricing. - `privacy_mode`: defaults to `redaction`. ### Premium domains Premium domain registration is not currently supported by this API. If `POST /domain-check` returns `tier: premium`, do not call this endpoint for that domain. ### Response behavior By default, the server holds the connection for a bounded, server-defined amount of time while the registration completes. Most registrations finish within this window and return `201 Created` with a completed workflow status. If the registration is still processing after this synchronous wait window, the server returns `202 Accepted`. Poll the URL in `links.self` to track progress. To skip the wait and receive an immediate `202`, send `Prefer: respond-async`.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
