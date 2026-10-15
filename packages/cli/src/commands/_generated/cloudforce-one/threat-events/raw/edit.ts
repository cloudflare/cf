import operation from "../../../_operations/cloudforce-one/threat-events/raw/edit.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * edit command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one threat-events raw edit <raw-id>\n\nPartially updates raw threat event data in Cloudforce One, modifying specific fields of the event."
		)
		.positional("raw-id", {
			type: "string",
			description: "Raw Event UUID.",
			demandOption: true,
		})
		.option("event-id", {
			type: "string",
			description: "Event UUID.",
			demandOption: true,
		})
		.option("data", {
			type: "string",
			description:
				"The data field. Provide as a JSON object or @path/to/file.json.",
		})
		.option("source", { type: "string", description: "The source field" })
		.option("tlp", { type: "string", description: "The tlp field" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <raw-id>",
	describe: "Updates a raw event",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-events raw edit",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-events raw edit",
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
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
};

export default command;
