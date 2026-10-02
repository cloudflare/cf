import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/realtime.ts
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
			"$0 realtime kit webhooks update <webhook-id>\n\nEdits the webhook details for the given webhook ID."
		)
		.positional("webhook-id", {
			type: "string",
			description: "ID of the webhook",
			demandOption: true,
		})
		.option("app-id", {
			type: "string",
			description: "The app identifier tag.",
			demandOption: true,
		})
		.option("enabled", { type: "boolean", description: "The enabled field" })
		.option("events", {
			type: "string",
			array: true,
			description: "Events that the webhook will get triggered by",
		})
		.option("name", { type: "string", description: "Name of the webhook" })
		.option("url", {
			type: "string",
			description: "URL the webhook will send events to",
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

type Request = SdkRequest<"editWebhook">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <webhook-id>",
	describe: "Edit a webhook",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "realtime kit webhooks update",
				classification: {
					safeFlags: ["enabled", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf realtime kit webhooks update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/realtime/kit/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/webhooks/${argv["webhook-id"] == null ? "<webhook-id>" : encodeURIComponent(String(argv["webhook-id"]))}`,
						pathParams: {
							"app-id": String(argv["app-id"] ?? ""),
							"webhook-id": String(argv["webhook-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										enabled: argv["enabled"],
										events: argv["events"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										url: resolveFileToken(
											argv["url"] as string | undefined,
											"url",
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
						client.realtime.kit.webhooks.update({
							...bodyData,
							account_id: accountId,
							app_id: argv["app-id"],
							webhook_id: argv["webhook-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					enabled: argv["enabled"],
					events: argv["events"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					url: resolveFileToken(
						argv["url"] as string | undefined,
						"url",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.realtime.kit.webhooks.update({
						...bodyData,
						account_id: accountId,
						app_id: argv["app-id"],
						webhook_id: argv["webhook-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
