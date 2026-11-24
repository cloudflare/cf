import operation from "../../_operations/cloudforce-one/requests/create.js";
/**
 * create command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create <project-type>",
	describe: "Creates a new RFI",
	usage:
		"$0 cloudforce-one requests create <project-type>\n\nCreates a new Request for Information with the specified project type and details.",
	flags: {
		description: {
			kind: "parsed",
			brief:
				"RFI description (optional). Defaults to an empty string when omitted.",
			optional: true,
			parse: String,
		},
		"event-id": {
			kind: "parsed",
			brief: "Optional related event ID",
			optional: true,
			parse: String,
		},
		metadata: {
			kind: "parsed",
			brief:
				'Optional metadata fields specific to the RFI type. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		priority: {
			kind: "parsed",
			brief:
				"RFI priority. Four-level projects use `low`, `routine`, `high`, `urgent`; existing projects retain legacy `low`->routine compatibility. `medium`, `critical`, and `unknown` remain accepted legacy aliases. Defaults to `routine`.",
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
			brief: "Optional request type for the request",
			optional: true,
			parse: String,
		},
		"subtype-id": {
			kind: "parsed",
			brief: "Optional subtype ID",
			optional: true,
			parse: String,
		},
		title: {
			kind: "parsed",
			brief:
				"RFI title (optional). When omitted, the server generates a summary from the request type and readable ID.",
			optional: true,
			parse: String,
		},
		tlp: {
			kind: "parsed",
			brief:
				"Traffic Light Protocol level. Canonical values are `clear`, `green`, `amber`, `amber-strict`, `red`, `purple`. `white` and `amber+strict` are accepted input aliases; responses always use the canonical spelling.",
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
	operands: [
		{ placeholder: "project-type", brief: "RFI project type", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one requests create",
				classification: {
					safeFlags: ["priority", "tlp", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one requests create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/requests/${argv["project-type"] == null ? "<project-type>" : encodeURIComponent(String(argv["project-type"]))}`,
						pathParams: { "project-type": String(argv["project-type"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
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
											metadata: parseJsonMap(argv["metadata"], "metadata"),
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
											title: resolveFileToken(
												argv["title"] as string | undefined,
												"title",
												"text"
											),
											tlp: argv["tlp"],
										},
										[["metadata"]]
									),
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
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							project_type: argv["project-type"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
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
						metadata: parseJsonMap(argv["metadata"], "metadata"),
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
						title: resolveFileToken(
							argv["title"] as string | undefined,
							"title",
							"text"
						),
						tlp: argv["tlp"],
					},
					[["metadata"]]
				);
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						project_type: argv["project-type"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
