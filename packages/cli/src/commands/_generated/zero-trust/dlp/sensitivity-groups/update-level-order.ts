import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update-level-order command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust dlp sensitivity-groups update-level-order <sensitivity-group-id>\n\nUpdates the order of sensitivity levels in a group."
		)
		.positional("sensitivity-group-id", {
			type: "string",
			description: "Sensitivity group ID",
			demandOption: true,
		})
		.option("level-ids", {
			type: "string",
			array: true,
			description: "The level_ids field",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Desired ordered list of level IDs.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"dlp-sensitivity-groups-put-level-order">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update-level-order <sensitivity-group-id>",
	describe: "Set the ordering of levels within a sensitivity group.",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dlp sensitivity-groups update-level-order",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dlp sensitivity-groups update-level-order",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dlp/sensitivity_groups/${argv["sensitivity-group-id"] == null ? "<sensitivity-group-id>" : encodeURIComponent(String(argv["sensitivity-group-id"]))}/level_order`,
						pathParams: {
							"sensitivity-group-id": String(
								argv["sensitivity-group-id"] ?? ""
							),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										level_ids: argv["level-ids"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.zeroTrust.dlp.sensitivityGroups.updateLevelOrder({
							body: bodyData,
							account_id: accountId,
							sensitivity_group_id: argv["sensitivity-group-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["level-ids"] === undefined) {
					throw new Error(
						"--level-ids is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					level_ids: argv["level-ids"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.zeroTrust.dlp.sensitivityGroups.updateLevelOrder({
						body: bodyData,
						account_id: accountId,
						sensitivity_group_id: argv["sensitivity-group-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
