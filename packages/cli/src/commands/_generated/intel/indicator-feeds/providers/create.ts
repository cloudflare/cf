import { createCommandClient } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/intel.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 intel indicator-feeds providers create <account-id-path>\n\nCreates a new indicator feed provider for an account. Only available to Intel accounts."
		)
		.positional("account-id-path", {
			type: "string",
			description: "Identifier",
			demandOption: true,
		})
		.option("account-id", {
			type: "number",
			description:
				"The numeric account ID to create the provider for. Distinct from the\npath `account_id` parameter, which carries the account identifier\nstring used for routing.\n",
		})
		.option("name", { type: "string", description: "The name of the provider" })
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

type Request = SdkRequest<"custom-indicator-feeds-create-provider">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <account-id-path>",
	describe: "Create indicator feed provider",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "intel indicator-feeds providers create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf intel indicator-feeds providers create",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${argv["account-id-path"] == null ? "<account-id-path>" : encodeURIComponent(String(argv["account-id-path"]))}/intel/indicator-feeds/permissions/createProvider`,
						pathParams: {
							"account-id-path": String(argv["account-id-path"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										account_id: argv["account-id"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.intel.indicatorFeeds.providers.create({
							...bodyData,
							account_id_path: argv["account-id-path"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["account-id"] === undefined) {
					throw new Error(
						"--account-id is required (or pass --body with this field set)."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"The name of the provider"
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					account_id: argv["account-id"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.intel.indicatorFeeds.providers.create({
						...bodyData,
						account_id_path: argv["account-id-path"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
