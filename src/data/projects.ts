export interface Project {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  links?: { label: string; url: string }[];
}

export const projects: Project[] = [
  {
    slug: "neuron-shapley",
    title: "Neuron Shapley for Graph Neural Networks",
    description:
      "Applying neuron-level Shapley attribution to GCN and GAT models to understand what individual hidden units actually do.",
    tags: [
      "Interpretability",
      "Graph Neural Networks",
      "PyTorch Geometric",
      "Research",
    ],
    // Repo link removed: github.com/Pv10101/GCNS returns 404 to logged-out
    // visitors (private or renamed). Restore once it is public:
    //   links: [{ label: "Repo", url: "https://github.com/Pv10101/GCNS" }],
  },
  {
    slug: "clinical-pipeline",
    title: "Invariant Clinical Prediction Pipeline",
    description:
      "A two-stage training pipeline designed to stay robust when a clinical model is deployed across hospitals it was not trained on.",
    tags: ["Robustness", "IRM", "Group DRO", "Medical AI", "PyTorch"],
  },
  {
    slug: "watchtower",
    title: "WatchTower — Pilot Spatial Awareness",
    description:
      "A single-camera pilot assistance system that builds depth-aware spatial awareness to flag potential collisions during critical flight phases.",
    tags: ["Computer Vision", "MiDaS", "YOLO", "OpenCV", "Flask", "Hackathon"],
    links: [
      { label: "Devpost", url: "https://devpost.com/software/watchtower-fulnqt" },
    ],
  },
  {
    slug: "clarity-coach",
    title: "Clarity Coach",
    description:
      "An AI speaking coach built at TreeHacks that gives real-time feedback on how you present, aimed at ESL speakers preparing for high-stakes moments.",
    tags: ["FastAPI", "MediaPipe", "Whisper", "Hackathon"],
    // The linked repo is only the Node/Express audio backend — the FastAPI +
    // MediaPipe video pipeline lives elsewhere. Devpost leads because it shows
    // the whole project; the repo label says what it actually contains so the
    // link does not oversell itself.
    links: [
      {
        label: "Devpost",
        url: "https://devpost.com/software/clarity-coach",
      },
      {
        label: "Audio backend repo",
        url: "https://github.com/SamhitaK10/clarity-coach",
      },
    ],
  },
  {
    slug: "bytefight",
    title: "ByteFight Paint Bot",
    description:
      "A competitive game-playing agent that improves itself through an automated analyze-patch-test loop.",
    tags: ["Game AI", "Automation", "Playwright", "Python"],
    // Repo link removed: github.com/Pv10101/bytefightbot returns 404 to
    // logged-out visitors. The plan is a curated public showcase repo (keeping
    // the competition bot private); link that here once it exists.
    links: [
      { label: "Watch a match replay", url: "/projects/bytefight/replay" },
    ],
  },
];
