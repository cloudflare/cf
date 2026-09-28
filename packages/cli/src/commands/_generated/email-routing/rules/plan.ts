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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * plan command
 * @generated from apis/overlays/email-routing.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 email-routing rules plan\n\nComputes the Email Routing rule changes that would be needed to reconcile a Wrangler-managed desired ruleset. This endpoint is read-only and does not create, update, or delete rules."
		)
		.option("catch-all-rules", {
			type: "string",
			description:
				"Desired catch-all Email Routing rules managed by the deploying Worker. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("owner-worker-tag", {
			type: "string",
			description:
				"Public tag (script_tag) of the Worker that owns this rule. Required when\n`source` is `wrangler`.\n",
		})
		.option("rules", {
			type: "string",
			description:
				"Desired normal Email Routing rules managed by the deploying Worker. Provide as a JSON array of objects or @path/to/file.json.",
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

type Request =
	SdkRequest<"email-routing-routing-rules-plan-account-routing-rules">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "plan",
	describe: "Plan account routing rule changes",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-routing rules plan",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-routing rules plan",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email/routing/rules/plan`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										catch_all_rules: parseObjectArray(
											argv["catch-all-rules"],
											"catch-all-rules"
										),
										owner_worker_tag: resolveFileToken(
											argv["owner-worker-tag"] as string | undefined,
											"owner-worker-tag",
											"text"
										),
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
						client.emailRouting.rules.plan({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["owner-worker-tag"] === undefined) {
					argv["owner-worker-tag"] = await promptForRequiredField(
						"owner-worker-tag",
						"Public tag (script_tag) of the Worker that owns this rule. Required when \`source\` is \`wrangler\`. "
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					catch_all_rules: parseObjectArray(
						argv["catch-all-rules"],
						"catch-all-rules"
					),
					owner_worker_tag: resolveFileToken(
						argv["owner-worker-tag"] as string | undefined,
						"owner-worker-tag",
						"text"
					),
					rules: parseObjectArray(argv["rules"], "rules"),
				});
				const result = await withProgress(`Creating`, async () =>
					client.emailRouting.rules.plan({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
