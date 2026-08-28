import type { Metadata } from "next";
import { SavedLibrary } from "@/components/saved/SavedLibrary";

export const metadata: Metadata = { title: "Guardadas" };
export default function SavedPage() { return <SavedLibrary />; }
