import $curl from "#commands/access/curl/index.js";
import $login from "#commands/access/login/index.js";
import $sshconfig from "#commands/access/ssh-config/index.js";
import $sshgen from "#commands/access/ssh-gen/index.js";
import $tcp from "#commands/access/tcp/index.js";
import $token from "#commands/access/token/index.js";
/**
 * access command
 * @generated from apis/overlays/access.ts
 */
import { apiGroup } from "#lib/api-command.js";
import { withHandWrittenDryRun } from "#lib/hand-written-dry-run.js";

const command = apiGroup({
	command: "access",
	describe: "Access protected applications and services",

	routes: {
		curl: withHandWrittenDryRun($curl, "preview"),
		login: withHandWrittenDryRun($login, "preview"),
		"ssh-config": withHandWrittenDryRun($sshconfig, "preview"),
		"ssh-gen": withHandWrittenDryRun($sshgen, "preview"),
		tcp: withHandWrittenDryRun($tcp, "preview"),
		token: withHandWrittenDryRun($token, "preview"),
	},
});

export default command;
