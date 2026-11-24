import { apiGroup } from "../../lib/api-command.js";
import { withTelemetry } from "../../lib/telemetry/index.js";
import loginCommand, { loginTelemetryClassification } from "./login.js";
import logoutCommand from "./logout.js";
import {
	activateCommand,
	createCommand,
	deactivateCommand,
	deleteCommand,
	listCommand,
} from "./profiles.js";
import scopesCommand from "./scopes.js";
import whoamiCommand from "./whoami.js";

export default apiGroup({
	command: "auth",
	describe: "Manage authentication and profiles",
	routes: {
		login: withTelemetry(loginCommand, {
			command: "auth login",
			classification: loginTelemetryClassification,
		}),
		logout: withTelemetry(logoutCommand, {
			command: "auth logout",
			classification: { safeFlags: [] },
		}),
		whoami: withTelemetry(whoamiCommand, {
			command: "auth whoami",
			classification: { safeFlags: ["json"] },
		}),
		scopes: withTelemetry(scopesCommand, {
			command: "auth scopes",
			classification: { safeFlags: ["all"] },
		}),
		create: withTelemetry(createCommand, {
			command: "auth create",
			classification: { safeFlags: ["browser", "device"] },
		}),
		delete: withTelemetry(deleteCommand, {
			command: "auth delete",
			classification: { safeFlags: [] },
		}),
		activate: withTelemetry(activateCommand, {
			command: "auth activate",
			classification: { safeFlags: [] },
		}),
		deactivate: withTelemetry(deactivateCommand, {
			command: "auth deactivate",
			classification: { safeFlags: [] },
		}),
		list: withTelemetry(listCommand, {
			command: "auth list",
			classification: { safeFlags: [] },
		}),
	},
});
