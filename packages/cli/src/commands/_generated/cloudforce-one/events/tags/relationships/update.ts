import operation from "../../../../_operations/cloudforce-one/events/tags/relationships/update.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/cloudforce-one.ts
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one events tags relationships update <rel-uuid>\n\nPartially updates a relationship by UUID. Requires datasetId query param."
		)
		.positional("rel-uuid", {
			type: "string",
			description: "Relationship UUID.",
			demandOption: true,
		})
		.option("tag-uuid", {
			type: "string",
			description: "Tag UUID.",
			demandOption: true,
		})
		.option("dataset-id", {
			type: "string",
			description: "Dataset UUID containing the relationship.",
			demandOption: true,
		})
		.option("confidence", {
			type: "number",
			description: "Updated confidence. null clears it.",
		})
		.option("type", {
			type: "string",
			description: "Updated relationship type.",
		})
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
	command: "update <rel-uuid>",
	describe: "Update a tag relationship",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one events tags relationships update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					datasetId: argv["dataset-id"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one events tags relationships update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/tags/${argv["tag-uuid"] == null ? "<tag-uuid>" : encodeURIComponent(String(argv["tag-uuid"]))}/relationships/${argv["rel-uuid"] == null ? "<rel-uuid>" : encodeURIComponent(String(argv["rel-uuid"]))}`,
						pathParams: {
							"tag-uuid": String(argv["tag-uuid"] ?? ""),
							"rel-uuid": String(argv["rel-uuid"] ?? ""),
						},
						query: queryParams,
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										confidence: argv["confidence"],
										type: resolveFileToken(
											argv["type"] as string | undefined,
											"type",
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
					const bodyData = parseBody(argv.body);
					const qs = new URLSearchParams(
						Object.entries(queryParams)
							.filter(([, v]) => v !== undefined)
							.map(([k, v]) => [k, String(v)])
					).toString();
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							tag_uuid: argv["tag-uuid"],
							rel_uuid: argv["rel-uuid"],
							...queryParams,
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					confidence: argv["confidence"],
					type: resolveFileToken(
						argv["type"] as string | undefined,
						"type",
						"text"
					),
				});
				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						tag_uuid: argv["tag-uuid"],
						rel_uuid: argv["rel-uuid"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
