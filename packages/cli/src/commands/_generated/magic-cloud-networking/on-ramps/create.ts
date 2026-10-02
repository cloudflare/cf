import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
 * @generated from apis/overlays/magic-cloud-networking.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, setNestedValue } from "#lib/body-parser.js";
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
			"$0 magic-cloud-networking on-ramps create\n\nCreate a new On-ramp (Closed Beta)."
		)
		.option("forwarded", {
			type: "string",
			description: "The forwarded header",
		})
		.option("adopted-hub-id", {
			type: "string",
			description: "The adopted_hub_id field",
		})
		.option("attached-hubs", {
			type: "string",
			array: true,
			description: "The attached_hubs field",
		})
		.option("attached-vpcs", {
			type: "string",
			array: true,
			description: "The attached_vpcs field",
		})
		.option("cloud-asn", {
			type: "number",
			description:
				"Sets the cloud-side ASN. If unset or zero, the cloud's default ASN takes effect.",
		})
		.option("cloud-type", {
			type: "string",
			description: "The cloud_type field",
			choices: ["AWS", "AZURE", "GOOGLE"],
		})
		.option("description", {
			type: "string",
			description: "The description field",
		})
		.option("dynamic-routing", {
			type: "boolean",
			description:
				"Enables BGP routing. When enabling this feature, set both install_routes_in_cloud and install_routes_in_magic_wan to false.",
		})
		.option("hub-provider-id", {
			type: "string",
			description: "The hub_provider_id field",
		})
		.option("install-routes-in-cloud", {
			type: "boolean",
			description: "The install_routes_in_cloud field",
		})
		.option("install-routes-in-magic-wan", {
			type: "boolean",
			description: "The install_routes_in_magic_wan field",
		})
		.option("manage-hub-to-hub-attachments", {
			type: "boolean",
			description: "The manage_hub_to_hub_attachments field",
		})
		.option("manage-vpc-to-hub-attachments", {
			type: "boolean",
			description: "The manage_vpc_to_hub_attachments field",
		})
		.option("name", { type: "string", description: "The name field" })
		.option("region", { type: "string", description: "The region field" })
		.option("type", {
			type: "string",
			description: "The type field",
			choices: ["OnrampTypeSingle", "OnrampTypeHub"],
		})
		.option("vpc", { type: "string", description: "The vpc field" })
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

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create On-ramp",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-cloud-networking on-ramps create",
				classification: {
					safeFlags: [
						"cloud-type",
						"dynamic-routing",
						"install-routes-in-cloud",
						"install-routes-in-magic-wan",
						"manage-hub-to-hub-attachments",
						"manage-vpc-to-hub-attachments",
						"type",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const headers: Record<string, string> = {};
				if (argv["forwarded"] !== undefined)
					headers["forwarded"] = String(argv["forwarded"]);
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-cloud-networking on-ramps create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/cloud/onramps`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										adopted_hub_id: resolveFileToken(
											argv["adopted-hub-id"] as string | undefined,
											"adopted-hub-id",
											"text"
										),
										attached_hubs: argv["attached-hubs"],
										attached_vpcs: argv["attached-vpcs"],
										cloud_asn: argv["cloud-asn"],
										cloud_type: resolveFileToken(
											argv["cloud-type"] as string | undefined,
											"cloud-type",
											"text"
										),
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										dynamic_routing: argv["dynamic-routing"],
										hub_provider_id: resolveFileToken(
											argv["hub-provider-id"] as string | undefined,
											"hub-provider-id",
											"text"
										),
										install_routes_in_cloud: argv["install-routes-in-cloud"],
										install_routes_in_magic_wan:
											argv["install-routes-in-magic-wan"],
										manage_hub_to_hub_attachments:
											argv["manage-hub-to-hub-attachments"],
										manage_vpc_to_hub_attachments:
											argv["manage-vpc-to-hub-attachments"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										region: resolveFileToken(
											argv["region"] as string | undefined,
											"region",
											"text"
										),
										type: resolveFileToken(
											argv["type"] as string | undefined,
											"type",
											"text"
										),
										vpc: resolveFileToken(
											argv["vpc"] as string | undefined,
											"vpc",
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
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/magic/cloud/onramps`,
							{
								body: bodyData,
								headers: Object.keys(headers).length > 0 ? headers : undefined,
							}
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["cloud-type"] === undefined) {
					argv["cloud-type"] = await promptForRequiredEnumField(
						"cloud-type",
						"The cloud_type field",
						["AWS", "AZURE", "GOOGLE"] as const
					);
				}
				if (argv["dynamic-routing"] === undefined) {
					throw new Error(
						"--dynamic-routing is required (or pass --body with this field set)."
					);
				}
				if (argv["install-routes-in-cloud"] === undefined) {
					throw new Error(
						"--install-routes-in-cloud is required (or pass --body with this field set)."
					);
				}
				if (argv["install-routes-in-magic-wan"] === undefined) {
					throw new Error(
						"--install-routes-in-magic-wan is required (or pass --body with this field set)."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField("name", "The name field");
				}
				if (argv["type"] === undefined) {
					argv["type"] = await promptForRequiredEnumField(
						"type",
						"The type field",
						["OnrampTypeSingle", "OnrampTypeHub"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["adopted-hub-id"] !== undefined)
					setNestedValue(
						bodyData,
						["adopted_hub_id"],
						resolveFileToken(
							argv["adopted-hub-id"] as string | undefined,
							"adopted-hub-id",
							"text"
						)
					);
				if (argv["attached-hubs"] !== undefined)
					setNestedValue(bodyData, ["attached_hubs"], argv["attached-hubs"]);
				if (argv["attached-vpcs"] !== undefined)
					setNestedValue(bodyData, ["attached_vpcs"], argv["attached-vpcs"]);
				if (argv["cloud-asn"] !== undefined)
					setNestedValue(bodyData, ["cloud_asn"], argv["cloud-asn"]);
				if (argv["cloud-type"] !== undefined)
					setNestedValue(
						bodyData,
						["cloud_type"],
						resolveFileToken(
							argv["cloud-type"] as string | undefined,
							"cloud-type",
							"text"
						)
					);
				if (argv["description"] !== undefined)
					setNestedValue(
						bodyData,
						["description"],
						resolveFileToken(
							argv["description"] as string | undefined,
							"description",
							"text"
						)
					);
				if (argv["dynamic-routing"] !== undefined)
					setNestedValue(
						bodyData,
						["dynamic_routing"],
						argv["dynamic-routing"]
					);
				if (argv["hub-provider-id"] !== undefined)
					setNestedValue(
						bodyData,
						["hub_provider_id"],
						resolveFileToken(
							argv["hub-provider-id"] as string | undefined,
							"hub-provider-id",
							"text"
						)
					);
				if (argv["install-routes-in-cloud"] !== undefined)
					setNestedValue(
						bodyData,
						["install_routes_in_cloud"],
						argv["install-routes-in-cloud"]
					);
				if (argv["install-routes-in-magic-wan"] !== undefined)
					setNestedValue(
						bodyData,
						["install_routes_in_magic_wan"],
						argv["install-routes-in-magic-wan"]
					);
				if (argv["manage-hub-to-hub-attachments"] !== undefined)
					setNestedValue(
						bodyData,
						["manage_hub_to_hub_attachments"],
						argv["manage-hub-to-hub-attachments"]
					);
				if (argv["manage-vpc-to-hub-attachments"] !== undefined)
					setNestedValue(
						bodyData,
						["manage_vpc_to_hub_attachments"],
						argv["manage-vpc-to-hub-attachments"]
					);
				if (argv["name"] !== undefined)
					setNestedValue(
						bodyData,
						["name"],
						resolveFileToken(argv["name"] as string | undefined, "name", "text")
					);
				if (argv["region"] !== undefined)
					setNestedValue(
						bodyData,
						["region"],
						resolveFileToken(
							argv["region"] as string | undefined,
							"region",
							"text"
						)
					);
				if (argv["type"] !== undefined)
					setNestedValue(
						bodyData,
						["type"],
						resolveFileToken(argv["type"] as string | undefined, "type", "text")
					);
				if (argv["vpc"] !== undefined)
					setNestedValue(
						bodyData,
						["vpc"],
						resolveFileToken(argv["vpc"] as string | undefined, "vpc", "text")
					);
				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/magic/cloud/onramps`,
						{
							body: Object.keys(bodyData).length > 0 ? bodyData : undefined,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
