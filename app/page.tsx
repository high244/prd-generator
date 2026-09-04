import PRDStudio from "@/components/PRDStudio";

export const metadata = {
  title: "PRD Architect Studio — Platform Perancangan PRD Berstandar Industri",
  description:
    "Susun Product Requirement Document (PRD) software berstandar industri dengan AI, skema database PostgreSQL, pemetaan fitur P0/P1/P2, dan prompt siap pakai untuk Cursor & Claude Code.",
};

export default function Home() {
  return <PRDStudio />;
}
