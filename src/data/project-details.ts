/** Extended write-ups for each project, keyed by slug. */

interface Section {
  heading: string;
  body: string;
}

/** Interactive demo to pin beside the write-up. Add a case here to wire a new one up. */
export type ProjectDemo = "bytefight-replay";

/** Architecture diagram rendered under the write-up. */
export type ProjectDiagram = "bytefight-loop";

/**
 * A headline figure. Keep these to things that are actually measured — an
 * unlabelled or aspirational number is worse than no number at all.
 */
export interface ProjectMetric {
  value: string;
  label: string;
  /** Qualifier shown under the label. Use it to scope the claim honestly. */
  note?: string;
}

export interface ProjectDetail {
  sections: Section[];
  /** When set, the detail page switches to a two-column layout with the demo on the right. */
  demo?: ProjectDemo;
  diagram?: ProjectDiagram;
  metrics?: ProjectMetric[];
}

export const projectDetails: Record<string, ProjectDetail> = {
  "neuron-shapley": {
    sections: [
      {
        heading: "Overview",
        body: "This is an interpretability research project conducted with a faculty advisor. It adapts Neuron Shapley, a method originally built for convolutional networks, to graph neural networks. The goal was to ask a question the GNN explainability field has mostly avoided. Most GNN interpretability works at the input level by finding important subgraphs or node features. This project looks inside the model instead and asks which hidden neurons carry the work, and whether their roles can be characterized.",
      },
      {
        heading: "What was done",
        body: "I ran Neuron Shapley across seven benchmark datasets, using five random seeds and 500 Monte Carlo samples per estimate to get stable attributions. I then designed a set of follow-up experiments to test what the attributions actually mean, including ablation by Shapley sign and a comparison between GCN and GAT architectures.",
      },
      {
        heading: "Key findings",
        body: `The method produces reproducible distributional profiles for each task. The shape of the importance distribution, the count of helpful neurons, and the ablation curve are consistent for a given dataset and architecture.

Individual neuron rankings are not stable across seeds. This is itself a finding. Neuron Shapley characterizes the model class and its capacity utilization, not specific labeled units.

Neuron contribution signs are functionally meaningful. Removing top-ranked neurons frequently improved accuracy, with improvement in eighteen of twenty MUTAG trials, which points to systematic learning of detrimental neurons.

A large-scale experiment ruled out the feature-dimensionality hypothesis, with a correlation of negative 0.055 across the seven datasets. This negative result reframed the contribution toward capacity utilization profiles, functional decomposition, and architectural differences between GCN and GAT.`,
      },
      {
        heading: "Why it matters",
        body: "The work shows what neuron-level attribution can and cannot tell you about a GNN. It is honest about a dead hypothesis and uses that to motivate a stronger framing. It connects to broader interpretability questions about whether models learn clean functional roles or entangled representations.",
      },
    ],
  },

  "clinical-pipeline": {
    sections: [
      {
        heading: "Overview",
        body: "This is a course and personal project exploring distribution-shift robustness for clinical prediction. It is built and validated as a method, and is not yet run on real patient data. The motivating problem is well known in medical AI. A model trained on one hospital often degrades badly at another because it latches onto site-specific artifacts rather than the underlying signal.",
      },
      {
        heading: "What was done",
        body: `I designed a two-stage pipeline that separates representation learning from worst-group optimization.

Stage one learns hospital-invariant representations. It trains with empirical risk minimization and an annealed IRMv1 penalty, gradually increasing the invariance pressure so the encoder learns features that hold across environments rather than memorizing one hospital.

Stage two freezes the trained encoder and trains a fresh prediction head with Group DRO, using exponentiated gradient updates. This targets the worst-performing hospital group directly rather than average performance.`,
      },
      {
        heading: "Why it matters",
        body: "The design reflects a real failure mode in deployed medical AI and a principled response to it. It combines two robustness methods deliberately, with IRM doing representation work and Group DRO doing worst-case optimization, rather than relying on either alone. It demonstrates understanding of the IRM derivation, lambda annealing, and the tradeoffs between invariance and worst-group methods.",
      },
    ],
  },

  watchtower: {
    sections: [
      {
        heading: "Overview",
        body: "WatchTower is a hackathon project that targets aviation safety. It provides pilots with depth-aware spatial awareness and actionable recommendations during the most dangerous phases of flight. It was built but not awarded, and it was praised highly by all of the judges.",
      },
      {
        heading: "What was done",
        body: "The system processes real-time video from a single camera. It uses MiDaS for monocular depth estimation and YOLO for object detection, then combines the two to understand not just what objects are present but how far away they are. It builds point clouds from discretized time intervals and uses them to simulate potential collisions, turning a flat video feed into a forward-looking spatial model.",
      },
      {
        heading: "Why it matters",
        body: "The hard constraint was doing meaningful spatial reasoning from a single camera rather than expensive multi-sensor hardware. Pulling depth and object detection together into a collision simulation under hackathon time pressure shows both systems thinking and the ability to ship a working demo that experts found compelling.",
      },
    ],
  },

  "clarity-coach": {
    sections: [
      {
        heading: "Overview",
        body: "Clarity Coach was built at TreeHacks at Stanford in February 2026 with a team of four, from concept to demo in thirty-six hours. It addresses a gap in language learning tools, which focus on vocabulary and grammar while ignoring spoken delivery. The tool helps ESL speakers build confidence for real situations like interviews and classroom participation.",
      },
      {
        heading: "What was done",
        body: "I led the team and architected a full-stack application with a FastAPI and Uvicorn backend and a JavaScript frontend. The system records short video clips and analyzes posture, eye contact, clarity, and pacing using MediaPipe, OpenCV, and Whisper. I delegated the computer vision and speech-analysis pipelines across the team. We integrated the Claude API and ElevenLabs for conversational feedback, and added gamified progress tracking that saves prior recordings so users can see improvement over time.",
      },
      {
        heading: "Why it matters",
        body: "The project pairs a real human need with a multi-pipeline technical build delivered under deadline. It demonstrates leadership, clean division of a complex stack across a team, and the judgment to ship something polished at Stanford's largest hackathon among more than a thousand participants.",
      },
    ],
  },

  bytefight: {
    demo: "bytefight-replay",
    diagram: "bytefight-loop",
    // Baseline-only on purpose: the post-loop ELO has not been recorded yet, and
    // a stated-but-unmeasured improvement figure would be worse than none.
    metrics: [
      { value: "1578", label: "Baseline ELO", note: "before the loop ran" },
      { value: "#21 / 51", label: "Leaderboard rank", note: "at baseline" },
      { value: "2,232", label: "Lines in bot.py", note: "single-file engine" },
    ],
    sections: [
      {
        heading: "Overview",
        body: "This is a competitive bot for ByteFight Paint, a territory-control game. Beyond the bot itself, the interesting part is the autonomous improvement system built around it, which closes the loop from playing matches to diagnosing weaknesses to patching strategy.",
      },
      {
        heading: "What was done",
        body: `The bot plays Paint using a strategy built around early hill control, beacon-network development, and compounding a stamina engine. Around it I designed an iterative improvement loop. A Playwright script queues scrimmages against higher-ranked opponents, polls for results, and saves match logs. An analysis phase reads the batch and identifies the single biggest pattern causing losses. A patch phase makes exactly one high-impact, generalizable change rather than overfitting to specific opponents. The loop then re-uploads the bot, records the new ELO, and logs every iteration for resumability.

The design includes guard rails. It changes only one strategic thing per iteration, reverts changes that drop ELO across two batches, and spawns research subagents when progress stalls.`,
      },
      {
        heading: "Why it matters",
        body: "This is constraint-driven engineering applied to a competition. It treats bot improvement as a controlled experiment, with one variable changed at a time and a logged history, rather than guesswork. It also shows comfort with browser automation and building autonomous, self-correcting systems.",
      },
    ],
  },
};
