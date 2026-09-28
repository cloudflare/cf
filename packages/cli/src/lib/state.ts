import { join } from "node:path";
import {
	createJsonFileStorage,
	getCfConfigPath,
} from "@cloudflare/workers-auth/cf";

interface TelemetryPreference {
	enabled: boolean;
	date: string;
}

interface TelemetryState {
	preference?: TelemetryPreference;
	bannerLastShown?: string;
}

interface CLIState {
	completions?: {
		prompted?: boolean;
	};
	telemetry?: TelemetryState;
	deviceId?: string;
}

const storage = createJsonFileStorage<CLIState>(() =>
	join(getCfConfigPath(), "state.json")
);

export function readState(): CLIState {
	return storage.read() ?? {};
}

export function updateState(update: Partial<CLIState>): void {
	const state = readState();
	storage.write({
		...state,
		...update,
		...(update.telemetry === undefined
			? {}
			: { telemetry: { ...state.telemetry, ...update.telemetry } }),
	});
}
