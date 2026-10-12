import search from "./search.js";
import type { CommandModule } from "yargs";

const docs: CommandModule & { describe: string } = {
	command: "docs",
	describe: "Search live Cloudflare documentation",
	builder: (yargs) =>
		yargs.command(search).demandCommand(1, "Please specify a subcommand"),
	handler: () => {},
};

export default docs;
