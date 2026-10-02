import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
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
			"$0 cloudforce-one requests assets update <asset-id>\n\nUpdates an asset in a Cloudforce One intelligence request."
		)
		.positional("asset-id", {
			type: "string",
			description: "UUID.",
			demandOption: true,
		})
		.option("request-id", {
			type: "string",
			description: "UUID.",
			demandOption: true,
		})
		.option("source", { type: "string", description: "Asset file to upload." })
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

type Request = SdkRequest<"cloudforce-one-request-asset-update">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <asset-id>",
	describe: "Update a Request Asset",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one requests assets update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one requests assets update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/requests/${argv["request-id"] == null ? "<request-id>" : encodeURIComponent(String(argv["request-id"]))}/asset/${argv["asset-id"] == null ? "<asset-id>" : encodeURIComponent(String(argv["asset-id"]))}`,
						pathParams: {
							"request-id": String(argv["request-id"] ?? ""),
							"asset-id": String(argv["asset-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										source: resolveFileToken(
											argv["source"] as string | undefined,
											"source",
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
					const result = await withProgress(`Updating`, async () =>
						client.cloudforceOne.requests.assets.update({
							...bodyData,
							account_id: accountId,
							request_id: argv["request-id"],
							asset_id: argv["asset-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					source: resolveFileToken(
						argv["source"] as string | undefined,
						"source",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.cloudforceOne.requests.assets.update({
						...bodyData,
						account_id: accountId,
						request_id: argv["request-id"],
						asset_id: argv["asset-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
