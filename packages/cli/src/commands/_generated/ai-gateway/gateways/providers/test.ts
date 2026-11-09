import operation from "../../../_operations/ai-gateway/gateways/providers/test.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * test command
 * @generated from apis/overlays/ai-gateway.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 ai-gateway gateways providers test <id>\n\nChecks whether stored credentials can list models through the provider implementation in AI Gateway. Requires AI Gateway content update permission. Does not run inference, check credits or inference permissions, or return provider response bodies. HTTP 401 from the model-list request is classified as invalid, as is AWS Bedrock HTTP 403 with an UnrecognizedClientException error type. Other failures are inconclusive, including other HTTP 400 or 403 responses; a 403 alone does not distinguish rejected credentials from insufficient permissions. Unsupported providers or credential formats also return an inconclusive result."
		)
		.positional("id", {
			type: "string",
			description: "ID",
			demandOption: true,
		})
		.option("gateway-id", {
			type: "string",
			description: "Unique identifier of the AI Gateway within the account.",
			demandOption: true,
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
	command: "test <id>",
	describe: "Check stored provider credentials",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-gateway gateways providers test",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai-gateway gateways providers test",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-gateway/gateways/${argv["gateway-id"] == null ? "<gateway-id>" : encodeURIComponent(String(argv["gateway-id"]))}/provider_configs/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}/test`,
						pathParams: {
							"gateway-id": String(argv["gateway-id"] ?? ""),
							id: String(argv["id"] ?? ""),
						},
						bodyKind: "json",
						body: argv.body !== undefined ? parseBody(argv.body) : undefined,
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							gateway_id: argv["gateway-id"],
							id: argv["id"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/ai-gateway/gateways/${encodeURIComponent(String(argv["gateway-id"]))}/provider_configs/${encodeURIComponent(String(argv["id"]))}/test`
					)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
