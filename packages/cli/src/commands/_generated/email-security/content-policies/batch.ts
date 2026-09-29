import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * batch command
 * @generated from apis/overlays/email-security.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 email-security content-policies batch\n\nExecutes multiple content policy operations atomically: delete, partially update, replace, and create content policies in a single request. All four operation arrays (deletes, patches, puts, posts) are required and executed in order. Send empty arrays for unused operations."
		)
		.option("deletes", {
			type: "string",
			description:
				"IDs of the content policies to delete. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("patches", {
			type: "string",
			description:
				"Partial updates to apply — each entry carries the policy's ID and only the fields to change. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("posts", {
			type: "string",
			description:
				"Content policies to create. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("puts", {
			type: "string",
			description:
				"Full replacements to apply — each entry carries the policy's ID and every field of its new value. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("force", {
			type: "boolean",
			alias: "f",
			description: "Skip confirmation (useful in scripts and CI)",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"email_security_batch_content_policies">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "batch",
	describe: "Batch content policy operations",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security content-policies batch",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security content-policies batch",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/settings/content_policies/batch`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										deletes: parseObjectArray(argv["deletes"], "deletes"),
										patches: parseObjectArray(argv["patches"], "patches"),
										posts: parseObjectArray(argv["posts"], "posts"),
										puts: parseObjectArray(argv["puts"], "puts"),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `This operation may delete the selected content policies and stop evaluating emails against their patterns.`,
					}))
				) {
					process.stderr.write("Aborted.\n");
					return;
				}

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Deleting`, async () =>
						client.emailSecurity.contentPolicies.batch({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Deleted` });
					return;
				}
				if (argv["deletes"] === undefined) {
					throw new Error(
						"--deletes is required (or pass --body with this field set)."
					);
				}
				if (argv["patches"] === undefined) {
					throw new Error(
						"--patches is required (or pass --body with this field set)."
					);
				}
				if (argv["posts"] === undefined) {
					throw new Error(
						"--posts is required (or pass --body with this field set)."
					);
				}
				if (argv["puts"] === undefined) {
					throw new Error(
						"--puts is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					deletes: parseObjectArray(argv["deletes"], "deletes"),
					patches: parseObjectArray(argv["patches"], "patches"),
					posts: parseObjectArray(argv["posts"], "posts"),
					puts: parseObjectArray(argv["puts"], "puts"),
				});
				const result = await withProgress(`Deleting`, async () =>
					client.emailSecurity.contentPolicies.batch({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
