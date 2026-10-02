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
 * evaluate command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			'$0 zero-trust casb webhooks evaluate\n\nSends a test webhook event to the specified destination URL to verify the webhook endpoint is reachable and properly configured. This allows customers to validate their webhook configuration before creating the actual webhook resource. The test payload includes: - event_type: "webhook.test" - timestamp: Current UTC timestamp - message: Test message indicating this is from Cloudflare CASB - data: Object with test: true'
		)
		.option("authentication-type", {
			type: "string",
			description:
				"Type of authentication to use for the test webhook request.",
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
			description: "Target URL to send the test webhook event to.",
		})
		.option("headers", {
			type: "string",
			description:
				"List of custom headers to include in the test webhook request. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("signing-secret", {
			type: "string",
			description:
				'Secret key used for HMAC signing when authentication_type is "HMAC-Signing".',
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Request body for testing a webhook configuration before creating it.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"EvaluateNewWebhook">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "evaluate",
	describe: "Test a webhook configuration before creating it",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust casb webhooks evaluate",
				classification: {
					safeFlags: ["authentication-type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun(
						{
							command: "cf zero-trust casb webhooks evaluate",
							method: "POST",
							url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/data-security/posture/webhooks/evaluate`,
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
											signing_secret: resolveFileToken(
												argv["signing-secret"] as string | undefined,
												"signing-secret",
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
						client.zeroTrust.casb.webhooks.evaluate({
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
						"Type of authentication to use for the test webhook request.",
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
						"Target URL to send the test webhook event to."
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
					signing_secret: resolveFileToken(
						argv["signing-secret"] as string | undefined,
						"signing-secret",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.zeroTrust.casb.webhooks.evaluate({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
