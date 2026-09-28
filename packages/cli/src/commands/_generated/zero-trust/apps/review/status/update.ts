import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust apps review status update\n\nUpdate the statuses of your applications."
		)
		.option("approved-apps", {
			type: "string",
			array: true,
			description: "Contains the ids of the approved applications.",
		})
		.option("in-review-apps", {
			type: "string",
			array: true,
			description: "Contains the ids of the applications in review.",
		})
		.option("unapproved-apps", {
			type: "string",
			array: true,
			description: "Contains the ids of the unapproved applications.",
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

type Request = SdkRequest<"zero-trust-applications-review-status-update">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update",
	describe: "Update applications review statuses",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust apps review status update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust apps review status update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/gateway/apps/review_status`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										approved_apps: argv["approved-apps"],
										in_review_apps: argv["in-review-apps"],
										unapproved_apps: argv["unapproved-apps"],
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
						client.zeroTrust.apps.review.status.update({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["approved-apps"] === undefined) {
					throw new Error(
						"--approved-apps is required (or pass --body with this field set)."
					);
				}
				if (argv["in-review-apps"] === undefined) {
					throw new Error(
						"--in-review-apps is required (or pass --body with this field set)."
					);
				}
				if (argv["unapproved-apps"] === undefined) {
					throw new Error(
						"--unapproved-apps is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					approved_apps: argv["approved-apps"],
					in_review_apps: argv["in-review-apps"],
					unapproved_apps: argv["unapproved-apps"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.zeroTrust.apps.review.status.update({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
