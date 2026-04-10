"use client";
import { useMemo } from "react";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];
}

export function useCountry(): string {
  return useMemo(() => getCookie("x-country") ?? "US", []);
}
