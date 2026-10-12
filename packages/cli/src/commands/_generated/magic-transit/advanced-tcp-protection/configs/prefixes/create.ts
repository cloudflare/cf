import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/magic-transit.ts
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
			"$0 magic-transit advanced-tcp-protection configs prefixes create\n\nCreate a prefix for an account."
		)
		.option("comment", {
			type: "string",
			description: "A comment describing the prefix.",
		})
		.option("excluded", {
			type: "boolean",
			description: "Whether to exclude the prefix from protection.",
		})
		.option("prefix", {
			type: "string",
			description: "The prefix to add in CIDR format.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "The new prefix to create.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"createPrefix">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create prefix.",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command:
					"magic-transit advanced-tcp-protection configs prefixes create",
				classification: {
					safeFlags: ["excluded", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf magic-transit advanced-tcp-protection configs prefixes create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/advanced_tcp_protection/configs/prefixes`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										comment: resolveFileToken(
											argv["comment"] as string | undefined,
											"comment",
											"text"
										),
										excluded: argv["excluded"],
										prefix: resolveFileToken(
											argv["prefix"] as string | undefined,
											"prefix",
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
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.magicTransit.advancedTcpProtection.configs.prefixes.create({
							body: bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["comment"] === undefined) {
					argv["comment"] = await promptForRequiredField(
						"comment",
						"A comment describing the prefix."
					);
				}
				if (argv["excluded"] === undefined) {
					throw new Error(
						"--excluded is required (or pass --body with this field set)."
					);
				}
				if (argv["prefix"] === undefined) {
					argv["prefix"] = await promptForRequiredField(
						"prefix",
						"The prefix to add in CIDR format."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					comment: resolveFileToken(
						argv["comment"] as string | undefined,
						"comment",
						"text"
					),
					excluded: argv["excluded"],
					prefix: resolveFileToken(
						argv["prefix"] as string | undefined,
						"prefix",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.magicTransit.advancedTcpProtection.configs.prefixes.create({
						body: bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
