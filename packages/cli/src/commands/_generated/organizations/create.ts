import operation from "../_operations/organizations/create.js";
/**
 * create command
 * @generated from apis/overlays/organizations.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create organization",
	usage:
		"$0 organizations create\n\nCreate a new organization for a user. Sub-organization creation availability depends on the organization's capabilities. The optional `profile` object accepts partial profile details; its individual fields are not required. Organization names are limited to 65 UTF-8 bytes. Each profile field is limited to 1,000 UTF-8 bytes, and a non-empty business email must be valid. At least one of business name, address, phone, or email must be non-empty to persist a profile.",
	flags: {
		name: {
			kind: "parsed",
			brief: "The Organization name, limited to 65 UTF-8 bytes.",
			optional: true,
			parse: String,
		},
		"parent-id": {
			kind: "parsed",
			brief: "Organization ID",
			optional: true,
			parse: String,
		},
		"profile-business-address": {
			kind: "parsed",
			brief: "The profile.business_address field",
			optional: true,
			parse: String,
		},
		"profile-business-email": {
			kind: "parsed",
			brief: "The profile.business_email field",
			optional: true,
			parse: String,
		},
		"profile-business-name": {
			kind: "parsed",
			brief: "The profile.business_name field",
			optional: true,
			parse: String,
		},
		"profile-business-phone": {
			kind: "parsed",
			brief: "The profile.business_phone field",
			optional: true,
			parse: String,
		},
		"profile-external-metadata": {
			kind: "parsed",
			brief: "The profile.external_metadata field",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "organizations create",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"The Organization name, limited to 65 UTF-8 bytes."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command: "cf organizations create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/organizations`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										parent: {
											id: resolveFileToken(
												argv["parent-id"] as string | undefined,
												"parent-id",
												"text"
											),
										},
										profile: {
											business_address: resolveFileToken(
												argv["profile-business-address"] as string | undefined,
												"profile-business-address",
												"text"
											),
											business_email: resolveFileToken(
												argv["profile-business-email"] as string | undefined,
												"profile-business-email",
												"text"
											),
											business_name: resolveFileToken(
												argv["profile-business-name"] as string | undefined,
												"profile-business-name",
												"text"
											),
											business_phone: resolveFileToken(
												argv["profile-business-phone"] as string | undefined,
												"profile-business-phone",
												"text"
											),
											external_metadata: resolveFileToken(
												argv["profile-external-metadata"] as string | undefined,
												"profile-external-metadata",
												"text"
											),
										},
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					parent: {
						id: resolveFileToken(
							argv["parent-id"] as string | undefined,
							"parent-id",
							"text"
						),
					},
					profile: {
						business_address: resolveFileToken(
							argv["profile-business-address"] as string | undefined,
							"profile-business-address",
							"text"
						),
						business_email: resolveFileToken(
							argv["profile-business-email"] as string | undefined,
							"profile-business-email",
							"text"
						),
						business_name: resolveFileToken(
							argv["profile-business-name"] as string | undefined,
							"profile-business-name",
							"text"
						),
						business_phone: resolveFileToken(
							argv["profile-business-phone"] as string | undefined,
							"profile-business-phone",
							"text"
						),
						external_metadata: resolveFileToken(
							argv["profile-external-metadata"] as string | undefined,
							"profile-external-metadata",
							"text"
						),
					},
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
