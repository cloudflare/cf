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
 * get command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one requests message get <request-id>\n\nLists messages in a Cloudforce One intelligence request conversation."
		)
		.positional("request-id", {
			type: "string",
			description: "UUID.",
			demandOption: true,
		})
		.option("page", { type: "number", description: "Page number of results." })
		.option("per-page", {
			type: "number",
			description: "Number of results per page.",
		})
		.option("sort-by", {
			type: "string",
			description: "Field to sort results by.",
		})
		.option("sort-order", {
			type: "string",
			description: "Sort order (asc or desc).",
			choices: ["asc", "desc"],
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

type Request = SdkRequest<"cloudforce-one-request-message-list">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <request-id>",
	describe: "List Request Messages",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one requests message get",
				classification: {
					safeFlags: ["sort-order", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one requests message get",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/requests/${argv["request-id"] == null ? "<request-id>" : encodeURIComponent(String(argv["request-id"]))}/message`,
						pathParams: { "request-id": String(argv["request-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										page: argv["page"],
										per_page: argv["per-page"],
										sort_by: resolveFileToken(
											argv["sort-by"] as string | undefined,
											"sort-by",
											"text"
										),
										sort_order: resolveFileToken(
											argv["sort-order"] as string | undefined,
											"sort-order",
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
						client.cloudforceOne.requests.message.get({
							...bodyData,
							account_id: accountId,
							request_id: argv["request-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["page"] === undefined) {
					throw new Error(
						"--page is required (or pass --body with this field set)."
					);
				}
				if (argv["per-page"] === undefined) {
					throw new Error(
						"--per-page is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					page: argv["page"],
					per_page: argv["per-page"],
					sort_by: resolveFileToken(
						argv["sort-by"] as string | undefined,
						"sort-by",
						"text"
					),
					sort_order: resolveFileToken(
						argv["sort-order"] as string | undefined,
						"sort-order",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.cloudforceOne.requests.message.get({
						...bodyData,
						account_id: accountId,
						request_id: argv["request-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
