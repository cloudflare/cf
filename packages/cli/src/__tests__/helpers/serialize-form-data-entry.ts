export async function serialize(
	entry: FormDataEntryValue | null
): Promise<string | null> {
	if (!entry) {
		return null;
	}
	return typeof entry === "string" ? entry : await entry.text();
}

export async function toString(
	entry: FormDataEntryValue | null
): Promise<string> {
	return (await serialize(entry)) ?? "";
}
