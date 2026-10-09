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
			"$0 magic-cloud-networking cloud-integrations create\n\nCreate a new Cloud Integration (Closed Beta)."
		)
		.option("forwarded", {
			type: "string",
			description: "The forwarded header",
		})
		.option("cloud-type", {
			type: "string",
			description: "The cloud_type field",
			choices: ["AWS", "AZURE", "GOOGLE", "CLOUDFLARE"],
		})
		.coerce("cloud-type", (value) =>
			resolveFileToken(value, "cloud-type", "text")
		)
		.option("description", {
			type: "string",
			description: "The description field",
		})
		.option("friendly-name", {
			type: "string",
			description: "The friendly_name field",
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
	describe: "Create Cloud Integration",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-cloud-networking cloud-integrations create",
				classification: {
					safeFlags: ["cloud-type", "dry-run"],
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
						command: "cf magic-cloud-networking cloud-integrations create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/cloud/providers`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										cloud_type: argv["cloud-type"],
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										friendly_name: resolveFileToken(
											argv["friendly-name"] as string | undefined,
											"friendly-name",
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
							`/accounts/${accountId}/magic/cloud/providers`,
							{
								body: bodyData,
								headers: Object.keys(headers).length > 0 ? headers : undefined,
							}
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["cloud-type"] === undefined) {
					argv["cloud-type"] = await promptForRequiredEnumField(
						"cloud-type",
						"The cloud_type field",
						["AWS", "AZURE", "GOOGLE", "CLOUDFLARE"] as const
					);
				}
				if (argv["friendly-name"] === undefined) {
					argv["friendly-name"] = await promptForRequiredField(
						"friendly-name",
						"The friendly_name field"
					);
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["cloud-type"] !== undefined)
					setNestedValue(bodyData, ["cloud_type"], argv["cloud-type"]);
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
				if (argv["friendly-name"] !== undefined)
					setNestedValue(
						bodyData,
						["friendly_name"],
						resolveFileToken(
							argv["friendly-name"] as string | undefined,
							"friendly-name",
							"text"
						)
					);
				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/magic/cloud/providers`,
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
