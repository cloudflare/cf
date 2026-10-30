import { randomUUID } from "node:crypto";
import { readFileForFlag } from "../../lib/input-validation.js";
import { formatOutput, printSuccess } from "../../lib/output.js";
import { resolveTelemetry } from "../../lib/telemetry/config.js";
import { log } from "../../lib/ui/log.js";
import { buildClientContext, shouldAttachContext } from "./context.js";
import { buildSubmission } from "./payload.js";
import { feedbackUrl, MAX_BODY_BYTES, sendFeedback } from "./send.js";
import type { CommonYargsOptions, InferArgs } from "../../lib/cli-types.js";
import type { Argv, CommandModule } from "yargs";

const AGENT_EXAMPLE = `echo '{"task":"Deploy a Worker","expected":"Deploy succeeds","actual":"Error 10000","impact":"blocked","agent":{"name":"claude-code","model":"claude-opus-5-5","errors":[{"message":"Authentication error","code":10000}]}}' | cf feedback --input-json -`;

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.positional("note", {
			type: "string",
			description:
				"What happened or what would have helped; - reads it from stdin",
		})
		.option("field", {
			type: "string",
			array: true,
			description: "A key=value detail; repeat for more (see Fields below)",
		})
		.option("input-json", {
			type: "string",
			description:
				"A JSON report from a file, or - for stdin (put it last, or write --input-json=-); meant for agents",
		})
		.option("context", {
			type: "boolean",
			description:
				"Attach CLI context: version, OS and detected agent. Follows the telemetry setting; --no-context never attaches it",
		})
		.option("dry-run", {
			type: "boolean",
			default: false,
			description: "Print the submission without sending it",
		})
		.example(
			'cf feedback "the deploy output does not say which account it used"',
			"Send a note"
		)
		.example(
			"cf feedback --field type=bug --field product=workers --field expected=… --field actual=…",
			"Send structured detail"
		)
		.example(AGENT_EXAMPLE, "Send an agent report through --input-json -")
		.epilogue(
			[
				"Sends bugs, friction and feature requests to the cf team. A note on its own is enough.",
				"Fields (all optional): type (bug, friction, feature, docs, praise, other), product, command, task, attempted, expected, actual, impact (blocked, worked_around, friction, none), suggestion, rating (1–5), sentiment, model. Other keys are kept as free-form fields.",
				"Agents can send a JSON report with the same fields plus an agent object (name, model, commands, errors, repro_steps, docs_urls). --field values win over the report.",
				"Do not include secrets, personal data or account identifiers. Known secrets are removed before storage. Give the printed submission ID to the user, and do not resend after seeing ignored fields.",
			].join("\n\n")
		);
}

type FeedbackArgs = InferArgs<typeof builder>;

async function readStdin(): Promise<string> {
	if (process.stdin.isTTY) {
		throw new Error(
			"Nothing to read on stdin. Pipe the input or pass it as an argument."
		);
	}
	const chunks: Buffer[] = [];
	for await (const chunk of process.stdin) {
		chunks.push(Buffer.from(chunk));
	}
	const text = Buffer.concat(chunks).toString("utf-8");
	return text.endsWith("\n") ? text.slice(0, -1) : text;
}

// The root parser turns a bare "-" into "", so both mean stdin.
const isStdin = (value: string | undefined) => value === "-" || value === "";

async function readInputJson(source: string): Promise<unknown> {
	const text = isStdin(source)
		? await readStdin()
		: readFileForFlag(source).toString("utf-8");
	try {
		return JSON.parse(text);
	} catch (cause) {
		throw new Error(
			`--input-json is not valid JSON: ${(cause as Error).message}`,
			{ cause }
		);
	}
}

function reportReceiptNotes(
	receipt: Awaited<ReturnType<typeof sendFeedback>>
): void {
	if (receipt.notices?.includes("credential_redacted")) {
		log.warn(
			"A credential was removed from your feedback before it was stored. If it was real, rotate it."
		);
	}
	if (receipt.ignored && receipt.ignored.length > 0) {
		const listed = receipt.ignored
			.map((i) => `${i.path} (${i.reason})`)
			.join(", ");
		log.warn(
			`Some fields were not stored as sent: ${listed}. Do not resend; the rest was received.`
		);
	}
}

const feedbackCommand: CommandModule<CommonYargsOptions, FeedbackArgs> = {
	command: "feedback [note]",
	describe: "Send feedback about cf to the cf team",
	builder,
	handler: async (argv) => {
		const inputSource = argv["input-json"];
		// `--input-json -` leaves its "-" behind as the note, which arrives as "".
		const displacedDash = inputSource === "" && argv.note === "";
		const noteFromStdin = !displacedDash && isStdin(argv.note);
		if (noteFromStdin && isStdin(inputSource)) {
			throw new Error(
				"Only one of the note and --input-json can read from stdin."
			);
		}
		const note = noteFromStdin
			? await readStdin()
			: displacedDash
				? undefined
				: argv.note;
		const inputJson =
			inputSource === undefined ? undefined : await readInputJson(inputSource);
		const attach = shouldAttachContext(argv.context, resolveTelemetry());

		const { submission, overridden } = buildSubmission({
			note: note?.trim() ? note : undefined,
			fieldArgs: (argv.field ?? []).map(String),
			inputJson,
			client: attach ? buildClientContext() : undefined,
			submissionId: randomUUID(),
			sentAt: new Date().toISOString(),
		});
		for (const path of overridden) {
			log.warn(`--field replaced ${path} from --input-json.`);
		}

		const url = feedbackUrl();
		if (argv["dry-run"]) {
			formatOutput({ dryRun: true, url, payload: submission });
			return;
		}
		if (Buffer.byteLength(JSON.stringify(submission)) > MAX_BODY_BYTES) {
			throw new Error(
				"Feedback is larger than 256 KiB. Shorten the note or the report."
			);
		}

		const receipt = await sendFeedback(url, submission);
		formatOutput(receipt);
		reportReceiptNotes(receipt);
		printSuccess(`Feedback sent (${receipt.submission_id}). Thank you.`);
	},
};

export default feedbackCommand;
