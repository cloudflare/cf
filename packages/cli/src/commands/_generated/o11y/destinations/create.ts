import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/o11y.ts
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 o11y destinations create\n\nCreate a new Workers Observability Telemetry Destination."
		)
		.option("configuration-type", {
			type: "string",
			description: "The configuration.type field",
			choices: ["logpush"],
		})
		.option("configuration-url", {
			type: "string",
			description: "The configuration.url field",
		})
		.option("enabled", { type: "boolean", description: "The enabled field" })
		.option("name", { type: "string", description: "The name field" })
		.option("skip-preflight-check", {
			type: "boolean",
			description: "The skipPreflightCheck field",
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

type Request = SdkRequest<"destination.create">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Destination",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "o11y destinations create",
				classification: {
					safeFlags: [
						"configuration-type",
						"enabled",
						"skip-preflight-check",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf o11y destinations create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/observability/destinations`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										configuration: {
											type: resolveFileToken(
												argv["configuration-type"] as string | undefined,
												"configuration-type",
												"text"
											),
											url: resolveFileToken(
												argv["configuration-url"] as string | undefined,
												"configuration-url",
												"text"
											),
										},
										enabled: argv["enabled"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										skipPreflightCheck: argv["skip-preflight-check"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.observability.destinations.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["configuration-type"] === undefined) {
					argv["configuration-type"] = await promptForRequiredEnumField(
						"configuration-type",
						"The configuration.type field",
						["logpush"] as const
					);
				}
				if (argv["configuration-url"] === undefined) {
					argv["configuration-url"] = await promptForRequiredField(
						"configuration-url",
						"The configuration.url field"
					);
				}
				if (argv["enabled"] === undefined) {
					throw new Error(
						"--enabled is required (or pass --body with this field set)."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField("name", "The name field");
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					configuration: {
						type: resolveFileToken(
							argv["configuration-type"] as string | undefined,
							"configuration-type",
							"text"
						),
						url: resolveFileToken(
							argv["configuration-url"] as string | undefined,
							"configuration-url",
							"text"
						),
					},
					enabled: argv["enabled"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					skipPreflightCheck: argv["skip-preflight-check"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.observability.destinations.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
