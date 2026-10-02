import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
 * @generated from apis/overlays/magic-cloud-networking.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, setNestedValue } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 magic-cloud-networking catalog-syncs create\n\nCreate a new Catalog Sync (Closed Beta)."
		)
		.option("forwarded", {
			type: "string",
			description: "The forwarded header",
		})
		.option("description", {
			type: "string",
			description: "The description field",
		})
		.option("destination-type", {
			type: "string",
			description: "The destination_type field",
			choices: ["NONE", "ZERO_TRUST_LIST"],
		})
		.option("name", { type: "string", description: "The name field" })
		.option("policy", { type: "string", description: "The policy field" })
		.option("update-mode", {
			type: "string",
			description: "The update_mode field",
			choices: ["AUTO", "MANUAL"],
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

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Catalog Sync",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-cloud-networking catalog-syncs create",
				classification: {
					safeFlags: ["destination-type", "update-mode", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const headers: Record<string, string> = {};
				if (argv["forwarded"] !== undefined)
					headers["forwarded"] = String(argv["forwarded"]);
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-cloud-networking catalog-syncs create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/cloud/catalog-syncs`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										destination_type: resolveFileToken(
											argv["destination-type"] as string | undefined,
											"destination-type",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										policy: resolveFileToken(
											argv["policy"] as string | undefined,
											"policy",
											"text"
										),
										update_mode: resolveFileToken(
											argv["update-mode"] as string | undefined,
											"update-mode",
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
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/magic/cloud/catalog-syncs`,
							{
								body: bodyData,
								headers: Object.keys(headers).length > 0 ? headers : undefined,
							}
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["destination-type"] === undefined) {
					argv["destination-type"] = await promptForRequiredEnumField(
						"destination-type",
						"The destination_type field",
						["NONE", "ZERO_TRUST_LIST"] as const
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField("name", "The name field");
				}
				if (argv["update-mode"] === undefined) {
					argv["update-mode"] = await promptForRequiredEnumField(
						"update-mode",
						"The update_mode field",
						["AUTO", "MANUAL"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["description"] !== undefined)
					setNestedValue(
						bodyData,
						["description"],
						resolveFileToken(
							argv["description"] as string | undefined,
							"description",
							"text"
						)
					);
				if (argv["destination-type"] !== undefined)
					setNestedValue(
						bodyData,
						["destination_type"],
						resolveFileToken(
							argv["destination-type"] as string | undefined,
							"destination-type",
							"text"
						)
					);
				if (argv["name"] !== undefined)
					setNestedValue(
						bodyData,
						["name"],
						resolveFileToken(argv["name"] as string | undefined, "name", "text")
					);
				if (argv["policy"] !== undefined)
					setNestedValue(
						bodyData,
						["policy"],
						resolveFileToken(
							argv["policy"] as string | undefined,
							"policy",
							"text"
						)
					);
				if (argv["update-mode"] !== undefined)
					setNestedValue(
						bodyData,
						["update_mode"],
						resolveFileToken(
							argv["update-mode"] as string | undefined,
							"update-mode",
							"text"
						)
					);
				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/magic/cloud/catalog-syncs`,
						{
							body: Object.keys(bodyData).length > 0 ? bodyData : undefined,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
