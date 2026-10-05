import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/rum.ts
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
			"$0 rum rules create <ruleset-id>\n\nCreates a new rule in a Web Analytics ruleset."
		)
		.positional("ruleset-id", {
			type: "string",
			description: "The Web Analytics ruleset identifier.",
			demandOption: true,
		})
		.option("host", { type: "string", description: "The host field" })
		.option("inclusive", {
			type: "boolean",
			description:
				"Whether the rule includes or excludes traffic from being measured.",
		})
		.option("is-paused", {
			type: "boolean",
			description: "Whether the rule is paused or not.",
		})
		.option("paths", {
			type: "string",
			array: true,
			description: "The paths field",
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

type Request = SdkRequest<"web-analytics-create-rule">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <ruleset-id>",
	describe: "Create a Web Analytics rule",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "rum rules create",
				classification: {
					safeFlags: ["inclusive", "is-paused", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf rum rules create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/rum/v2/${argv["ruleset-id"] == null ? "<ruleset-id>" : encodeURIComponent(String(argv["ruleset-id"]))}/rule`,
						pathParams: { "ruleset-id": String(argv["ruleset-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										host: resolveFileToken(
											argv["host"] as string | undefined,
											"host",
											"text"
										),
										inclusive: argv["inclusive"],
										is_paused: argv["is-paused"],
										paths: argv["paths"],
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
						client.rum.rules.create({
							body: bodyData,
							account_id: accountId,
							ruleset_id: argv["ruleset-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					host: resolveFileToken(
						argv["host"] as string | undefined,
						"host",
						"text"
					),
					inclusive: argv["inclusive"],
					is_paused: argv["is-paused"],
					paths: argv["paths"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.rum.rules.create({
						body: bodyData,
						account_id: accountId,
						ruleset_id: argv["ruleset-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
