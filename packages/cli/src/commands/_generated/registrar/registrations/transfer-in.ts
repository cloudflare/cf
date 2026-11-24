/**
 * transfer-in command
 * @generated from apis/overlays/registrar.ts
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
				"Set to `respond-async` to indicate a preference for asynchronous\nprocessing (RFC 7240).",
			optional: true,
			parse: String,
		},
		"auth-code": {
			kind: "parsed",
			brief:
				"The EPP/authorization code from your current registrar, base64-encoded\nper RFC 4648 §4. Obtain this from your current registrar's control panel.\nRequired for all extensions, except for UK.\n",
			optional: true,
			parse: String,
		},
		"auto-renew": {
			kind: "boolean",
			brief:
				"Enable or disable automatic renewal after transfer. Defaults to `false` if omitted.\n",
			default: false,
		},
		"contact-extensions": {
			kind: "parsed",
			brief:
				'Registry-specific contact extension values for the registrant.\n`GET /accounts/{account_id}/registrar/extensions/{extension}` documents the\nrequired keys and allowed values for each extension in the\n`transfer_schema.properties.contact_extensions` object.\n\nExamples include `.us` nexus fields, `.uk` registrant type fields,\nand `.ca` legal type fields. Include this object only when the extension\'s\ntransfer schema defines `contact_extensions`. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
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
		"privacy-mode": {
			kind: "parsed",
			brief:
				"WHOIS privacy mode to apply after transfer completes. Defaults to\nthe extension's default privacy mode (typically `redaction`).\n",
			optional: true,
			choices: ["off", "redaction"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "privacy-mode", "text"),
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
	operands: [
		{
			placeholder: "domain-name",
			brief: "Domain name to transfer.",
			parse: String,
		},
	],
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
	command: "transfer-in <domain-name>",
	describe: "Initiate Transfer",
	usage:
		"$0 registrar registrations transfer-in <domain-name>\n\nStarts a domain transfer-in workflow. This is typically a billable operation — successful transfers charge the account's default payment method, except for extensions with zero transfer pricing (e.g. UK extensions). All successful domain transfers are non-refundable. ### How transfers work Domain transfers move a domain from another registrar to Cloudflare. Transfers typically take 1-10 days due to ICANN-mandated approval windows. ### Prerequisites - The domain must already have a zone in the Cloudflare account (added through the dashboard or zone API). - The zone must have DNSSec disabled. - For billable transfers (i.e. extensions with non-zero transfer pricing), the account must have a billing profile with a valid default payment method. Set this up at `https://dash.cloudflare.com/{account_id}/billing/payment-info`. - The domain must be unlocked at the current registrar. - An authorization/EPP code from the current registrar is required, except for UK extensions — see Auth code below. ### Auth code An authorization code (also called EPP code, transfer key, or auth-info code) is required for most extensions, with the exception of UK extensions. Obtain this from your current registrar's control panel. The auth code in the request body must be base64-encoded per RFC 4648 §4 (standard alphabet, no line breaks). ### Response behavior Successful transfer initiation returns `202 Accepted`. Validation or initiation failures return the documented `4XX` responses. Poll `GET /accounts/{account_id}/registrar/registrations/{domain_name}/transfer-in-status` to track progress. ### Premium domains Premium domain transfers are not currently supported by this API. Please use the [dashboard](https://dash.cloudflare.com/) for now. ### Billing The account's default payment method is charged upon successful transfer completion, unless the extension has zero transfer pricing (e.g. UK extensions). The transfer adds time to the domain's existing expiration date (typically 1 year).",
	...parameters,
	loader: () => import("./transfer-in.handler.js"),
});

export default command;
