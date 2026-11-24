import t, { ShellCompDirective } from "@bomb.sh/tab";
import { runWithTelemetry } from "../../lib/telemetry/run.js";
import type { CommandModule } from "yargs";

interface CompleteArgs {
	shell?: "bash" | "zsh" | "fish" | "powershell";
	_?: unknown[];
}

const completeCommand: CommandModule<object, CompleteArgs> & {
	describe: string;
} = {
	command: "complete [shell]",
	describe: "Generate and handle shell completions",

	builder: (yargs) =>
		yargs
			.positional("shell", {
				type: "string",
				choices: ["bash", "zsh", "fish", "powershell"] as const,
				description: "Shell type to generate completions for",
			})
			.example(
				"cf complete bash >> ~/.bashrc",
				"Install bash completions (then restart your shell)"
			)
			.example(
				"cf complete zsh >> ~/.zshrc",
				"Install zsh completions (then restart your shell)"
			)
			.example(
				"cf complete fish > ~/.config/fish/completions/cf.fish",
				"Install fish completions"
			),

	handler: async (argv) => {
		// Shells call back at completion time with `cf complete -- <words…>`.
		// The parser puts everything after `--` into argv._; the first
		// entry is the literal command name when invoked positionally.
		const rawArgs = (argv._ ?? []).map(String);
		const completionArgs = rawArgs.slice(rawArgs[0] === "complete" ? 1 : 0);

		if (completionArgs.length > 0) {
			const { buildCli } = await import("../../index.js");
			const { cli, dispose } = buildCli([]);
			try {
				for (const item of await cli.complete(completionArgs)) {
					const description =
						item.kind === "argument:value" ? item.completion : item.brief;
					console.log(
						`${item.completion}\t${description.replace(/\s+/g, " ")}`
					);
				}
				console.log(`:${ShellCompDirective.ShellCompDirectiveNoFileComp}`);
			} finally {
				dispose();
			}
			return;
		}

		const shell = argv.shell;
		if (!shell) {
			// No shell selected and no completion request → print usage
			// hint to stderr and exit non-zero so a misuse doesn't
			// silently no-op in a script.
			process.stderr.write(
				"Usage: cf complete <bash|zsh|fish|powershell>\n" +
					"       cf complete bash >> ~/.bashrc\n"
			);
			process.exitCode = 1;
			return;
		}

		return runWithTelemetry(
			{ command: "complete", recordArgs: false },
			argv as Record<string, unknown>,
			() => {
				t.setup("cf", "cf", shell);
			}
		);
	},
};

export default completeCommand;
