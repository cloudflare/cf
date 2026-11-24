import operation from "../../../../../_operations/cloudforce-one/threat-intel/events/legacy/raw/update.js";
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
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <raw-id>",
	describe: "Update raw event data by raw ID (legacy)",
	usage:
		"$0 cloudforce-one threat-intel events legacy raw update <raw-id>\n\nLegacy. Updates raw data stored under a `raw_id`, which new events don't use. There is no direct replacement.",
	flags: {
		"event-id": { kind: "parsed", brief: "Event UUID.", parse: String },
		data: {
			kind: "parsed",
			brief:
				'The data field. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		source: {
			kind: "parsed",
			brief: "The source field",
			optional: true,
			parse: String,
		},
		tlp: {
			kind: "parsed",
			brief: "The tlp field",
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
	operands: [
		{ placeholder: "raw-id", brief: "Raw Event UUID.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-intel events legacy raw update",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-intel events legacy raw update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/${argv["event-id"] == null ? "<event-id>" : encodeURIComponent(String(argv["event-id"]))}/raw/${argv["raw-id"] == null ? "<raw-id>" : encodeURIComponent(String(argv["raw-id"]))}`,
						pathParams: {
							"event-id": String(argv["event-id"] ?? ""),
							"raw-id": String(argv["raw-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											data: parseJsonMap(argv["data"], "data"),
											source: resolveFileToken(
												argv["source"] as string | undefined,
												"source",
												"text"
											),
											tlp: resolveFileToken(
												argv["tlp"] as string | undefined,
												"tlp",
												"text"
											),
										},
										[["data"]]
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
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							event_id: argv["event-id"],
							raw_id: argv["raw-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						data: parseJsonMap(argv["data"], "data"),
						source: resolveFileToken(
							argv["source"] as string | undefined,
							"source",
							"text"
						),
						tlp: resolveFileToken(
							argv["tlp"] as string | undefined,
							"tlp",
							"text"
						),
					},
					[["data"]]
				);
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						event_id: argv["event-id"],
						raw_id: argv["raw-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
