import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust casb webhooks create\n\nCreates a new webhook configuration for sending finding notifications to external endpoints."
		)
		.option("authentication-type", {
			type: "string",
			description: "Type of authentication used for the webhook.",
			choices: [
				"Basic Auth",
				"None",
				"Bearer Auth",
				"Static Headers",
				"HMAC-Signing",
			],
		})
		.option("destination-url", {
			type: "string",
			description:
				"Target URL for the webhook configuration. Where resulting data will be sent.",
		})
		.option("headers", {
			type: "string",
			description:
				"List of custom headers to include in webhook requests. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("label", {
			type: "string",
			description:
				"Account-specified display label for the webhook configuration.",
		})
		.option("signing-secret", {
			type: "string",
			description:
				'Secret key used for HMAC signing when authentication_type is "HMAC-Signing".',
		})
		.option("status", {
			type: "string",
			description:
				"Status of the webhook configuration. Defaults to enabled when omitted.",
			choices: ["enabled", "disabled"],
			default: "enabled",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Request body for creating a new webhook configuration.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"CreateWebhook">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a new webhook configuration",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust casb webhooks create",
				classification: {
					safeFlags: ["authentication-type", "status", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun(
						{
							command: "cf zero-trust casb webhooks create",
							method: "POST",
							url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/data-security/posture/webhooks`,
							pathParams: {},
							bodyKind: "json",
							body:
								argv.body !== undefined
									? parseBody(argv.body)
									: compactBody({
											authentication_type: resolveFileToken(
												argv["authentication-type"] as string | undefined,
												"authentication-type",
												"text"
											),
											destination_url: resolveFileToken(
												argv["destination-url"] as string | undefined,
												"destination-url",
												"text"
											),
											headers: parseObjectArray(argv["headers"], "headers"),
											label: resolveFileToken(
												argv["label"] as string | undefined,
												"label",
												"text"
											),
											signing_secret: resolveFileToken(
												argv["signing-secret"] as string | undefined,
												"signing-secret",
												"text"
											),
											status: resolveFileToken(
												argv["status"] as string | undefined,
												"status",
												"text"
											),
										}),
						},
						{ sensitiveBodyPaths: [["signing_secret"]] }
					);
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.zeroTrust.casb.webhooks.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["authentication-type"] === undefined) {
					argv["authentication-type"] = await promptForRequiredEnumField(
						"authentication-type",
						"Type of authentication used for the webhook.",
						[
							"Basic Auth",
							"None",
							"Bearer Auth",
							"Static Headers",
							"HMAC-Signing",
						] as const
					);
				}
				if (argv["destination-url"] === undefined) {
					argv["destination-url"] = await promptForRequiredField(
						"destination-url",
						"Target URL for the webhook configuration. Where resulting data will be sent."
					);
				}
				if (argv["label"] === undefined) {
					argv["label"] = await promptForRequiredField(
						"label",
						"Account-specified display label for the webhook configuration."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					authentication_type: resolveFileToken(
						argv["authentication-type"] as string | undefined,
						"authentication-type",
						"text"
					),
					destination_url: resolveFileToken(
						argv["destination-url"] as string | undefined,
						"destination-url",
						"text"
					),
					headers: parseObjectArray(argv["headers"], "headers"),
					label: resolveFileToken(
						argv["label"] as string | undefined,
						"label",
						"text"
					),
					signing_secret: resolveFileToken(
						argv["signing-secret"] as string | undefined,
						"signing-secret",
						"text"
					),
					status: resolveFileToken(
						argv["status"] as string | undefined,
						"status",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.zeroTrust.casb.webhooks.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
