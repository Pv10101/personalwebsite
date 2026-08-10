import type { Metadata } from "next";
import { ReplayPanel } from "@/components/bytefight";

export const metadata: Metadata = {
  title: "ByteFight Replay",
  description:
    "Interactive replay player for ByteFight matches played by my paint bot.",
};

export default function ByteFightReplayPage() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      {/* Same panel as the project page — only the width and the link differ. */}
      <ReplayPanel
        link={{ href: "/projects/bytefight", label: "← ByteFight Paint Bot" }}
      />
    </section>
  );
}
