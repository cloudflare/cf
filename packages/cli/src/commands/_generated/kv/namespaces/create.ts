import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/kv.ts
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 kv namespaces create\n\nCreates a Workers KV namespace in the specified account with the given title. Returns `400` if the account already owns a namespace with that title; an existing namespace must be explicitly deleted before it can be replaced. An optional jurisdiction restricts where data is durably stored and can only be set at creation time."
		)
		.option("jurisdiction", {
			type: "string",
			description:
				"Specify the jurisdiction to restrict the KV namespace to durably store data within. Can only be set at namespace creation time.",
			choices: ["eu", "fedramp", "us"],
		})
		.option("namespace-mode", {
			type: "string",
			description:
				"The mode of the Workers KV namespace. Specify `instant` when creating a namespace to create a KV Instant namespace. Omit this field when creating a namespace to create a classic namespace. Currently, `instant` is the only supported explicit value.",
			choices: ["instant"],
		})
		.option("title", {
			type: "string",
			description: "Human-readable string name for a Workers KV namespace.",
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

type Request = SdkRequest<"workers-kv-namespace-create-a-namespace">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a namespace",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "kv namespaces create",
				classification: {
					safeFlags: ["jurisdiction", "namespace-mode", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf kv namespaces create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/storage/kv/namespaces`,
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
										mode: resolveFileToken(
											argv["namespace-mode"] as string | undefined,
											"namespace-mode",
											"text"
										),
										title: resolveFileToken(
											argv["title"] as string | undefined,
											"title",
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
						client.kv.namespaces.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["title"] === undefined) {
					argv["title"] = await promptForRequiredField(
						"title",
						"Human-readable string name for a Workers KV namespace."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					jurisdiction: resolveFileToken(
						argv["jurisdiction"] as string | undefined,
						"jurisdiction",
						"text"
					),
					mode: resolveFileToken(
						argv["namespace-mode"] as string | undefined,
						"namespace-mode",
						"text"
					),
					title: resolveFileToken(
						argv["title"] as string | undefined,
						"title",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.kv.namespaces.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
