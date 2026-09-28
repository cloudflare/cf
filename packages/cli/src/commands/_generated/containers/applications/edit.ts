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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/containers.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 containers applications edit <application-id>\n\nModifies a single application by id. Durable Object-managed application settings are published to runtime metadata without creating deployments or rollouts. Top-level `observability` for these applications supports only `logs.enabled`. The supported fields depend on the existing application's scheduling policy. For scheduler-backed applications, changes that replace instance deployment configuration, including the image, require a rollout."
		)
		.positional("application-id", {
			type: "string",
			description:
				"An Application ID represents an identifier of an application.",
			demandOption: true,
		})
		.option("configuration-wrangler-ssh-enabled", {
			type: "boolean",
			description: "The configuration.wrangler_ssh.enabled field",
		})
		.option("configuration-wrangler-ssh-port", {
			type: "number",
			description: "The configuration.wrangler_ssh.port field",
		})
		.option("constraints-jurisdiction", {
			type: "string",
			description:
				'Restricts placement to datacenters in the selected jurisdiction. Choose "eu", "fedramp", or "us". When combined with regions, EU supports EEUR and WEUR while FedRAMP and US support ENAM and WNAM.',
		})
		.option("constraints-regions", {
			type: "string",
			array: true,
			description: "The constraints.regions field",
		})
		.option("max-instances", {
			type: "number",
			description:
				"Maximum number of instances that an autoscaling application can run.",
		})
		.option("observability-logs-enabled", {
			type: "boolean",
			description: "The observability.logs.enabled field",
		})
		.option("rollout-active-grace-period", {
			type: "number",
			description:
				"Grace period for active instances to stay alive before becoming eligible for shutdown signal due to a rollout, in seconds.\nDefaults to 0.\n",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Request body for modifying a Containers application without replacing its instances. Durable Object-managed applications support only top-level observability.logs.enabled. The other fields apply to scheduler-backed applications, where deployment configuration changes such as image, resource allocation, command, and environment variables require an application rollout. ",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"modifyApplication">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <application-id>",
	describe: "Modify an application",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "containers applications edit",
				classification: {
					safeFlags: [
						"configuration-wrangler-ssh-enabled",
						"observability-logs-enabled",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf containers applications edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/containers/applications/${argv["application-id"] == null ? "<application-id>" : encodeURIComponent(String(argv["application-id"]))}`,
						pathParams: {
							"application-id": String(argv["application-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										configuration: {
											wrangler_ssh: {
												enabled: argv["configuration-wrangler-ssh-enabled"],
												port: argv["configuration-wrangler-ssh-port"],
											},
										},
										constraints: {
											jurisdiction: resolveFileToken(
												argv["constraints-jurisdiction"] as string | undefined,
												"constraints-jurisdiction",
												"text"
											),
											regions: argv["constraints-regions"],
										},
										max_instances: argv["max-instances"],
										observability: {
											logs: {
												enabled: argv["observability-logs-enabled"],
											},
										},
										rollout_active_grace_period:
											argv["rollout-active-grace-period"],
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
						client.containers.applications.edit({
							...bodyData,
							account_id: accountId,
							application_id: argv["application-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					configuration: {
						wrangler_ssh: {
							enabled: argv["configuration-wrangler-ssh-enabled"],
							port: argv["configuration-wrangler-ssh-port"],
						},
					},
					constraints: {
						jurisdiction: resolveFileToken(
							argv["constraints-jurisdiction"] as string | undefined,
							"constraints-jurisdiction",
							"text"
						),
						regions: argv["constraints-regions"],
					},
					max_instances: argv["max-instances"],
					observability: {
						logs: {
							enabled: argv["observability-logs-enabled"],
						},
					},
					rollout_active_grace_period: argv["rollout-active-grace-period"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.containers.applications.edit({
						...bodyData,
						account_id: accountId,
						application_id: argv["application-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
