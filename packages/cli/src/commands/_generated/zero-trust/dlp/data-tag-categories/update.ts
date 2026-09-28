import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
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
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust dlp data-tag-categories update <category-id>\n\nUpdates a data tag category and its tags."
		)
		.positional("category-id", {
			type: "string",
			description: "Category ID",
			demandOption: true,
		})
		.option("description", {
			type: "string",
			description: "The description field",
		})
		.option("name", { type: "string", description: "The name field" })
		.option("tags", {
			type: "string",
			description:
				"The desired final state of tags.\n- `None` (omitted): no tag changes.\n- `Some([])`: delete all tags.\n- `Some([...])`: desired final set + order. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Attributes of the data tag category to update.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"dlp-data-tag-categories-update">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <category-id>",
	describe: "Update the attributes of a single data tag category.",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dlp data-tag-categories update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dlp data-tag-categories update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dlp/data_tag_categories/${argv["category-id"] == null ? "<category-id>" : encodeURIComponent(String(argv["category-id"]))}`,
						pathParams: { "category-id": String(argv["category-id"] ?? "") },
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
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										tags: parseObjectArray(argv["tags"], "tags"),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.zeroTrust.dlp.dataTagCategories.update({
							...bodyData,
							account_id: accountId,
							category_id: argv["category-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					tags: parseObjectArray(argv["tags"], "tags"),
				});
				const result = await withProgress(`Updating`, async () =>
					client.zeroTrust.dlp.dataTagCategories.update({
						...bodyData,
						account_id: accountId,
						category_id: argv["category-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
