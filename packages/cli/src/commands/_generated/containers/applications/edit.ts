import operation from "../../_operations/containers/applications/edit.js";
/**
 * edit command
 * @generated from apis/overlays/containers.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "edit <application-id>",
	describe: "Modify an application",
	usage:
		"$0 containers applications edit <application-id>\n\nModifies a single application by id. Durable Object-managed application settings are published to runtime metadata without creating deployments or rollouts. Top-level `observability` for these applications supports only `logs.enabled`. The supported fields depend on the existing application's scheduling policy. For scheduler-backed applications, changes that replace instance deployment configuration, including the image, require a rollout.",
	flags: {
		"configuration-authorized-keys": {
			kind: "parsed",
			brief:
				'The configuration.authorized_keys field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"public_key": string, "name"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"configuration-wrangler-ssh-enabled": {
			kind: "boolean",
			brief: "The configuration.wrangler_ssh.enabled field",
			optional: true,
		},
		"configuration-wrangler-ssh-port": {
			kind: "parsed",
			brief: "The configuration.wrangler_ssh.port field",
			optional: true,
			parse: Number,
		},
		"constraints-jurisdiction": {
			kind: "parsed",
			brief:
				'Restricts placement to datacenters in the selected jurisdiction. Choose "eu", "fedramp", or "us". When combined with regions, EU supports EEUR and WEUR while FedRAMP and US support ENAM and WNAM.',
			optional: true,
			parse: String,
		},
		"constraints-regions": {
			kind: "parsed",
			brief: "The constraints.regions field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"max-instances": {
			kind: "parsed",
			brief:
				"Maximum number of instances that an autoscaling application can run.",
			optional: true,
			parse: Number,
		},
		"observability-logs-enabled": {
			kind: "boolean",
			brief: "The observability.logs.enabled field",
			optional: true,
		},
		"rollout-active-grace-period": {
			kind: "parsed",
			brief:
				"Grace period for active instances to stay alive before becoming eligible for shutdown signal due to a rollout, in seconds.\nDefaults to 0.\n",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"Request body for modifying a Containers application without replacing its instances. Durable Object-managed applications support only top-level observability.logs.enabled. The other fields apply to scheduler-backed applications, where deployment configuration changes such as image, resource allocation, command, and environment variables require an application rollout. ",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "application-id",
			brief: "An Application ID represents an identifier of an application.",
			parse: String,
		},
	],
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
				} satisfies ArgClassification<typeof argv>,
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
											authorized_keys: parseObjectArray(
												argv["configuration-authorized-keys"],
												"configuration-authorized-keys"
											),
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
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							application_id: argv["application-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					configuration: {
						authorized_keys: parseObjectArray(
							argv["configuration-authorized-keys"],
							"configuration-authorized-keys"
						),
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
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						application_id: argv["application-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
