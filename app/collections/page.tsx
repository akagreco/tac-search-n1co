import type { Metadata } from "next";
import { CollectionManager } from "@/components/collections/CollectionManager";

export const metadata: Metadata = { title: "Colecciones" };
export default function CollectionsPage() { return <CollectionManager />; }
