import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/diagnostics.ts
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
			"$0 diagnostics endpoint-healthchecks update <id>\n\nUpdate a Endpoint Health Check."
		)
		.positional("id", {
			type: "string",
			description: "UUID.",
			demandOption: true,
		})
		.option("check-type", {
			type: "string",
			description: "type of check to perform",
			choices: ["icmp"],
		})
		.option("endpoint", {
			type: "string",
			description: "the IP address of the host to perform checks against",
		})
		.option("name", {
			type: "string",
			description: "Optional name associated with this check",
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

type Request = SdkRequest<"diagnostics-endpoint-healthcheck-update">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <id>",
	describe: "Update Endpoint Health Check",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "diagnostics endpoint-healthchecks update",
				classification: {
					safeFlags: ["check-type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf diagnostics endpoint-healthchecks update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/diagnostics/endpoint-healthchecks/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}`,
						pathParams: { id: String(argv["id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										check_type: resolveFileToken(
											argv["check-type"] as string | undefined,
											"check-type",
											"text"
										),
										endpoint: resolveFileToken(
											argv["endpoint"] as string | undefined,
											"endpoint",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
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
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.diagnostics.endpointHealthchecks.update({
							body: bodyData,
							account_id: accountId,
							id: argv["id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["check-type"] === undefined) {
					argv["check-type"] = await promptForRequiredEnumField(
						"check-type",
						"type of check to perform",
						["icmp"] as const
					);
				}
				if (argv["endpoint"] === undefined) {
					argv["endpoint"] = await promptForRequiredField(
						"endpoint",
						"the IP address of the host to perform checks against"
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					check_type: resolveFileToken(
						argv["check-type"] as string | undefined,
						"check-type",
						"text"
					),
					endpoint: resolveFileToken(
						argv["endpoint"] as string | undefined,
						"endpoint",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.diagnostics.endpointHealthchecks.update({
						body: bodyData,
						account_id: accountId,
						id: argv["id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
