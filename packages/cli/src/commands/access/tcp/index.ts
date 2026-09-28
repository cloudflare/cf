import { lazyCommand } from "#lib/lazy-command.js";

export default {
	...lazyCommand(
		"tcp",
		"Proxy a TCP connection through Access. The command is also available as ssh, rdp, and smb.",
		() => import("./command.js"),
		{ command: "access tcp", recordArgs: false }
	),
	aliases: ["ssh", "rdp", "smb"],
};
