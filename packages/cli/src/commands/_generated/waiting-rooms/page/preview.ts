import { createCommandClient, getZoneId } from "#lib/auth.js";
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
 * preview command
 * @generated from apis/overlays/waiting-rooms.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			'$0 waiting-rooms page preview\n\nCreates a waiting room page preview. Upload a custom waiting room page for preview. You will receive a preview URL in the form `http://waitingrooms.dev/preview/<uuid>`. You can use the following query parameters to change the state of the preview: 1. `force_queue`: Boolean indicating if all users will be queued in the waiting room and no one will be let into the origin website (also known as queueAll). 2. `queue_is_full`: Boolean indicating if the waiting room\'s queue is currently full and not accepting new users at the moment. 3. `queueing_method`: The queueing method currently used by the waiting room. - **fifo** indicates a FIFO queue. - **random** indicates a Random queue. - **passthrough** indicates a Passthrough queue. Keep in mind that the waiting room page will only be displayed if `force_queue=true` or `event=prequeueing` — for other cases the request will pass through to the origin. For our preview, this will be a fake origin website returning \\"Welcome\\". - **reject** indicates a Reject queue. 4. `event`: Used to preview a waiting room event. - **none** indicates no event is occurring. - **prequeueing** indicates that an event is prequeueing (between `prequeue_start_time` and `event_start_time`). - **started** indicates that an event has started (between `event_start_time` and `event_end_time`). 5. `shuffle_at_event_start`: Boolean indicating if the event will shuffle users in the prequeue when it starts. This can only be set to **true** if an event is active (`event` is not **none**). For example, you can make a request to `http://waitingrooms.dev/preview/<uuid>?force_queue=false&queue_is_full=false&queueing_method=random&event=started&shuffle_at_event_start=true` 6. `waitTime`: Non-zero, positive integer indicating the estimated wait time in minutes. The default value is 10 minutes. For example, you can make a request to `http://waitingrooms.dev/preview/<uuid>?waitTime=50` to configure the estimated wait time as 50 minutes.'
		)
		.option("custom-html", {
			type: "string",
			description:
				"Only available for the Waiting Room Advanced subscription. This is a template html file that will be rendered at the edge. If no custom_page_html is provided, the default waiting room will be used. The template is based on mustache ( https://mustache.github.io/ ). There are several variables that are evaluated by the Cloudflare edge:\n1. {{`waitTimeKnown`}} Acts like a boolean value that indicates the behavior to take when wait time is not available, for instance when queue_all is **true**.\n2. {{`waitTimeFormatted`}} Estimated wait time for the user. For example, five minutes. Alternatively, you can use:\n3. {{`waitTime`}} Number of minutes of estimated wait for a user.\n4. {{`waitTimeHours`}} Number of hours of estimated wait for a user (`Math.floor(waitTime/60)`).\n5. {{`waitTimeHourMinutes`}} Number of minutes above the `waitTimeHours` value (`waitTime%60`).\n6. {{`queueIsFull`}} Changes to **true** when no more people can be added to the queue.\n\nTo view the full list of variables, look at the `cfWaitingRoom` object described under the `json_response_enabled` property in other Waiting Room API calls.",
			default: "",
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

type Request =
	SdkRequest<"waiting-room-create-a-custom-waiting-room-page-preview">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "preview",
	describe: "Create a custom waiting room page preview",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "waiting-rooms page preview",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf waiting-rooms page preview",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/waiting_rooms/preview`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										custom_html: resolveFileToken(
											argv["custom-html"] as string | undefined,
											"custom-html",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Loading`, async () =>
						client.waitingRooms.page.preview({
							...bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Loaded` });
					return;
				}
				if (argv["custom-html"] === undefined) {
					argv["custom-html"] = await promptForRequiredField(
						"custom-html",
						"Only available for the Waiting Room Advanced subscription. This is a template html file that will be rendered at the edge. If no custom_page_html is provided, the default waiting room will be used. The template is based on mustache ( https://mustache.github.io/ ). There are several variables that are evaluated by the Cloudflare edge: 1. {{\`waitTimeKnown\`}} Acts like a boolean value that indicates the behavior to take when wait time is not available, for instance when queue_all is **true**. 2. {{\`waitTimeFormatted\`}} Estimated wait time for the user. For example, five minutes. Alternatively, you can use: 3. {{\`waitTime\`}} Number of minutes of estimated wait for a user. 4. {{\`waitTimeHours\`}} Number of hours of estimated wait for a user (\`Math.floor(waitTime/60)\`). 5. {{\`waitTimeHourMinutes\`}} Number of minutes above the \`waitTimeHours\` value (\`waitTime%60\`). 6. {{\`queueIsFull\`}} Changes to **true** when no more people can be added to the queue.  To view the full list of variables, look at the \`cfWaitingRoom\` object described under the \`json_response_enabled\` property in other Waiting Room API calls."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					custom_html: resolveFileToken(
						argv["custom-html"] as string | undefined,
						"custom-html",
						"text"
					),
				});
				const result = await withProgress(`Loading`, async () =>
					client.waitingRooms.page.preview({
						...bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
