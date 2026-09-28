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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one events raw create <raw-id>\n\nUpdates a raw event"
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

type Request = SdkRequest<"post_EventRawUpdate">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <raw-id>",
	describe: "Updates a raw event",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one events raw create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one events raw create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/${argv["event-id"] == null ? "<event-id>" : encodeURIComponent(String(argv["event-id"]))}/raw/${argv["raw-id"] == null ? "<raw-id>" : encodeURIComponent(String(argv["raw-id"]))}`,
						pathParams: {
							"event-id": String(argv["event-id"] ?? ""),
							"raw-id": String(argv["raw-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
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
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.cloudforceOne.events.raw.create({
							...bodyData,
							account_id: accountId,
							event_id: argv["event-id"],
							raw_id: argv["raw-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
				});
				const result = await withProgress(`Creating`, async () =>
					client.cloudforceOne.events.raw.create({
						...bodyData,
						account_id: accountId,
						event_id: argv["event-id"],
						raw_id: argv["raw-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
