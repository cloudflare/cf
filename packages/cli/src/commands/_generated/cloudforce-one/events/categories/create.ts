import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
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
			"$0 cloudforce-one events categories create <category-id>\n\nUpdates a category"
		)
		.positional("category-id", {
			type: "string",
			description: "Category UUID.",
			demandOption: true,
		})
		.option("kill-chain", {
			type: "number",
			description: "The killChain field",
		})
		.option("mitre-attack", {
			type: "string",
			array: true,
			description: "The mitreAttack field",
		})
		.option("mitre-capec", {
			type: "string",
			array: true,
			description: "The mitreCapec field",
		})
		.option("name", { type: "string", description: "The name field" })
		.option("shortname", { type: "string", description: "The shortname field" })
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

type Request = SdkRequest<"post_CategoryUpdate">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <category-id>",
	describe: "Updates a category",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one events categories create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one events categories create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/event-categories/by-id/${argv["category-id"] == null ? "<category-id>" : encodeURIComponent(String(argv["category-id"]))}`,
						pathParams: { "category-id": String(argv["category-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										killChain: argv["kill-chain"],
										mitreAttack: argv["mitre-attack"],
										mitreCapec: argv["mitre-capec"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										shortname: resolveFileToken(
											argv["shortname"] as string | undefined,
											"shortname",
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
						client.cloudforceOne.events.categories.create({
							...bodyData,
							account_id: accountId,
							category_id: argv["category-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					killChain: argv["kill-chain"],
					mitreAttack: argv["mitre-attack"],
					mitreCapec: argv["mitre-capec"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					shortname: resolveFileToken(
						argv["shortname"] as string | undefined,
						"shortname",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.cloudforceOne.events.categories.create({
						...bodyData,
						account_id: accountId,
						category_id: argv["category-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
