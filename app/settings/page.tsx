import type { Metadata } from "next";
import { SettingsPanel } from "@/components/layout/SettingsPanel";

export const metadata: Metadata = { title: "Ajustes" };
export default function SettingsPage() { return <SettingsPanel />; }
