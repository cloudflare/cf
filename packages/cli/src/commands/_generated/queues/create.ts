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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/queues.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 queues create\n\nCreates a Queue in the account.")
		.option("jurisdiction", {
			type: "string",
			description: "The jurisdiction field",
			choices: ["eu", "us", "fedramp"],
		})
		.option("queue-name", {
			type: "string",
			description: "The queue_name field",
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

type Request = SdkRequest<"queues-create">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Queue",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "queues create",
				classification: {
					safeFlags: ["jurisdiction", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf queues create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/queues`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										jurisdiction: resolveFileToken(
											argv["jurisdiction"] as string | undefined,
											"jurisdiction",
											"text"
										),
										queue_name: resolveFileToken(
											argv["queue-name"] as string | undefined,
											"queue-name",
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
						client.queues.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["queue-name"] === undefined) {
					argv["queue-name"] = await promptForRequiredField(
						"queue-name",
						"The queue_name field"
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					jurisdiction: resolveFileToken(
						argv["jurisdiction"] as string | undefined,
						"jurisdiction",
						"text"
					),
					queue_name: resolveFileToken(
						argv["queue-name"] as string | undefined,
						"queue-name",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.queues.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
