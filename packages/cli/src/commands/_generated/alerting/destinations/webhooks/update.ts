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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/alerting.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 alerting destinations webhooks update <webhook-id>\n\nUpdate a webhook destination."
		)
		.positional("webhook-id", {
			type: "string",
			description: "The unique identifier of a webhook",
			demandOption: true,
		})
		.option("name", {
			type: "string",
			description:
				"The name of the webhook destination. This will be included in the request body when you receive a webhook notification.",
		})
		.option("secret", {
			type: "string",
			description:
				"Optional secret that will be passed in the `cf-webhook-auth` header when dispatching generic webhook notifications or formatted for supported destinations. Secrets are not returned in any API response body.",
		})
		.option("url", {
			type: "string",
			description: "The POST endpoint to call when dispatching a notification.",
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

type Request = SdkRequest<"notification-webhooks-update-a-webhook">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <webhook-id>",
	describe: "Update a webhook",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "alerting destinations webhooks update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun(
						{
							command: "cf alerting destinations webhooks update",
							method: "PUT",
							url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/alerting/v3/destinations/webhooks/${argv["webhook-id"] == null ? "<webhook-id>" : encodeURIComponent(String(argv["webhook-id"]))}`,
							pathParams: { "webhook-id": String(argv["webhook-id"] ?? "") },
							bodyKind: "json",
							body:
								argv.body !== undefined
									? parseBody(argv.body)
									: compactBody({
											name: resolveFileToken(
												argv["name"] as string | undefined,
												"name",
												"text"
											),
											secret: resolveFileToken(
												argv["secret"] as string | undefined,
												"secret",
												"text"
											),
											url: resolveFileToken(
												argv["url"] as string | undefined,
												"url",
												"text"
											),
										}),
						},
						{ sensitiveBodyPaths: [["secret"]] }
					);
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.alerting.destinations.webhooks.update({
							...bodyData,
							account_id: accountId,
							webhook_id: argv["webhook-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"The name of the webhook destination. This will be included in the request body when you receive a webhook notification."
					);
				}
				if (argv["url"] === undefined) {
					argv["url"] = await promptForRequiredField(
						"url",
						"The POST endpoint to call when dispatching a notification."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					secret: resolveFileToken(
						argv["secret"] as string | undefined,
						"secret",
						"text"
					),
					url: resolveFileToken(
						argv["url"] as string | undefined,
						"url",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.alerting.destinations.webhooks.update({
						...bodyData,
						account_id: accountId,
						webhook_id: argv["webhook-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
