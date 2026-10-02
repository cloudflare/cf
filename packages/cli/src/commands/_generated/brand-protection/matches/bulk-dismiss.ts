import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
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
			"$0 brand-protection matches bulk-dismiss\n\nDismiss or undismiss multiple matches in a single request. Accepts either the new format (matches: [{query_id, domain_id}]) for per-query control, or the legacy format (match_ids: [number]) which dismisses for all queries sharing each match's hash. Returns per-item success/error results."
		)
		.option("action", {
			type: "string",
			description: "The action field",
			choices: ["dismiss", "undismiss"],
		})
		.option("match-ids", {
			type: "string",
			array: true,
			description: "The match_ids field",
		})
		.option("matches", {
			type: "string",
			description:
				"The matches field. Provide as a JSON array of objects or @path/to/file.json.",
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

type Request = SdkRequest<"post_BulkDismissMatches">;
type Body = Request;

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
										action: resolveFileToken(
											argv["action"] as string | undefined,
											"action",
											"text"
										),
										match_ids: argv["match-ids"],
										matches: parseObjectArray(argv["matches"], "matches"),
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
						client.brandProtection.matches.bulkDismiss({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["action"] === undefined) {
					argv["action"] = await promptForRequiredEnumField(
						"action",
						"The action field",
						["dismiss", "undismiss"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					action: resolveFileToken(
						argv["action"] as string | undefined,
						"action",
						"text"
					),
					match_ids: argv["match-ids"],
					matches: parseObjectArray(argv["matches"], "matches"),
				});
				const result = await withProgress(`Creating`, async () =>
					client.brandProtection.matches.bulkDismiss({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
