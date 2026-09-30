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
 * create command
 * @generated from apis/overlays/ai-gateway.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 ai-gateway custom-providers create\n\nCreates an account-level custom provider that forwards AI Gateway requests to the HTTPS base URL you supply. Requests reference the provider as `custom-{slug}`, so the slug must be unique within the account."
		)
		.option("base-url", { type: "string", description: "The base_url field" })
		.option("beta", { type: "boolean", description: "The beta field" })
		.option("curl-example", {
			type: "string",
			description: "The curl_example field",
		})
		.option("description", {
			type: "string",
			description: "The description field",
		})
		.option("enable", { type: "boolean", description: "The enable field" })
		.option("headers", {
			type: "string",
			description:
				"JSON object of extra HTTP headers that AI Gateway sends to the provider. Values can contain credentials.",
		})
		.option("js-example", {
			type: "string",
			description: "The js_example field",
		})
		.option("link", { type: "string", description: "The link field" })
		.option("name", { type: "string", description: "The name field" })
		.option("position", { type: "number", description: "The position field" })
		.option("slug", { type: "string", description: "The slug field" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("show-secrets", {
			type: "boolean",
			description: "Show sensitive values in dry-run output",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"aig-config-create-account-provider">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a custom provider",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-gateway custom-providers create",
				classification: {
					safeFlags: ["beta", "enable", "dry-run", "show-secrets"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun(
						{
							command: "cf ai-gateway custom-providers create",
							method: "POST",
							url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-gateway/custom-providers`,
							pathParams: {},
							bodyKind: "json",
							body:
								argv.body !== undefined
									? parseBody(argv.body)
									: compactBody({
											base_url: resolveFileToken(
												argv["base-url"] as string | undefined,
												"base-url",
												"text"
											),
											beta: argv["beta"],
											curl_example: resolveFileToken(
												argv["curl-example"] as string | undefined,
												"curl-example",
												"text"
											),
											description: resolveFileToken(
												argv["description"] as string | undefined,
												"description",
												"text"
											),
											enable: argv["enable"],
											headers: resolveFileToken(
												argv["headers"] as string | undefined,
												"headers",
												"text"
											),
											js_example: resolveFileToken(
												argv["js-example"] as string | undefined,
												"js-example",
												"text"
											),
											link: resolveFileToken(
												argv["link"] as string | undefined,
												"link",
												"text"
											),
											name: resolveFileToken(
												argv["name"] as string | undefined,
												"name",
												"text"
											),
											position: argv["position"],
											slug: resolveFileToken(
												argv["slug"] as string | undefined,
												"slug",
												"text"
											),
										}),
						},
						{ sensitiveBodyPaths: [["headers"]], showSecrets: argv.showSecrets }
					);
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.aiGateway.customProviders.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["base-url"] === undefined) {
					argv["base-url"] = await promptForRequiredField(
						"base-url",
						"The base_url field"
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField("name", "The name field");
				}
				if (argv["slug"] === undefined) {
					argv["slug"] = await promptForRequiredField("slug", "The slug field");
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					base_url: resolveFileToken(
						argv["base-url"] as string | undefined,
						"base-url",
						"text"
					),
					beta: argv["beta"],
					curl_example: resolveFileToken(
						argv["curl-example"] as string | undefined,
						"curl-example",
						"text"
					),
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					enable: argv["enable"],
					headers: resolveFileToken(
						argv["headers"] as string | undefined,
						"headers",
						"text"
					),
					js_example: resolveFileToken(
						argv["js-example"] as string | undefined,
						"js-example",
						"text"
					),
					link: resolveFileToken(
						argv["link"] as string | undefined,
						"link",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					position: argv["position"],
					slug: resolveFileToken(
						argv["slug"] as string | undefined,
						"slug",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.aiGateway.customProviders.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
