import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * putRequestUpdate command
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
			"$0 cloudforce-one requests putRequestUpdate <request-id>\n\nUpdates an existing RFI with the provided fields. Only provided fields will be updated."
		)
		.positional("request-id", {
			type: "string",
			description: "RFI UUID",
			demandOption: true,
		})
		.option("project-type", {
			type: "string",
			description:
				"RFI project type. Valid values: threat-intelligence, incident-response, ir-emergency-response, table-top, pentest, irp, threat-hunting, cybersecurity-assessment, react-general, legal-response, soc-alerts, demo",
			demandOption: true,
		})
		.option("description", { type: "string", description: "RFI description" })
		.option("event-id", {
			type: "string",
			description: "Optional related event ID",
		})
		.option("priority", {
			type: "string",
			description:
				"RFI priority. Four-level projects use a distinct `low` level; existing projects retain legacy `low`->routine compatibility. `medium`, `critical`, and `unknown` remain accepted legacy aliases.",
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
			description:
				"Request type. May only be changed while the request is still open; changing it recalculates the request's token cost.",
		})
		.option("subtype-id", {
			type: "string",
			description: "Optional subtype ID",
		})
		.option("summary", { type: "string", description: "RFI summary" })
		.option("title", {
			type: "string",
			description: "RFI title (alias for summary field)",
		})
		.option("tlp", {
			type: "string",
			description:
				"Traffic Light Protocol level. `white` and `amber+strict` are accepted input aliases; responses always use the canonical spelling.",
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

type Request = SdkRequest<"put_RequestUpdate">;
type Body = Request;

const typedBuilder = withArgTypes<
	{
		"project-type": Request["project_type"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "putRequestUpdate <request-id>",
	describe: "Update an RFI",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one requests putRequestUpdate",
				classification: {
					safeFlags: ["priority", "tlp", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one requests putRequestUpdate",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/requests/${argv["project-type"] == null ? "<project-type>" : encodeURIComponent(String(argv["project-type"]))}/${argv["request-id"] == null ? "<request-id>" : encodeURIComponent(String(argv["request-id"]))}`,
						pathParams: {
							"project-type": String(argv["project-type"] ?? ""),
							"request-id": String(argv["request-id"] ?? ""),
						},
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
										summary: resolveFileToken(
											argv["summary"] as string | undefined,
											"summary",
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
					const result = await withProgress(`Updating`, async () =>
						client.cloudforceOne.requests.putRequestUpdate({
							...bodyData,
							account_id: accountId,
							project_type: argv["project-type"],
							request_id: argv["request-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
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
					summary: resolveFileToken(
						argv["summary"] as string | undefined,
						"summary",
						"text"
					),
					title: resolveFileToken(
						argv["title"] as string | undefined,
						"title",
						"text"
					),
					tlp: argv["tlp"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.cloudforceOne.requests.putRequestUpdate({
						...bodyData,
						account_id: accountId,
						project_type: argv["project-type"],
						request_id: argv["request-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
