import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * transfer-check command
 * @generated from apis/overlays/registrar.ts
 */
import type { Argv, CommandModule } from "yargs";
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 registrar registrations transfer-check\n\nPerforms real-time, authoritative eligibility checks directly against needed requirements. Use this endpoint to verify a domain is available before attempting a transfer via `POST /registrations/:domain_name/transfer-in`. **Note:** This endpoint uses POST to accept a list of domains in the request body. It is a read-only operation — it does not create, modify, or reserve any domains. ### Behavior - Maximum 10 domains per request - Pricing is only returned for domains where `transferable: true` - Results are not cached; each request queries the registry & other needed upstreams ## Extension Support All `.uk` extensions (`.uk`, `.co.uk`, etc) do not support auth codes. As such, Cloudflare will ignore the `auth_code` section of this request for `.uk` domains. This means that a `.uk` domain depends on public data to obtain domain information, so it might be a few minutes outdated. ### Workflow 1. Call this endpoint with domains the user wants to transfer. 2. For each domain where `transferable: true`, present pricing to the user. 3. For each domain where `transferable: false`, present reasons to the user 4. Proceed to `POST /registrations/:domain_name/transfer-in` only for the `transferable: true` domains."
		)
		.option("domains", {
			type: "string",
			description:
				"List of domain objects to evaluate for transfer eligibility. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "List of transferable domain objects to check.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"registrar-domain-discovery-transfer-check">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "transfer-check",
	describe: "Check domain transfer eligibility",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "registrar registrations transfer-check",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf registrar registrations transfer-check",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/registrar/domain-transfer-check`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										domains: parseObjectArray(argv["domains"], "domains"),
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
						client.registrar.registrations.transferCheck({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["domains"] === undefined) {
					throw new Error(
						"--domains is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					domains: parseObjectArray(argv["domains"], "domains"),
				});
				const result = await withProgress(`Creating`, async () =>
					client.registrar.registrations.transferCheck({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
