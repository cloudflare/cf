import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * bulk-create command
 * @generated from apis/overlays/rum.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 rum rules bulk-create\n\nModifies one or more rules in a Web Analytics ruleset with a single request."
		)
		.option("ruleset-id", {
			type: "string",
			description: "The Web Analytics ruleset identifier.",
			demandOption: true,
		})
		.option("delete-rules", {
			type: "string",
			array: true,
			description: "A list of rule identifiers to delete.",
		})
		.option("rules", {
			type: "string",
			description:
				"A list of rules to create or update. Provide as a JSON array of objects or @path/to/file.json.",
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

type Request = SdkRequest<"web-analytics-modify-rules">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "bulk-create",
	describe: "Update Web Analytics rules",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "rum rules bulk-create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf rum rules bulk-create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/rum/v2/${argv["ruleset-id"] == null ? "<ruleset-id>" : encodeURIComponent(String(argv["ruleset-id"]))}/rules`,
						pathParams: { "ruleset-id": String(argv["ruleset-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										delete_rules: argv["delete-rules"],
										rules: parseObjectArray(argv["rules"], "rules"),
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
						client.rum.rules.bulkCreate({
							...bodyData,
							account_id: accountId,
							ruleset_id: argv["ruleset-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					delete_rules: argv["delete-rules"],
					rules: parseObjectArray(argv["rules"], "rules"),
				});
				const result = await withProgress(`Creating`, async () =>
					client.rum.rules.bulkCreate({
						...bodyData,
						account_id: accountId,
						ruleset_id: argv["ruleset-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
