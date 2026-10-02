import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/queries.ts
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
			"$0 queries create\n\nReturn a success message after creating new saved string queries"
		)
		.option("id", { type: "string", description: "ID" })
		.option("max-time", { type: "string", description: "The max_time field" })
		.option("min-time", { type: "string", description: "The min_time field" })
		.option("scan", { type: "boolean", description: "The scan field" })
		.option("tag", { type: "string", description: "The tag field" })
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

type Request = SdkRequest<"postAccountsAccountIdBrandProtectionQueries">;
type Body = Request;
type Query = SdkQuery<"postAccountsAccountIdBrandProtectionQueries">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create new saved string queries",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "queries create",
				classification: {
					safeFlags: ["scan", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					id: argv["id"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf queries create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/brand-protection/queries`,
						pathParams: {},
						query: queryParams,
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										max_time: resolveFileToken(
											argv["max-time"] as string | undefined,
											"max-time",
											"text"
										),
										min_time: resolveFileToken(
											argv["min-time"] as string | undefined,
											"min-time",
											"text"
										),
										scan: argv["scan"],
										tag: resolveFileToken(
											argv["tag"] as string | undefined,
											"tag",
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
					const qs = new URLSearchParams(
						Object.entries(queryParams)
							.filter(([, v]) => v !== undefined)
							.map(([k, v]) => [k, String(v)])
					).toString();
					const result = await withProgress(`Creating`, async () =>
						client.queries.create({
							...bodyData,
							account_id: accountId,
							...queryParams,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					max_time: resolveFileToken(
						argv["max-time"] as string | undefined,
						"max-time",
						"text"
					),
					min_time: resolveFileToken(
						argv["min-time"] as string | undefined,
						"min-time",
						"text"
					),
					scan: argv["scan"],
					tag: resolveFileToken(
						argv["tag"] as string | undefined,
						"tag",
						"text"
					),
				});
				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const result = await withProgress(`Creating`, async () =>
					client.queries.create({
						...bodyData,
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
