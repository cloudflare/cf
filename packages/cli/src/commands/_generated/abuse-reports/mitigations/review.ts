/**
 * review command
 * @generated from apis/overlays/abuse-reports.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		appeals: {
			kind: "parsed",
			brief:
				'List of mitigations to appeal. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"id": string, "reason": "removed" | "misclassified"}].',
			optional: true,
			parse: String,
		},
		"data-city": {
			kind: "parsed",
			brief: "The data.city field",
			optional: true,
			parse: String,
		},
		"data-company": {
			kind: "parsed",
			brief: "The data.company field",
			optional: true,
			parse: String,
		},
		"data-counter-notice-response": {
			kind: "parsed",
			brief: "The data.counter_notice_response field",
			optional: true,
			parse: String,
		},
		"data-country": {
			kind: "parsed",
			brief: "The data.country field",
			optional: true,
			parse: String,
		},
		"data-email": {
			kind: "parsed",
			brief: "The data.email field",
			optional: true,
			parse: String,
		},
		"data-full-name": {
			kind: "parsed",
			brief: "The data.full_name field",
			optional: true,
			parse: String,
		},
		"data-jurisdiction-consent": {
			kind: "boolean",
			brief: "The data.jurisdiction_consent field",
			optional: true,
		},
		"data-perjury-attestation": {
			kind: "boolean",
			brief: "The data.perjury_attestation field",
			optional: true,
		},
		"data-phone-number": {
			kind: "parsed",
			brief: "The data.phone_number field",
			optional: true,
			parse: String,
		},
		"data-signature": {
			kind: "parsed",
			brief: "The data.signature field",
			optional: true,
			parse: String,
		},
		"data-state": {
			kind: "parsed",
			brief: "The data.state field",
			optional: true,
			parse: String,
		},
		"data-street-address": {
			kind: "parsed",
			brief: "The data.street_address field",
			optional: true,
			parse: String,
		},
		"data-urls": {
			kind: "parsed",
			brief: "The data.urls field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"data-zip-code": {
			kind: "parsed",
			brief: "The data.zip_code field",
			optional: true,
			parse: String,
		},
		explanation: {
			kind: "parsed",
			brief:
				'Optional explanation for a "content_removed" appeal, such as how the content was removed. Not accepted for other appeal types.',
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "The type of appeal being submitted.",
			optional: true,
			choices: ["counter_notice", "content_removed"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				'Submit an appeal for a report. Provide either a list of mitigations to appeal, or an appeal type with its supporting details, but not both. When type is "counter_notice", the counter-notice details are required. A "content_removed" appeal takes an optional explanation instead and is accepted only while the report is in its Notice and Takedown notice period (`has_pending_notice` on the eligibility response). Reports that allow a single appeal (`max_appeals` of 1) never have a notice period and accept it whenever `appealable` is true.',
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "report-id", brief: "Abuse Report ID", parse: String },
	],
	rules(rules) {
		rules.check((argv) => {
			const groupSet = [
				"data-city",
				"data-company",
				"data-counter-notice-response",
				"data-country",
				"data-email",
				"data-full-name",
				"data-jurisdiction-consent",
				"data-perjury-attestation",
				"data-phone-number",
				"data-signature",
				"data-state",
				"data-street-address",
				"data-urls",
				"data-zip-code",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"data-city",
					"data-country",
					"data-email",
					"data-full-name",
					"data-jurisdiction-consent",
					"data-perjury-attestation",
					"data-phone-number",
					"data-signature",
					"data-state",
					"data-street-address",
					"data-urls",
					"data-zip-code",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --data-* flag is set`
					);
				}
			}
			return true;
		});
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "review <report-id>",
	describe: "Request review on mitigations",
	usage:
		"$0 abuse-reports mitigations review <report-id>\n\nRequest a review of mitigations applied because of an abuse report, or submit a report-level appeal. - To request a review of specific mitigations, send `appeals` with the mitigation IDs and reasons. Repeating a request for a mitigation with an unresolved appeal is idempotent and returns that mitigation in the in-review state. - To submit a report-level appeal, send `type` and, for a `counter_notice`, the counter-notice details in `data`. Report-level appeals are currently available only for DMCA (copyright) reports.",
	...parameters,
	loader: () => import("./review.handler.js"),
});

export default command;
