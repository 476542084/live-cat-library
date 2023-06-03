import { writable } from "svelte/store";
import { noop } from 'svelte/internal'
export const endPercentNum = writable<number>(0);
export const showFakePercent = writable<boolean>(true);
export const loadingText = writable<string>("");

export const autoLoadingVideo = writable<boolean>(true);
export const autoLoadingVideoHandler = writable<() => void>(noop) 

export const windowOrientation = writable<"landscape" | "portrait">();

export const currentPercentNum = writable<number>(0);