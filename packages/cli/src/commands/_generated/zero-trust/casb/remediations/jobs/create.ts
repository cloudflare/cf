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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust casb remediations jobs create\n\nCreate one or more remediation jobs tied to a specific Cloudflare Account."
		)
		.option("finding-instance-ids", {
			type: "string",
			array: true,
			description: "UUIDs identifying Finding Instances.",
		})
		.option("remediation-type-id", {
			type: "string",
			description: "A UUID identifying this Remediation Type.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Request body for creating remediation jobs.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"CreateRemediationJobs">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Creates remediation jobs",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust casb remediations jobs create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust casb remediations jobs create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/data-security/posture/remediations/jobs`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										finding_instance_ids: argv["finding-instance-ids"],
										remediation_type_id: resolveFileToken(
											argv["remediation-type-id"] as string | undefined,
											"remediation-type-id",
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
					const result = await withProgress(`Creating`, async () =>
						client.zeroTrust.casb.remediations.jobs.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["finding-instance-ids"] === undefined) {
					throw new Error(
						"--finding-instance-ids is required (or pass --body with this field set)."
					);
				}
				if (argv["remediation-type-id"] === undefined) {
					argv["remediation-type-id"] = await promptForRequiredField(
						"remediation-type-id",
						"A UUID identifying this Remediation Type."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					finding_instance_ids: argv["finding-instance-ids"],
					remediation_type_id: resolveFileToken(
						argv["remediation-type-id"] as string | undefined,
						"remediation-type-id",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.zeroTrust.casb.remediations.jobs.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
