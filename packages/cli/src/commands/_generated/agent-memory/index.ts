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
/**
 * agent-memory command
 * @generated from apis/overlays/agent-memory.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "agent-memory",
	describe: "agent-memory",

	routes: {
		"create-namespace": $createnamespace,
		"delete-memory": $deletememory,
		"delete-namespace": $deletenamespace,
		"delete-profile": $deleteprofile,
		"delete-session": $deletesession,
		"get-memory": $getmemory,
		"get-namespace": $getnamespace,
		ingest: $ingest,
		"list-memories": $listmemories,
		"list-namespaces": $listnamespaces,
		"list-profiles": $listprofiles,
		recall: $recall,
		remember: $remember,
		summary: $summary,
	},
});

export default command;
