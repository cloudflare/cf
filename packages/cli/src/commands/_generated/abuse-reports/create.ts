import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/abuse-reports.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 abuse-reports create <report-type>\n\nSubmit an abuse report of a particular type. Requires the abuse-reports entitlement on the account (Enterprise accounts have it by default; other accounts must request access) and an API token with the `Trust and Safety Write` permission. If the account is not entitled, the request is rejected with an HTTP `401` response (see below)."
		)
		.positional("report-type", {
			type: "string",
			description: "The report type to be submitted. Example: abuse_general",
			demandOption: true,
		})
		.option("act", {
			type: "string",
			description: "The act field",
			choices: [
				"abuse_dmca",
				"abuse_trademark",
				"abuse_general",
				"abuse_phishing",
				"abuse_children",
				"abuse_threat",
				"abuse_registrar_whois",
				"abuse_ncsei",
			],
		})
		.coerce("act", (value) => resolveFileToken(value, "act", "text"))
		.option("comments", {
			type: "string",
			description:
				"Any additional comments about the infringement not exceeding 2000 characters",
		})
		.option("company", {
			type: "string",
			description:
				"Text not exceeding 100 characters. This field may be released by Cloudflare to third parties such as the Lumen Database (https://lumendatabase.org/).",
		})
		.option("email", {
			type: "string",
			description:
				"A valid email of the abuse reporter. This field may be released by Cloudflare to third parties such as the Lumen Database (https://lumendatabase.org/).",
		})
		.option("email2", {
			type: "string",
			description: "Should match the value provided in `email`",
		})
		.option("name", {
			type: "string",
			description:
				"Text not exceeding 255 characters. This field may be released by Cloudflare to third parties such as the Lumen Database (https://lumendatabase.org/).",
		})
		.option("reported-country", {
			type: "string",
			description: "Text containing 2 characters",
		})
		.option("reported-user-agent", {
			type: "string",
			description: "Text not exceeding 255 characters",
		})
		.option("tele", {
			type: "string",
			description:
				"Text not exceeding 20 characters. This field may be released by Cloudflare to third parties such as the Lumen Database (https://lumendatabase.org/).",
		})
		.option("title", {
			type: "string",
			description: "Text not exceeding 255 characters",
		})
		.option("urls", {
			type: "string",
			description:
				"A list of valid URLs separated by ‘\\n’ (new line character). The list of the URLs should not exceed 250 URLs. All URLs should have the same hostname. Each URL should be unique. This field may be released by Cloudflare to third parties such as the Lumen Database (https://lumendatabase.org/).",
		})
		.option("address1", {
			type: "string",
			description:
				"Text not exceeding 100 characters. This field may be released by Cloudflare to third parties such as the Lumen Database (https://lumendatabase.org/).",
		})
		.option("agent-name", {
			type: "string",
			description:
				"The name of the copyright holder. Text not exceeding 60 characters. This field may be released by Cloudflare to third parties such as the Lumen Database (https://lumendatabase.org/).",
		})
		.option("agree", {
			type: "number",
			description:
				"Can be `0` for false or `1` for true. Must be value: 1 for DMCA reports",
		})
		.option("city", {
			type: "string",
			description:
				"Text not exceeding 255 characters. This field may be released by Cloudflare to third parties such as the Lumen Database (https://lumendatabase.org/).",
		})
		.option("country", {
			type: "string",
			description:
				"Text not exceeding 255 characters. This field may be released by Cloudflare to third parties such as the Lumen Database (https://lumendatabase.org/).\n",
		})
		.option("host-notification", {
			type: "string",
			description:
				"Notification type based on the abuse type. NOTE: Copyright (DMCA) and Trademark reports cannot be anonymous.\n",
			choices: ["send", "send-anon"],
		})
		.coerce("host-notification", (value) =>
			resolveFileToken(value, "host-notification", "text")
		)
		.option("original-work", {
			type: "string",
			description:
				"Text not exceeding 255 characters. This field may be released by Cloudflare to third parties such as the Lumen Database (https://lumendatabase.org/).\n",
		})
		.option("owner-notification", {
			type: "string",
			description:
				"Notification type based on the abuse type. NOTE: Copyright (DMCA) and Trademark reports cannot be anonymous.\n",
			choices: ["send", "send-anon", "none"],
		})
		.coerce("owner-notification", (value) =>
			resolveFileToken(value, "owner-notification", "text")
		)
		.option("signature", {
			type: "string",
			description:
				"Required for DMCA reports, should be same as Name. An affirmation that all information in the report is true and accurate while agreeing to the policies of Cloudflare's abuse reports",
		})
		.option("state", {
			type: "string",
			description:
				"Text not exceeding 255 characters. This field may be released by Cloudflare to third parties such as the Lumen Database (https://lumendatabase.org/).",
		})
		.option("justification", {
			type: "string",
			description:
				"A detailed description of the infringement, including any necessary access details and the exact steps needed to view the content, not exceeding 5000 characters.\n",
		})
		.option("trademark-number", {
			type: "string",
			description: "Text not exceeding 1000 characters",
		})
		.option("trademark-office", {
			type: "string",
			description: "Text not exceeding 1000 characters",
		})
		.option("trademark-symbol", {
			type: "string",
			description: "Text not exceeding 1000 characters",
		})
		.option("destination-ips", {
			type: "string",
			description:
				"A list of IP addresses separated by ‘\\n’ (new line character). The list of destination IPs should not exceed 30 IP addresses. Each one of the IP addresses ought to be unique.",
		})
		.option("ports-protocols", {
			type: "string",
			description:
				"A comma separated list of ports and protocols e.g. 80/TCP, 22/UDP. The total size of the field should not exceed 2000 characters. Each individual port/protocol should not exceed 100 characters. The list should not have more than 30 unique ports and protocols.",
		})
		.option("source-ips", {
			type: "string",
			description:
				"A list of IP addresses separated by ‘\\n’ (new line character). The list of source IPs should not exceed 30 IP addresses. Each one of the IP addresses ought to be unique.",
		})
		.option("ncmec-notification", {
			type: "string",
			description:
				"Notification type based on the abuse type. NOTE: Copyright (DMCA) and Trademark reports cannot be anonymous.\n",
			choices: ["send", "send-anon"],
		})
		.coerce("ncmec-notification", (value) =>
			resolveFileToken(value, "ncmec-notification", "text")
		)
		.option("reg-who-request-reg-who-authorization-statement", {
			type: "string",
			description:
				"Optional authorization statement or power of attorney per RDP 10.2.1.3.",
		})
		.option("reg-who-request-reg-who-good-faith-affirmation", {
			type: "boolean",
			description:
				"Affirmation that the request is made in good faith per RDP 10.2.4. Must be true.",
		})
		.option("reg-who-request-reg-who-lawful-processing-agreement", {
			type: "boolean",
			description:
				"Agreement to process data lawfully per RDP 10.2.5. Must be true.",
		})
		.option("reg-who-request-reg-who-legal-basis", {
			type: "string",
			description:
				"Legal rights and rationale for the request per RDP 10.2.3. Required for all WHOIS requests.",
		})
		.option("reg-who-request-reg-who-request-type", {
			type: "string",
			description: "The type of WHOIS data request per RDP procedure.",
			choices: ["disclosure", "invalid_whois"],
		})
		.coerce("reg-who-request-reg-who-request-type", (value) =>
			resolveFileToken(value, "reg-who-request-reg-who-request-type", "text")
		)
		.option("reg-who-request-reg-who-requested-data-elements", {
			type: "string",
			array: true,
			description:
				"The specific WHOIS data elements being requested per RDP 10.2.2. Required for all WHOIS requests.",
		})
		.option("reg-who-request-reg-who-requestor-type", {
			type: "string",
			description: "The nature of the requestor per RDP 10.2.1.2.",
			choices: ["government", "corporation", "individual"],
		})
		.coerce("reg-who-request-reg-who-requestor-type", (value) =>
			resolveFileToken(value, "reg-who-request-reg-who-requestor-type", "text")
		)
		.option("ncsei-subject-representation", {
			type: "boolean",
			description:
				"If the submitter is the target of NCSEI in the URLs of the abuse report.",
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
		.conflicts("address1", [
			"justification",
			"trademark-number",
			"trademark-office",
			"trademark-symbol",
			"destination-ips",
			"ports-protocols",
			"source-ips",
			"ncmec-notification",
			"reg-who-request-reg-who-authorization-statement",
			"reg-who-request-reg-who-good-faith-affirmation",
			"reg-who-request-reg-who-lawful-processing-agreement",
			"reg-who-request-reg-who-legal-basis",
			"reg-who-request-reg-who-request-type",
			"reg-who-request-reg-who-requested-data-elements",
			"reg-who-request-reg-who-requestor-type",
			"ncsei-subject-representation",
		])
		.implies("address1", [
			"agent-name",
			"agree",
			"city",
			"country",
			"host-notification",
			"original-work",
			"signature",
			"state",
		])
		.conflicts("agent-name", [
			"justification",
			"trademark-number",
			"trademark-office",
			"trademark-symbol",
			"destination-ips",
			"ports-protocols",
			"source-ips",
			"ncmec-notification",
			"reg-who-request-reg-who-authorization-statement",
			"reg-who-request-reg-who-good-faith-affirmation",
			"reg-who-request-reg-who-lawful-processing-agreement",
			"reg-who-request-reg-who-legal-basis",
			"reg-who-request-reg-who-request-type",
			"reg-who-request-reg-who-requested-data-elements",
			"reg-who-request-reg-who-requestor-type",
			"ncsei-subject-representation",
		])
		.implies("agent-name", [
			"address1",
			"agree",
			"city",
			"country",
			"host-notification",
			"original-work",
			"signature",
			"state",
		])
		.conflicts("agree", [
			"justification",
			"trademark-number",
			"trademark-office",
			"trademark-symbol",
			"destination-ips",
			"ports-protocols",
			"source-ips",
			"ncmec-notification",
			"reg-who-request-reg-who-authorization-statement",
			"reg-who-request-reg-who-good-faith-affirmation",
			"reg-who-request-reg-who-lawful-processing-agreement",
			"reg-who-request-reg-who-legal-basis",
			"reg-who-request-reg-who-request-type",
			"reg-who-request-reg-who-requested-data-elements",
			"reg-who-request-reg-who-requestor-type",
			"ncsei-subject-representation",
		])
		.implies("agree", [
			"address1",
			"agent-name",
			"city",
			"country",
			"host-notification",
			"original-work",
			"signature",
			"state",
		])
		.conflicts("city", [
			"justification",
			"trademark-number",
			"trademark-office",
			"trademark-symbol",
			"destination-ips",
			"ports-protocols",
			"source-ips",
			"ncmec-notification",
			"reg-who-request-reg-who-authorization-statement",
			"reg-who-request-reg-who-good-faith-affirmation",
			"reg-who-request-reg-who-lawful-processing-agreement",
			"reg-who-request-reg-who-legal-basis",
			"reg-who-request-reg-who-request-type",
			"reg-who-request-reg-who-requested-data-elements",
			"reg-who-request-reg-who-requestor-type",
			"ncsei-subject-representation",
		])
		.implies("city", [
			"address1",
			"agent-name",
			"agree",
			"country",
			"host-notification",
			"original-work",
			"signature",
			"state",
		])
		.conflicts("country", [
			"justification",
			"trademark-number",
			"trademark-office",
			"trademark-symbol",
			"destination-ips",
			"ports-protocols",
			"source-ips",
			"reg-who-request-reg-who-authorization-statement",
			"reg-who-request-reg-who-good-faith-affirmation",
			"reg-who-request-reg-who-lawful-processing-agreement",
			"reg-who-request-reg-who-legal-basis",
			"reg-who-request-reg-who-request-type",
			"reg-who-request-reg-who-requested-data-elements",
			"reg-who-request-reg-who-requestor-type",
			"original-work",
		])
		.implies("country", [
			"address1",
			"agent-name",
			"agree",
			"city",
			"host-notification",
			"original-work",
			"signature",
			"state",
		])
		.conflicts("host-notification", [
			"reg-who-request-reg-who-authorization-statement",
			"reg-who-request-reg-who-good-faith-affirmation",
			"reg-who-request-reg-who-lawful-processing-agreement",
			"reg-who-request-reg-who-legal-basis",
			"reg-who-request-reg-who-request-type",
			"reg-who-request-reg-who-requested-data-elements",
			"reg-who-request-reg-who-requestor-type",
		])
		.conflicts("original-work", [
			"justification",
			"trademark-number",
			"trademark-office",
			"trademark-symbol",
			"destination-ips",
			"ports-protocols",
			"source-ips",
			"ncmec-notification",
			"reg-who-request-reg-who-authorization-statement",
			"reg-who-request-reg-who-good-faith-affirmation",
			"reg-who-request-reg-who-lawful-processing-agreement",
			"reg-who-request-reg-who-legal-basis",
			"reg-who-request-reg-who-request-type",
			"reg-who-request-reg-who-requested-data-elements",
			"reg-who-request-reg-who-requestor-type",
			"ncsei-subject-representation",
			"country",
		])
		.implies("original-work", [
			"address1",
			"agent-name",
			"agree",
			"city",
			"country",
			"host-notification",
			"signature",
			"state",
		])
		.conflicts("signature", [
			"justification",
			"trademark-number",
			"trademark-office",
			"trademark-symbol",
			"destination-ips",
			"ports-protocols",
			"source-ips",
			"ncmec-notification",
			"reg-who-request-reg-who-authorization-statement",
			"reg-who-request-reg-who-good-faith-affirmation",
			"reg-who-request-reg-who-lawful-processing-agreement",
			"reg-who-request-reg-who-legal-basis",
			"reg-who-request-reg-who-request-type",
			"reg-who-request-reg-who-requested-data-elements",
			"reg-who-request-reg-who-requestor-type",
			"ncsei-subject-representation",
		])
		.implies("signature", [
			"address1",
			"agent-name",
			"agree",
			"city",
			"country",
			"host-notification",
			"original-work",
			"state",
		])
		.conflicts("state", [
			"justification",
			"trademark-number",
			"trademark-office",
			"trademark-symbol",
			"destination-ips",
			"ports-protocols",
			"source-ips",
			"ncmec-notification",
			"reg-who-request-reg-who-authorization-statement",
			"reg-who-request-reg-who-good-faith-affirmation",
			"reg-who-request-reg-who-lawful-processing-agreement",
			"reg-who-request-reg-who-legal-basis",
			"reg-who-request-reg-who-request-type",
			"reg-who-request-reg-who-requested-data-elements",
			"reg-who-request-reg-who-requestor-type",
			"ncsei-subject-representation",
		])
		.implies("state", [
			"address1",
			"agent-name",
			"agree",
			"city",
			"country",
			"host-notification",
			"original-work",
			"signature",
		])
		.conflicts("justification", [
			"address1",
			"agent-name",
			"agree",
			"city",
			"country",
			"original-work",
			"signature",
			"state",
			"reg-who-request-reg-who-authorization-statement",
			"reg-who-request-reg-who-good-faith-affirmation",
			"reg-who-request-reg-who-lawful-processing-agreement",
			"reg-who-request-reg-who-legal-basis",
			"reg-who-request-reg-who-request-type",
			"reg-who-request-reg-who-requested-data-elements",
			"reg-who-request-reg-who-requestor-type",
			"ncsei-subject-representation",
		])
		.conflicts("trademark-number", [
			"address1",
			"agent-name",
			"agree",
			"city",
			"country",
			"original-work",
			"signature",
			"state",
			"destination-ips",
			"ports-protocols",
			"source-ips",
			"ncmec-notification",
			"reg-who-request-reg-who-authorization-statement",
			"reg-who-request-reg-who-good-faith-affirmation",
			"reg-who-request-reg-who-lawful-processing-agreement",
			"reg-who-request-reg-who-legal-basis",
			"reg-who-request-reg-who-request-type",
			"reg-who-request-reg-who-requested-data-elements",
			"reg-who-request-reg-who-requestor-type",
			"ncsei-subject-representation",
		])
		.implies("trademark-number", [
			"host-notification",
			"justification",
			"trademark-office",
			"trademark-symbol",
		])
		.conflicts("trademark-office", [
			"address1",
			"agent-name",
			"agree",
			"city",
			"country",
			"original-work",
			"signature",
			"state",
			"destination-ips",
			"ports-protocols",
			"source-ips",
			"ncmec-notification",
			"reg-who-request-reg-who-authorization-statement",
			"reg-who-request-reg-who-good-faith-affirmation",
			"reg-who-request-reg-who-lawful-processing-agreement",
			"reg-who-request-reg-who-legal-basis",
			"reg-who-request-reg-who-request-type",
			"reg-who-request-reg-who-requested-data-elements",
			"reg-who-request-reg-who-requestor-type",
			"ncsei-subject-representation",
		])
		.implies("trademark-office", [
			"host-notification",
			"justification",
			"trademark-number",
			"trademark-symbol",
		])
		.conflicts("trademark-symbol", [
			"address1",
			"agent-name",
			"agree",
			"city",
			"country",
			"original-work",
			"signature",
			"state",
			"destination-ips",
			"ports-protocols",
			"source-ips",
			"ncmec-notification",
			"reg-who-request-reg-who-authorization-statement",
			"reg-who-request-reg-who-good-faith-affirmation",
			"reg-who-request-reg-who-lawful-processing-agreement",
			"reg-who-request-reg-who-legal-basis",
			"reg-who-request-reg-who-request-type",
			"reg-who-request-reg-who-requested-data-elements",
			"reg-who-request-reg-who-requestor-type",
			"ncsei-subject-representation",
		])
		.implies("trademark-symbol", [
			"host-notification",
			"justification",
			"trademark-number",
			"trademark-office",
		])
		.conflicts("destination-ips", [
			"address1",
			"agent-name",
			"agree",
			"city",
			"country",
			"original-work",
			"signature",
			"state",
			"trademark-number",
			"trademark-office",
			"trademark-symbol",
			"ncmec-notification",
			"reg-who-request-reg-who-authorization-statement",
			"reg-who-request-reg-who-good-faith-affirmation",
			"reg-who-request-reg-who-lawful-processing-agreement",
			"reg-who-request-reg-who-legal-basis",
			"reg-who-request-reg-who-request-type",
			"reg-who-request-reg-who-requested-data-elements",
			"reg-who-request-reg-who-requestor-type",
			"ncsei-subject-representation",
		])
		.conflicts("ports-protocols", [
			"address1",
			"agent-name",
			"agree",
			"city",
			"country",
			"original-work",
			"signature",
			"state",
			"trademark-number",
			"trademark-office",
			"trademark-symbol",
			"ncmec-notification",
			"reg-who-request-reg-who-authorization-statement",
			"reg-who-request-reg-who-good-faith-affirmation",
			"reg-who-request-reg-who-lawful-processing-agreement",
			"reg-who-request-reg-who-legal-basis",
			"reg-who-request-reg-who-request-type",
			"reg-who-request-reg-who-requested-data-elements",
			"reg-who-request-reg-who-requestor-type",
			"ncsei-subject-representation",
		])
		.conflicts("source-ips", [
			"address1",
			"agent-name",
			"agree",
			"city",
			"country",
			"original-work",
			"signature",
			"state",
			"trademark-number",
			"trademark-office",
			"trademark-symbol",
			"ncmec-notification",
			"reg-who-request-reg-who-authorization-statement",
			"reg-who-request-reg-who-good-faith-affirmation",
			"reg-who-request-reg-who-lawful-processing-agreement",
			"reg-who-request-reg-who-legal-basis",
			"reg-who-request-reg-who-request-type",
			"reg-who-request-reg-who-requested-data-elements",
			"reg-who-request-reg-who-requestor-type",
			"ncsei-subject-representation",
		])
		.conflicts("ncmec-notification", [
			"address1",
			"agent-name",
			"agree",
			"city",
			"original-work",
			"signature",
			"state",
			"trademark-number",
			"trademark-office",
			"trademark-symbol",
			"destination-ips",
			"ports-protocols",
			"source-ips",
			"reg-who-request-reg-who-authorization-statement",
			"reg-who-request-reg-who-good-faith-affirmation",
			"reg-who-request-reg-who-lawful-processing-agreement",
			"reg-who-request-reg-who-legal-basis",
			"reg-who-request-reg-who-request-type",
			"reg-who-request-reg-who-requested-data-elements",
			"reg-who-request-reg-who-requestor-type",
			"ncsei-subject-representation",
		])
		.implies("ncmec-notification", ["host-notification", "justification"])
		.conflicts("reg-who-request-reg-who-authorization-statement", [
			"address1",
			"agent-name",
			"agree",
			"city",
			"country",
			"host-notification",
			"original-work",
			"signature",
			"state",
			"justification",
			"trademark-number",
			"trademark-office",
			"trademark-symbol",
			"destination-ips",
			"ports-protocols",
			"source-ips",
			"ncmec-notification",
			"ncsei-subject-representation",
		])
		.conflicts("reg-who-request-reg-who-good-faith-affirmation", [
			"address1",
			"agent-name",
			"agree",
			"city",
			"country",
			"host-notification",
			"original-work",
			"signature",
			"state",
			"justification",
			"trademark-number",
			"trademark-office",
			"trademark-symbol",
			"destination-ips",
			"ports-protocols",
			"source-ips",
			"ncmec-notification",
			"ncsei-subject-representation",
		])
		.conflicts("reg-who-request-reg-who-lawful-processing-agreement", [
			"address1",
			"agent-name",
			"agree",
			"city",
			"country",
			"host-notification",
			"original-work",
			"signature",
			"state",
			"justification",
			"trademark-number",
			"trademark-office",
			"trademark-symbol",
			"destination-ips",
			"ports-protocols",
			"source-ips",
			"ncmec-notification",
			"ncsei-subject-representation",
		])
		.conflicts("reg-who-request-reg-who-legal-basis", [
			"address1",
			"agent-name",
			"agree",
			"city",
			"country",
			"host-notification",
			"original-work",
			"signature",
			"state",
			"justification",
			"trademark-number",
			"trademark-office",
			"trademark-symbol",
			"destination-ips",
			"ports-protocols",
			"source-ips",
			"ncmec-notification",
			"ncsei-subject-representation",
		])
		.conflicts("reg-who-request-reg-who-request-type", [
			"address1",
			"agent-name",
			"agree",
			"city",
			"country",
			"host-notification",
			"original-work",
			"signature",
			"state",
			"justification",
			"trademark-number",
			"trademark-office",
			"trademark-symbol",
			"destination-ips",
			"ports-protocols",
			"source-ips",
			"ncmec-notification",
			"ncsei-subject-representation",
		])
		.conflicts("reg-who-request-reg-who-requested-data-elements", [
			"address1",
			"agent-name",
			"agree",
			"city",
			"country",
			"host-notification",
			"original-work",
			"signature",
			"state",
			"justification",
			"trademark-number",
			"trademark-office",
			"trademark-symbol",
			"destination-ips",
			"ports-protocols",
			"source-ips",
			"ncmec-notification",
			"ncsei-subject-representation",
		])
		.conflicts("reg-who-request-reg-who-requestor-type", [
			"address1",
			"agent-name",
			"agree",
			"city",
			"country",
			"host-notification",
			"original-work",
			"signature",
			"state",
			"justification",
			"trademark-number",
			"trademark-office",
			"trademark-symbol",
			"destination-ips",
			"ports-protocols",
			"source-ips",
			"ncmec-notification",
			"ncsei-subject-representation",
		])
		.conflicts("ncsei-subject-representation", [
			"address1",
			"agent-name",
			"agree",
			"city",
			"original-work",
			"signature",
			"state",
			"justification",
			"trademark-number",
			"trademark-office",
			"trademark-symbol",
			"destination-ips",
			"ports-protocols",
			"source-ips",
			"ncmec-notification",
			"reg-who-request-reg-who-authorization-statement",
			"reg-who-request-reg-who-good-faith-affirmation",
			"reg-who-request-reg-who-lawful-processing-agreement",
			"reg-who-request-reg-who-legal-basis",
			"reg-who-request-reg-who-request-type",
			"reg-who-request-reg-who-requested-data-elements",
			"reg-who-request-reg-who-requestor-type",
		])
		.implies("ncsei-subject-representation", ["host-notification"])
		.check((argv) => {
			const groupSet = [
				"reg-who-request-reg-who-authorization-statement",
				"reg-who-request-reg-who-good-faith-affirmation",
				"reg-who-request-reg-who-lawful-processing-agreement",
				"reg-who-request-reg-who-legal-basis",
				"reg-who-request-reg-who-request-type",
				"reg-who-request-reg-who-requested-data-elements",
				"reg-who-request-reg-who-requestor-type",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const requiredConflicts: Record<string, string[]> = {
					"reg-who-request-reg-who-good-faith-affirmation": [
						"address1",
						"agent-name",
						"agree",
						"city",
						"country",
						"host-notification",
						"original-work",
						"signature",
						"state",
						"justification",
						"trademark-number",
						"trademark-office",
						"trademark-symbol",
						"destination-ips",
						"ports-protocols",
						"source-ips",
						"ncmec-notification",
						"ncsei-subject-representation",
					],
					"reg-who-request-reg-who-lawful-processing-agreement": [
						"address1",
						"agent-name",
						"agree",
						"city",
						"country",
						"host-notification",
						"original-work",
						"signature",
						"state",
						"justification",
						"trademark-number",
						"trademark-office",
						"trademark-symbol",
						"destination-ips",
						"ports-protocols",
						"source-ips",
						"ncmec-notification",
						"ncsei-subject-representation",
					],
					"reg-who-request-reg-who-legal-basis": [
						"address1",
						"agent-name",
						"agree",
						"city",
						"country",
						"host-notification",
						"original-work",
						"signature",
						"state",
						"justification",
						"trademark-number",
						"trademark-office",
						"trademark-symbol",
						"destination-ips",
						"ports-protocols",
						"source-ips",
						"ncmec-notification",
						"ncsei-subject-representation",
					],
					"reg-who-request-reg-who-request-type": [
						"address1",
						"agent-name",
						"agree",
						"city",
						"country",
						"host-notification",
						"original-work",
						"signature",
						"state",
						"justification",
						"trademark-number",
						"trademark-office",
						"trademark-symbol",
						"destination-ips",
						"ports-protocols",
						"source-ips",
						"ncmec-notification",
						"ncsei-subject-representation",
					],
					"reg-who-request-reg-who-requested-data-elements": [
						"address1",
						"agent-name",
						"agree",
						"city",
						"country",
						"host-notification",
						"original-work",
						"signature",
						"state",
						"justification",
						"trademark-number",
						"trademark-office",
						"trademark-symbol",
						"destination-ips",
						"ports-protocols",
						"source-ips",
						"ncmec-notification",
						"ncsei-subject-representation",
					],
				};
				const missing = [
					"reg-who-request-reg-who-good-faith-affirmation",
					"reg-who-request-reg-who-lawful-processing-agreement",
					"reg-who-request-reg-who-legal-basis",
					"reg-who-request-reg-who-request-type",
					"reg-who-request-reg-who-requested-data-elements",
				].filter(
					(k) =>
						argv[k] === undefined &&
						!(requiredConflicts[k] ?? []).some((x) => argv[x] !== undefined)
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --reg_who_request-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"SubmitAbuseReport">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <report-type>",
	describe: "Submit an abuse report",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "abuse-reports create",
				classification: {
					safeFlags: [
						"act",
						"host-notification",
						"owner-notification",
						"ncmec-notification",
						"reg-who-request-reg-who-good-faith-affirmation",
						"reg-who-request-reg-who-lawful-processing-agreement",
						"reg-who-request-reg-who-request-type",
						"reg-who-request-reg-who-requestor-type",
						"ncsei-subject-representation",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf abuse-reports create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/abuse-reports/${argv["report-type"] == null ? "<report-type>" : encodeURIComponent(String(argv["report-type"]))}`,
						pathParams: { "report-type": String(argv["report-type"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										act: argv["act"],
										comments: resolveFileToken(
											argv["comments"] as string | undefined,
											"comments",
											"text"
										),
										company: resolveFileToken(
											argv["company"] as string | undefined,
											"company",
											"text"
										),
										email: resolveFileToken(
											argv["email"] as string | undefined,
											"email",
											"text"
										),
										email2: resolveFileToken(
											argv["email2"] as string | undefined,
											"email2",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										reported_country: resolveFileToken(
											argv["reported-country"] as string | undefined,
											"reported-country",
											"text"
										),
										reported_user_agent: resolveFileToken(
											argv["reported-user-agent"] as string | undefined,
											"reported-user-agent",
											"text"
										),
										tele: resolveFileToken(
											argv["tele"] as string | undefined,
											"tele",
											"text"
										),
										title: resolveFileToken(
											argv["title"] as string | undefined,
											"title",
											"text"
										),
										urls: resolveFileToken(
											argv["urls"] as string | undefined,
											"urls",
											"text"
										),
										address1: resolveFileToken(
											argv["address1"] as string | undefined,
											"address1",
											"text"
										),
										agent_name: resolveFileToken(
											argv["agent-name"] as string | undefined,
											"agent-name",
											"text"
										),
										agree: argv["agree"],
										city: resolveFileToken(
											argv["city"] as string | undefined,
											"city",
											"text"
										),
										country: resolveFileToken(
											argv["country"] as string | undefined,
											"country",
											"text"
										),
										host_notification: argv["host-notification"],
										original_work: resolveFileToken(
											argv["original-work"] as string | undefined,
											"original-work",
											"text"
										),
										owner_notification: argv["owner-notification"],
										signature: resolveFileToken(
											argv["signature"] as string | undefined,
											"signature",
											"text"
										),
										state: resolveFileToken(
											argv["state"] as string | undefined,
											"state",
											"text"
										),
										justification: resolveFileToken(
											argv["justification"] as string | undefined,
											"justification",
											"text"
										),
										trademark_number: resolveFileToken(
											argv["trademark-number"] as string | undefined,
											"trademark-number",
											"text"
										),
										trademark_office: resolveFileToken(
											argv["trademark-office"] as string | undefined,
											"trademark-office",
											"text"
										),
										trademark_symbol: resolveFileToken(
											argv["trademark-symbol"] as string | undefined,
											"trademark-symbol",
											"text"
										),
										destination_ips: resolveFileToken(
											argv["destination-ips"] as string | undefined,
											"destination-ips",
											"text"
										),
										ports_protocols: resolveFileToken(
											argv["ports-protocols"] as string | undefined,
											"ports-protocols",
											"text"
										),
										source_ips: resolveFileToken(
											argv["source-ips"] as string | undefined,
											"source-ips",
											"text"
										),
										ncmec_notification: argv["ncmec-notification"],
										reg_who_request: {
											reg_who_authorization_statement: resolveFileToken(
												argv[
													"reg-who-request-reg-who-authorization-statement"
												] as string | undefined,
												"reg-who-request-reg-who-authorization-statement",
												"text"
											),
											reg_who_good_faith_affirmation:
												argv["reg-who-request-reg-who-good-faith-affirmation"],
											reg_who_lawful_processing_agreement:
												argv[
													"reg-who-request-reg-who-lawful-processing-agreement"
												],
											reg_who_legal_basis: resolveFileToken(
												argv["reg-who-request-reg-who-legal-basis"] as
													| string
													| undefined,
												"reg-who-request-reg-who-legal-basis",
												"text"
											),
											reg_who_request_type:
												argv["reg-who-request-reg-who-request-type"],
											reg_who_requested_data_elements:
												argv["reg-who-request-reg-who-requested-data-elements"],
											reg_who_requestor_type:
												argv["reg-who-request-reg-who-requestor-type"],
										},
										ncsei_subject_representation:
											argv["ncsei-subject-representation"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.abuseReports.create({
							body: bodyData,
							account_id: accountId,
							"report-type": argv["report-type"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["act"] === undefined) {
					argv["act"] = await promptForRequiredEnumField(
						"act",
						"The act field",
						[
							"abuse_dmca",
							"abuse_trademark",
							"abuse_general",
							"abuse_phishing",
							"abuse_children",
							"abuse_threat",
							"abuse_registrar_whois",
							"abuse_ncsei",
						] as const
					);
				}
				if (argv["email"] === undefined) {
					argv["email"] = await promptForRequiredField(
						"email",
						"A valid email of the abuse reporter. This field may be released by Cloudflare to third parties such as the Lumen Database (https://lumendatabase.org/)."
					);
				}
				if (argv["email2"] === undefined) {
					argv["email2"] = await promptForRequiredField(
						"email2",
						"Should match the value provided in \`email\`"
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Text not exceeding 255 characters. This field may be released by Cloudflare to third parties such as the Lumen Database (https://lumendatabase.org/)."
					);
				}
				if (argv["urls"] === undefined) {
					argv["urls"] = await promptForRequiredField(
						"urls",
						"A list of valid URLs separated by ‘\\n’ (new line character). The list of the URLs should not exceed 250 URLs. All URLs should have the same hostname. Each URL should be unique. This field may be released by Cloudflare to third parties such as the Lumen Database (https://lumendatabase.org/)."
					);
				}
				if (argv["owner-notification"] === undefined) {
					argv["owner-notification"] = await promptForRequiredEnumField(
						"owner-notification",
						"Notification type based on the abuse type. NOTE: Copyright (DMCA) and Trademark reports cannot be anonymous. ",
						["send", "send-anon", "none"] as const
					);
				}

				if (argv["act"] === "abuse_dmca" && argv["address1"] === undefined) {
					argv["address1"] = await promptForRequiredField(
						"address1",
						"Text not exceeding 100 characters. This field may be released by Cloudflare to third parties such as the Lumen Database (https://lumendatabase.org/).",
						{ question: "Enter value for --address1" }
					);
				}
				if (argv["act"] === "abuse_dmca" && argv["agent-name"] === undefined) {
					argv["agent-name"] = await promptForRequiredField(
						"agent-name",
						"The name of the copyright holder. Text not exceeding 60 characters. This field may be released by Cloudflare to third parties such as the Lumen Database (https://lumendatabase.org/).",
						{ question: "Enter value for --agent-name" }
					);
				}
				if (argv["act"] === "abuse_dmca" && argv["agree"] === undefined) {
					throw new Error(
						"--agree is required (or pass --body with this field set)."
					);
				}
				if (argv["act"] === "abuse_dmca" && argv["city"] === undefined) {
					argv["city"] = await promptForRequiredField(
						"city",
						"Text not exceeding 255 characters. This field may be released by Cloudflare to third parties such as the Lumen Database (https://lumendatabase.org/).",
						{ question: "Enter value for --city" }
					);
				}
				if (argv["act"] === "abuse_dmca" && argv["country"] === undefined) {
					argv["country"] = await promptForRequiredField(
						"country",
						"Text not exceeding 255 characters. This field may be released by Cloudflare to third parties such as the Lumen Database (https://lumendatabase.org/). ",
						{ question: "Enter value for --country" }
					);
				}
				if (
					argv["act"] === "abuse_dmca" &&
					argv["host-notification"] === undefined
				) {
					argv["host-notification"] = await promptForRequiredField(
						"host-notification",
						"Notification type based on the abuse type. NOTE: Copyright (DMCA) and Trademark reports cannot be anonymous. ",
						{ question: "Enter value for --host-notification" }
					);
				}
				if (
					argv["act"] === "abuse_dmca" &&
					argv["original-work"] === undefined
				) {
					argv["original-work"] = await promptForRequiredField(
						"original-work",
						"Text not exceeding 255 characters. This field may be released by Cloudflare to third parties such as the Lumen Database (https://lumendatabase.org/). ",
						{ question: "Enter value for --original-work" }
					);
				}
				if (argv["act"] === "abuse_dmca" && argv["signature"] === undefined) {
					argv["signature"] = await promptForRequiredField(
						"signature",
						"Required for DMCA reports, should be same as Name. An affirmation that all information in the report is true and accurate while agreeing to the policies of Cloudflare's abuse reports",
						{ question: "Enter value for --signature" }
					);
				}
				if (argv["act"] === "abuse_dmca" && argv["state"] === undefined) {
					argv["state"] = await promptForRequiredField(
						"state",
						"Text not exceeding 255 characters. This field may be released by Cloudflare to third parties such as the Lumen Database (https://lumendatabase.org/).",
						{ question: "Enter value for --state" }
					);
				}
				if (
					argv["act"] === "abuse_trademark" &&
					argv["host-notification"] === undefined
				) {
					argv["host-notification"] = await promptForRequiredField(
						"host-notification",
						"Notification type based on the abuse type. NOTE: Copyright (DMCA) and Trademark reports cannot be anonymous. ",
						{ question: "Enter value for --host-notification" }
					);
				}
				if (
					argv["act"] === "abuse_trademark" &&
					argv["justification"] === undefined
				) {
					argv["justification"] = await promptForRequiredField(
						"justification",
						"A detailed description of the infringement, including any necessary access details and the exact steps needed to view the content, not exceeding 5000 characters. ",
						{ question: "Enter value for --justification" }
					);
				}
				if (
					argv["act"] === "abuse_trademark" &&
					argv["trademark-number"] === undefined
				) {
					argv["trademark-number"] = await promptForRequiredField(
						"trademark-number",
						"Text not exceeding 1000 characters",
						{ question: "Enter value for --trademark-number" }
					);
				}
				if (
					argv["act"] === "abuse_trademark" &&
					argv["trademark-office"] === undefined
				) {
					argv["trademark-office"] = await promptForRequiredField(
						"trademark-office",
						"Text not exceeding 1000 characters",
						{ question: "Enter value for --trademark-office" }
					);
				}
				if (
					argv["act"] === "abuse_trademark" &&
					argv["trademark-symbol"] === undefined
				) {
					argv["trademark-symbol"] = await promptForRequiredField(
						"trademark-symbol",
						"Text not exceeding 1000 characters",
						{ question: "Enter value for --trademark-symbol" }
					);
				}
				if (
					argv["act"] === "abuse_general" &&
					argv["host-notification"] === undefined
				) {
					argv["host-notification"] = await promptForRequiredField(
						"host-notification",
						"Notification type based on the abuse type. NOTE: Copyright (DMCA) and Trademark reports cannot be anonymous. ",
						{ question: "Enter value for --host-notification" }
					);
				}
				if (
					argv["act"] === "abuse_general" &&
					argv["justification"] === undefined
				) {
					argv["justification"] = await promptForRequiredField(
						"justification",
						"A detailed description of the infringement, including any necessary access details and the exact steps needed to view the content, not exceeding 5000 characters. ",
						{ question: "Enter value for --justification" }
					);
				}
				if (
					argv["act"] === "abuse_phishing" &&
					argv["host-notification"] === undefined
				) {
					argv["host-notification"] = await promptForRequiredField(
						"host-notification",
						"Notification type based on the abuse type. NOTE: Copyright (DMCA) and Trademark reports cannot be anonymous. ",
						{ question: "Enter value for --host-notification" }
					);
				}
				if (
					argv["act"] === "abuse_phishing" &&
					argv["justification"] === undefined
				) {
					argv["justification"] = await promptForRequiredField(
						"justification",
						"A detailed description of the infringement, including any necessary access details and the exact steps needed to view the content, not exceeding 5000 characters. ",
						{ question: "Enter value for --justification" }
					);
				}
				if (
					argv["act"] === "abuse_children" &&
					argv["host-notification"] === undefined
				) {
					argv["host-notification"] = await promptForRequiredField(
						"host-notification",
						"Notification type based on the abuse type. NOTE: Copyright (DMCA) and Trademark reports cannot be anonymous. ",
						{ question: "Enter value for --host-notification" }
					);
				}
				if (
					argv["act"] === "abuse_children" &&
					argv["justification"] === undefined
				) {
					argv["justification"] = await promptForRequiredField(
						"justification",
						"A detailed description of the infringement, including any necessary access details and the exact steps needed to view the content, not exceeding 5000 characters. ",
						{ question: "Enter value for --justification" }
					);
				}
				if (
					argv["act"] === "abuse_children" &&
					argv["ncmec-notification"] === undefined
				) {
					argv["ncmec-notification"] = await promptForRequiredField(
						"ncmec-notification",
						"Notification type based on the abuse type. NOTE: Copyright (DMCA) and Trademark reports cannot be anonymous. ",
						{ question: "Enter value for --ncmec-notification" }
					);
				}
				if (
					argv["act"] === "abuse_threat" &&
					argv["host-notification"] === undefined
				) {
					argv["host-notification"] = await promptForRequiredField(
						"host-notification",
						"Notification type based on the abuse type. NOTE: Copyright (DMCA) and Trademark reports cannot be anonymous. ",
						{ question: "Enter value for --host-notification" }
					);
				}
				if (
					argv["act"] === "abuse_threat" &&
					argv["justification"] === undefined
				) {
					argv["justification"] = await promptForRequiredField(
						"justification",
						"A detailed description of the infringement, including any necessary access details and the exact steps needed to view the content, not exceeding 5000 characters. ",
						{ question: "Enter value for --justification" }
					);
				}
				if (
					argv["act"] === "abuse_ncsei" &&
					argv["host-notification"] === undefined
				) {
					argv["host-notification"] = await promptForRequiredField(
						"host-notification",
						"Notification type based on the abuse type. NOTE: Copyright (DMCA) and Trademark reports cannot be anonymous. ",
						{ question: "Enter value for --host-notification" }
					);
				}
				if (
					argv["act"] === "abuse_ncsei" &&
					argv["ncsei-subject-representation"] === undefined
				) {
					throw new Error(
						"--ncsei-subject-representation is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					act: argv["act"],
					comments: resolveFileToken(
						argv["comments"] as string | undefined,
						"comments",
						"text"
					),
					company: resolveFileToken(
						argv["company"] as string | undefined,
						"company",
						"text"
					),
					email: resolveFileToken(
						argv["email"] as string | undefined,
						"email",
						"text"
					),
					email2: resolveFileToken(
						argv["email2"] as string | undefined,
						"email2",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					reported_country: resolveFileToken(
						argv["reported-country"] as string | undefined,
						"reported-country",
						"text"
					),
					reported_user_agent: resolveFileToken(
						argv["reported-user-agent"] as string | undefined,
						"reported-user-agent",
						"text"
					),
					tele: resolveFileToken(
						argv["tele"] as string | undefined,
						"tele",
						"text"
					),
					title: resolveFileToken(
						argv["title"] as string | undefined,
						"title",
						"text"
					),
					urls: resolveFileToken(
						argv["urls"] as string | undefined,
						"urls",
						"text"
					),
					address1: resolveFileToken(
						argv["address1"] as string | undefined,
						"address1",
						"text"
					),
					agent_name: resolveFileToken(
						argv["agent-name"] as string | undefined,
						"agent-name",
						"text"
					),
					agree: argv["agree"],
					city: resolveFileToken(
						argv["city"] as string | undefined,
						"city",
						"text"
					),
					country: resolveFileToken(
						argv["country"] as string | undefined,
						"country",
						"text"
					),
					host_notification: argv["host-notification"],
					original_work: resolveFileToken(
						argv["original-work"] as string | undefined,
						"original-work",
						"text"
					),
					owner_notification: argv["owner-notification"],
					signature: resolveFileToken(
						argv["signature"] as string | undefined,
						"signature",
						"text"
					),
					state: resolveFileToken(
						argv["state"] as string | undefined,
						"state",
						"text"
					),
					justification: resolveFileToken(
						argv["justification"] as string | undefined,
						"justification",
						"text"
					),
					trademark_number: resolveFileToken(
						argv["trademark-number"] as string | undefined,
						"trademark-number",
						"text"
					),
					trademark_office: resolveFileToken(
						argv["trademark-office"] as string | undefined,
						"trademark-office",
						"text"
					),
					trademark_symbol: resolveFileToken(
						argv["trademark-symbol"] as string | undefined,
						"trademark-symbol",
						"text"
					),
					destination_ips: resolveFileToken(
						argv["destination-ips"] as string | undefined,
						"destination-ips",
						"text"
					),
					ports_protocols: resolveFileToken(
						argv["ports-protocols"] as string | undefined,
						"ports-protocols",
						"text"
					),
					source_ips: resolveFileToken(
						argv["source-ips"] as string | undefined,
						"source-ips",
						"text"
					),
					ncmec_notification: argv["ncmec-notification"],
					reg_who_request: {
						reg_who_authorization_statement: resolveFileToken(
							argv["reg-who-request-reg-who-authorization-statement"] as
								| string
								| undefined,
							"reg-who-request-reg-who-authorization-statement",
							"text"
						),
						reg_who_good_faith_affirmation:
							argv["reg-who-request-reg-who-good-faith-affirmation"],
						reg_who_lawful_processing_agreement:
							argv["reg-who-request-reg-who-lawful-processing-agreement"],
						reg_who_legal_basis: resolveFileToken(
							argv["reg-who-request-reg-who-legal-basis"] as string | undefined,
							"reg-who-request-reg-who-legal-basis",
							"text"
						),
						reg_who_request_type: argv["reg-who-request-reg-who-request-type"],
						reg_who_requested_data_elements:
							argv["reg-who-request-reg-who-requested-data-elements"],
						reg_who_requestor_type:
							argv["reg-who-request-reg-who-requestor-type"],
					},
					ncsei_subject_representation: argv["ncsei-subject-representation"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.abuseReports.create({
						body: bodyData,
						account_id: accountId,
						"report-type": argv["report-type"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
