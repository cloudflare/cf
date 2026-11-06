import operation from "../../_operations/brand-protection/matches/bulk-dismiss.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * bulk-dismiss command
 * @generated from apis/overlays/brand-protection.ts
 */
import type { Argv, CommandModule } from "yargs";
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
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 brand-protection matches bulk-dismiss\n\nDismisses or undismisses up to 100 domain matches in one request and returns a result for each item. Send `matches` as (`query_id`, `domain_id`) pairs to change each match for one query. The legacy `match_ids` format is still accepted, but it changes each match for every query that shares it; prefer `matches`."
		)
		.option("action", {
			type: "string",
			description:
				"`dismiss` to dismiss the matches, or `undismiss` to restore them.",
			choices: ["dismiss", "undismiss"],
		})
		.coerce("action", (value) => resolveFileToken(value, "action", "text"))
		.option("match-ids", {
			type: "string",
			array: true,
			description:
				"Legacy format; prefer `matches`. Match IDs to update. Each ID changes the match for every query that shares it, not just one query. 1 to 100 items; duplicate IDs are rejected.",
		})
		.option("matches", {
			type: "string",
			description:
				'Matches to update, as (`query_id`, `domain_id`) pairs. Each pair changes the match for that query only. 1 to 100 items; duplicate pairs are rejected. Send only one format. If both are supplied, `match_ids` takes precedence and `matches` is ignored. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"domain_id": number, "query_id": number}].',
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
	command: "bulk-dismiss",
	describe: "Bulk dismiss or undismiss matches",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "brand-protection matches bulk-dismiss",
				classification: {
					safeFlags: ["action", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf brand-protection matches bulk-dismiss",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/brand-protection/domain/matches/bulk-dismiss`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										action: argv["action"],
										match_ids: argv["match-ids"],
										matches: parseObjectArray(argv["matches"], "matches"),
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
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["action"] === undefined) {
					argv["action"] = await promptForRequiredEnumField(
						"action",
						"\`dismiss\` to dismiss the matches, or \`undismiss\` to restore them.",
						["dismiss", "undismiss"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					action: argv["action"],
					match_ids: argv["match-ids"],
					matches: parseObjectArray(argv["matches"], "matches"),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
