import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * cloudforceOneRequestList command
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
			"$0 cloudforce-one requests cloudforceOneRequestList\n\nLists Cloudforce One intelligence requests with filtering and pagination."
		)
		.option("completed-after", {
			type: "string",
			description: "Retrieve requests completed after this time.",
		})
		.option("completed-before", {
			type: "string",
			description: "Retrieve requests completed before this time.",
		})
		.option("created-after", {
			type: "string",
			description: "Retrieve requests created after this time.",
		})
		.option("created-before", {
			type: "string",
			description: "Retrieve requests created before this time.",
		})
		.option("page", { type: "number", description: "Page number of results." })
		.option("per-page", {
			type: "number",
			description: "Number of results per page.",
		})
		.option("request-type", {
			type: "string",
			description: "Requested information from request.",
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
		.coerce("sort-order", (value: string | undefined) =>
			resolveFileToken(value, "sort-order", "text")
		)
		.option("status", {
			type: "string",
			description: "Request Status.",
			choices: [
				"open",
				"accepted",
				"reported",
				"approved",
				"completed",
				"declined",
			],
		})
		.coerce("status", (value: string | undefined) =>
			resolveFileToken(value, "status", "text")
		)
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

type Request = SdkRequest<"cloudforce-one-request-list">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "cloudforceOneRequestList",
	describe: "List Requests",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one requests cloudforceOneRequestList",
				classification: {
					safeFlags: ["sort-order", "status", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one requests cloudforceOneRequestList",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/requests`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										completed_after: resolveFileToken(
											argv["completed-after"] as string | undefined,
											"completed-after",
											"text"
										),
										completed_before: resolveFileToken(
											argv["completed-before"] as string | undefined,
											"completed-before",
											"text"
										),
										created_after: resolveFileToken(
											argv["created-after"] as string | undefined,
											"created-after",
											"text"
										),
										created_before: resolveFileToken(
											argv["created-before"] as string | undefined,
											"created-before",
											"text"
										),
										page: argv["page"],
										per_page: argv["per-page"],
										request_type: resolveFileToken(
											argv["request-type"] as string | undefined,
											"request-type",
											"text"
										),
										sort_by: resolveFileToken(
											argv["sort-by"] as string | undefined,
											"sort-by",
											"text"
										),
										sort_order: argv["sort-order"],
										status: argv["status"],
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
						client.cloudforceOne.requests.cloudforceOneRequestList({
							...bodyData,
							account_id: accountId,
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
					completed_after: resolveFileToken(
						argv["completed-after"] as string | undefined,
						"completed-after",
						"text"
					),
					completed_before: resolveFileToken(
						argv["completed-before"] as string | undefined,
						"completed-before",
						"text"
					),
					created_after: resolveFileToken(
						argv["created-after"] as string | undefined,
						"created-after",
						"text"
					),
					created_before: resolveFileToken(
						argv["created-before"] as string | undefined,
						"created-before",
						"text"
					),
					page: argv["page"],
					per_page: argv["per-page"],
					request_type: resolveFileToken(
						argv["request-type"] as string | undefined,
						"request-type",
						"text"
					),
					sort_by: resolveFileToken(
						argv["sort-by"] as string | undefined,
						"sort-by",
						"text"
					),
					sort_order: argv["sort-order"],
					status: argv["status"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.cloudforceOne.requests.cloudforceOneRequestList({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
