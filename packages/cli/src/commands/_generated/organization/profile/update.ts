import operation from "../../_operations/organization/profile/update.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/organization.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 organization profile update <organization-id>\n\nPartially updates the business profile (name, email, phone, address, and external metadata) associated with this organization's customer record, creating the profile if it does not exist. Changes apply to every account and organization sharing that profile. Omitted, empty, or null fields are left unchanged. Each profile field is limited to 1,000 UTF-8 bytes. Only available to members of the organization."
		)
		.positional("organization-id", {
			type: "string",
			description: "Organization ID",
			demandOption: true,
		})
		.option("business-address", {
			type: "string",
			description: "The business_address field",
		})
		.option("business-email", {
			type: "string",
			description: "The business_email field",
		})
		.option("business-name", {
			type: "string",
			description: "The business_name field",
		})
		.option("business-phone", {
			type: "string",
			description: "The business_phone field",
		})
		.option("external-metadata", {
			type: "string",
			description: "The external_metadata field",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Partial business profile update. Omitted, empty, or null fields remain unchanged. At least one of business name, address, phone, or email must be non-empty.",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <organization-id>",
	describe: "Modify organization profile.",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "organization profile update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf organization profile update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/organizations/${argv["organization-id"] == null ? "<organization-id>" : encodeURIComponent(String(argv["organization-id"]))}/profile`,
						pathParams: {
							"organization-id": String(argv["organization-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										business_address: resolveFileToken(
											argv["business-address"] as string | undefined,
											"business-address",
											"text"
										),
										business_email: resolveFileToken(
											argv["business-email"] as string | undefined,
											"business-email",
											"text"
										),
										business_name: resolveFileToken(
											argv["business-name"] as string | undefined,
											"business-name",
											"text"
										),
										business_phone: resolveFileToken(
											argv["business-phone"] as string | undefined,
											"business-phone",
											"text"
										),
										external_metadata: resolveFileToken(
											argv["external-metadata"] as string | undefined,
											"external-metadata",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							organization_id: argv["organization-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					business_address: resolveFileToken(
						argv["business-address"] as string | undefined,
						"business-address",
						"text"
					),
					business_email: resolveFileToken(
						argv["business-email"] as string | undefined,
						"business-email",
						"text"
					),
					business_name: resolveFileToken(
						argv["business-name"] as string | undefined,
						"business-name",
						"text"
					),
					business_phone: resolveFileToken(
						argv["business-phone"] as string | undefined,
						"business-phone",
						"text"
					),
					external_metadata: resolveFileToken(
						argv["external-metadata"] as string | undefined,
						"external-metadata",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						organization_id: argv["organization-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
