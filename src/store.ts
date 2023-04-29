import { writable } from "svelte/store";

export const endPercentNum = writable<number>(0);
export const showFakePercent = writable<boolean>(true);
export const loadingText = writable<string>("");
export const showEnterButton = writable<boolean>(false);
export const windowOrientation = writable<"landscape" | "portrait">();
