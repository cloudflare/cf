import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/observability.ts
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 observability issues automations update <automationId>\n\nReplace an issue automation configuration."
		)
		.positional("automation-id", {
			type: "string",
			description: "AutomationId",
			demandOption: true,
		})
		.option("after-inactivity-seconds", {
			type: "number",
			description: "The afterInactivitySeconds field",
		})
		.option("after-occurrences", {
			type: "number",
			description: "The afterOccurrences field",
		})
		.option("enabled", { type: "boolean", description: "The enabled field" })
		.option("name", { type: "string", description: "The name field" })
		.option("policy-id", { type: "string", description: "The policyId field" })
		.option("service", { type: "string", description: "The service field" })
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

type Request = SdkRequest<"issues.automations.update">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <automationId>",
	describe: "Update an issue automation",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "observability issues automations update",
				classification: {
					safeFlags: ["enabled", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf observability issues automations update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/observability/issues/automations/${argv["automation-id"] == null ? "<automation-id>" : encodeURIComponent(String(argv["automation-id"]))}`,
						pathParams: {
							"automation-id": String(argv["automation-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										afterInactivitySeconds: argv["after-inactivity-seconds"],
										afterOccurrences: argv["after-occurrences"],
										enabled: argv["enabled"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										policyId: resolveFileToken(
											argv["policy-id"] as string | undefined,
											"policy-id",
											"text"
										),
										service: resolveFileToken(
											argv["service"] as string | undefined,
											"service",
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
						client.observability.issues.automations.update({
							...bodyData,
							account_id: accountId,
							automationId: argv["automation-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["policy-id"] === undefined) {
					argv["policy-id"] = await promptForRequiredField(
						"policy-id",
						"The policyId field"
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					afterInactivitySeconds: argv["after-inactivity-seconds"],
					afterOccurrences: argv["after-occurrences"],
					enabled: argv["enabled"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					policyId: resolveFileToken(
						argv["policy-id"] as string | undefined,
						"policy-id",
						"text"
					),
					service: resolveFileToken(
						argv["service"] as string | undefined,
						"service",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.observability.issues.automations.update({
						...bodyData,
						account_id: accountId,
						automationId: argv["automation-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
