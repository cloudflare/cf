import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * postRequestCreate command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one requests postRequestCreate <project-type>\n\nCreates a new Request for Information with the specified project type and details."
		)
		.positional("project-type", {
			type: "string",
			description: "RFI project type",
			demandOption: true,
		})
		.option("description", {
			type: "string",
			description:
				"RFI description (optional). Defaults to an empty string when omitted.",
		})
		.option("event-id", {
			type: "string",
			description: "Optional related event ID",
		})
		.option("priority", {
			type: "string",
			description:
				"RFI priority. Four-level projects use `low`, `routine`, `high`, `urgent`; existing projects retain legacy `low`->routine compatibility. `medium`, `critical`, and `unknown` remain accepted legacy aliases. Defaults to `routine`.",
			choices: [
				"low",
				"routine",
				"high",
				"urgent",
				"unknown",
				"medium",
				"critical",
			],
		})
		.coerce("priority", (value: string | undefined) =>
			resolveFileToken(value, "priority", "text")
		)
		.option("request-type", {
			type: "string",
			description: "Optional request type for the request",
		})
		.option("subtype-id", {
			type: "string",
			description: "Optional subtype ID",
		})
		.option("title", {
			type: "string",
			description:
				"RFI title (optional). When omitted, the server generates a summary from the request type and readable ID.",
		})
		.option("tlp", {
			type: "string",
			description:
				"Traffic Light Protocol level. Canonical values are `clear`, `green`, `amber`, `amber-strict`, `red`, `purple`. `white` and `amber+strict` are accepted input aliases; responses always use the canonical spelling.",
			choices: [
				"clear",
				"green",
				"amber",
				"amber-strict",
				"red",
				"purple",
				"white",
				"amber+strict",
			],
		})
		.coerce("tlp", (value: string | undefined) =>
			resolveFileToken(value, "tlp", "text")
		)
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

type Request = SdkRequest<"post_RequestCreate">;
type Body = Request;

const typedBuilder = withArgTypes<
	{
		"project-type": Request["project_type"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "postRequestCreate <project-type>",
	describe: "Creates a new RFI",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one requests postRequestCreate",
				classification: {
					safeFlags: ["priority", "tlp", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one requests postRequestCreate",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/requests/${argv["project-type"] == null ? "<project-type>" : encodeURIComponent(String(argv["project-type"]))}`,
						pathParams: { "project-type": String(argv["project-type"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										eventId: resolveFileToken(
											argv["event-id"] as string | undefined,
											"event-id",
											"text"
										),
										priority: argv["priority"],
										request_type: resolveFileToken(
											argv["request-type"] as string | undefined,
											"request-type",
											"text"
										),
										subtypeId: resolveFileToken(
											argv["subtype-id"] as string | undefined,
											"subtype-id",
											"text"
										),
										title: resolveFileToken(
											argv["title"] as string | undefined,
											"title",
											"text"
										),
										tlp: argv["tlp"],
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
						client.cloudforceOne.requests.postRequestCreate({
							...bodyData,
							account_id: accountId,
							project_type: argv["project-type"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					eventId: resolveFileToken(
						argv["event-id"] as string | undefined,
						"event-id",
						"text"
					),
					priority: argv["priority"],
					request_type: resolveFileToken(
						argv["request-type"] as string | undefined,
						"request-type",
						"text"
					),
					subtypeId: resolveFileToken(
						argv["subtype-id"] as string | undefined,
						"subtype-id",
						"text"
					),
					title: resolveFileToken(
						argv["title"] as string | undefined,
						"title",
						"text"
					),
					tlp: argv["tlp"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.cloudforceOne.requests.postRequestCreate({
						...bodyData,
						account_id: accountId,
						project_type: argv["project-type"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
