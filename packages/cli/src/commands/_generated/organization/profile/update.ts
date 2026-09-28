import { createCommandClient } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/organization.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 organization profile update <organization-id>\n\nModify organization profile. (Currently in Public Beta - see https://developers.cloudflare.com/fundamentals/organizations/)"
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
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"Organizations_modifyProfile">;
type Body = Request;

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
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.organization.profile.update({
							...bodyData,
							organization_id: argv["organization-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["business-address"] === undefined) {
					argv["business-address"] = await promptForRequiredField(
						"business-address",
						"The business_address field"
					);
				}
				if (argv["business-email"] === undefined) {
					argv["business-email"] = await promptForRequiredField(
						"business-email",
						"The business_email field"
					);
				}
				if (argv["business-name"] === undefined) {
					argv["business-name"] = await promptForRequiredField(
						"business-name",
						"The business_name field"
					);
				}
				if (argv["business-phone"] === undefined) {
					argv["business-phone"] = await promptForRequiredField(
						"business-phone",
						"The business_phone field"
					);
				}
				if (argv["external-metadata"] === undefined) {
					argv["external-metadata"] = await promptForRequiredField(
						"external-metadata",
						"The external_metadata field"
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					client.organization.profile.update({
						...bodyData,
						organization_id: argv["organization-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
