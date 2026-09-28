import $createnamespace from "./create-namespace.js";
import $deletememory from "./delete-memory.js";
import $deletenamespace from "./delete-namespace.js";
import $deleteprofile from "./delete-profile.js";
import $deletesession from "./delete-session.js";
import $getmemory from "./get-memory.js";
import $getnamespace from "./get-namespace.js";
import $ingest from "./ingest.js";
import $listmemories from "./list-memories.js";
import $listnamespaces from "./list-namespaces.js";
import $listprofiles from "./list-profiles.js";
import $recall from "./recall.js";
import $remember from "./remember.js";
import $summary from "./summary.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * agent-memory command
 * @generated from apis/overlays/agent-memory.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "agent-memory",
	describe: "agent-memory",

	builder: (yargs) => {
		return yargs
			.command($createnamespace)
			.command($deletememory)
			.command($deletenamespace)
			.command($deleteprofile)
			.command($deletesession)
			.command($getmemory)
			.command($getnamespace)
			.command($ingest)
			.command($listmemories)
			.command($listnamespaces)
			.command($listprofiles)
			.command($recall)
			.command($remember)
			.command($summary)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
