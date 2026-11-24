import operation from "../../_operations/cloudforce-one/requests/update.js";
/**
 * update command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <request-id>",
	describe: "Update an RFI",
	usage:
		"$0 cloudforce-one requests update <request-id>\n\nUpdates an existing RFI with the provided fields. Only provided fields will be updated.",
	flags: {
		"project-type": {
			kind: "parsed",
			brief:
				"RFI project type. Valid values: threat-intelligence, incident-response, ir-emergency-response, table-top, pentest, irp, threat-hunting, cybersecurity-assessment, react-general, legal-response, soc-alerts, demo",
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "RFI description",
			optional: true,
			parse: String,
		},
		"event-id": {
			kind: "parsed",
			brief: "Optional related event ID",
			optional: true,
			parse: String,
		},
		priority: {
			kind: "parsed",
			brief:
				"RFI priority. Four-level projects use a distinct `low` level; existing projects retain legacy `low`->routine compatibility. `medium`, `critical`, and `unknown` remain accepted legacy aliases.",
			optional: true,
			choices: [
				"low",
				"routine",
				"high",
				"urgent",
				"unknown",
				"medium",
				"critical",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "priority", "text"),
		},
		"request-type": {
			kind: "parsed",
			brief:
				"Request type. May only be changed while the request is still open; changing it recalculates the request's token cost.",
			optional: true,
			parse: String,
		},
		"subtype-id": {
			kind: "parsed",
			brief: "Optional subtype ID",
			optional: true,
			parse: String,
		},
		summary: {
			kind: "parsed",
			brief: "RFI summary",
			optional: true,
			parse: String,
		},
		title: {
			kind: "parsed",
			brief: "RFI title (alias for summary field)",
			optional: true,
			parse: String,
		},
		tlp: {
			kind: "parsed",
			brief:
				"Traffic Light Protocol level. `white` and `amber+strict` are accepted input aliases; responses always use the canonical spelling.",
			optional: true,
			choices: [
				"clear",
				"green",
				"amber",
				"amber-strict",
				"red",
				"purple",
				"white",
				"amber+strict",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "tlp", "text"),
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
	operands: [{ placeholder: "request-id", brief: "RFI UUID", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one requests update",
				classification: {
					safeFlags: ["priority", "tlp", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one requests update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/requests/${argv["project-type"] == null ? "<project-type>" : encodeURIComponent(String(argv["project-type"]))}/${argv["request-id"] == null ? "<request-id>" : encodeURIComponent(String(argv["request-id"]))}`,
						pathParams: {
							"project-type": String(argv["project-type"] ?? ""),
							"request-id": String(argv["request-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										eventId: resolveFileToken(
											argv["event-id"] as string | undefined,
											"event-id",
											"text"
										),
										priority: argv["priority"],
										request_type: resolveFileToken(
											argv["request-type"] as string | undefined,
											"request-type",
											"text"
										),
										subtypeId: resolveFileToken(
											argv["subtype-id"] as string | undefined,
											"subtype-id",
											"text"
										),
										summary: resolveFileToken(
											argv["summary"] as string | undefined,
											"summary",
											"text"
										),
										title: resolveFileToken(
											argv["title"] as string | undefined,
											"title",
											"text"
										),
										tlp: argv["tlp"],
									}),
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
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							project_type: argv["project-type"],
							request_id: argv["request-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					eventId: resolveFileToken(
						argv["event-id"] as string | undefined,
						"event-id",
						"text"
					),
					priority: argv["priority"],
					request_type: resolveFileToken(
						argv["request-type"] as string | undefined,
						"request-type",
						"text"
					),
					subtypeId: resolveFileToken(
						argv["subtype-id"] as string | undefined,
						"subtype-id",
						"text"
					),
					summary: resolveFileToken(
						argv["summary"] as string | undefined,
						"summary",
						"text"
					),
					title: resolveFileToken(
						argv["title"] as string | undefined,
						"title",
						"text"
					),
					tlp: argv["tlp"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						project_type: argv["project-type"],
						request_id: argv["request-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
