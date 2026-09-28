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
 * create command
 * @generated from apis/overlays/organization.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 organization create\n\nCreate a new organization for a user. (Currently in Public Beta - see https://developers.cloudflare.com/fundamentals/organizations/)"
		)
		.option("name", { type: "string", description: "The name field" })
		.option("parent-id", { type: "string", description: "The parent.id field" })
		.option("profile-business-address", {
			type: "string",
			description: "The profile.business_address field",
		})
		.option("profile-business-email", {
			type: "string",
			description: "The profile.business_email field",
		})
		.option("profile-business-name", {
			type: "string",
			description: "The profile.business_name field",
		})
		.option("profile-business-phone", {
			type: "string",
			description: "The profile.business_phone field",
		})
		.option("profile-external-metadata", {
			type: "string",
			description: "The profile.external_metadata field",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "References an Organization in the Cloudflare data model.",
		})
		.check((argv) => {
			const groupSet = ["parent-id"].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = ["parent-id"].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --parent-* flag is set`
					);
				}
			}
			return true;
		})
		.check((argv) => {
			const groupSet = [
				"profile-business-address",
				"profile-business-email",
				"profile-business-name",
				"profile-business-phone",
				"profile-external-metadata",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = [
					"profile-business-address",
					"profile-business-email",
					"profile-business-name",
					"profile-business-phone",
					"profile-external-metadata",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --profile-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"Organizations_createUserOrganization">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create organization",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "organization create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf organization create",
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
				const client = await createCommandClient(argv);

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.organization.create({ ...bodyData } satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField("name", "The name field");
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					client.organization.create({ ...bodyData } satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
