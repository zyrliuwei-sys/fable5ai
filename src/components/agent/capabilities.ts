import {
  Sparkles,
  MessageSquare,
  ImagePlus,
  Video,
  Presentation,
  FileText,
  BarChart3,
  Music,
  Search,
  Contact,
  Film,
  type LucideIcon,
} from "lucide-react";

/**
 * Agent capability modes — cloned from chatlyai.app/agent.
 *
 * Each mode adapts the assistant's behaviour via a short instruction appended
 * to the server system prompt (see POST /api/agent/chat `mode`). Responses
 * always come back as text through the existing OpenAI-compatible endpoint —
 * for non-text modalities the prompt asks the model to describe/structure the
 * artefact (storyboard, Mermaid, slide Markdown, etc.), matching the base
 * system prompt's "guide the user" guidance.
 *
 * Labels/placeholders live in messages/{en,zh}.json under `agent.cap.<id>.*`.
 */
export type CapabilityId =
  | "autothink"
  | "chat"
  | "image"
  | "video"
  | "slides"
  | "docs"
  | "graphs"
  | "music"
  | "research"
  | "resume"
  | "motion";

export type Capability = {
  id: CapabilityId;
  /** i18n key for the visible label, e.g. agent.cap.slides.label */
  labelKey: string;
  /** i18n key for the composer placeholder, e.g. agent.cap.slides.placeholder */
  placeholderKey: string;
  /** Instruction appended to the system prompt when this mode is active. */
  prompt: string;
  icon: LucideIcon;
};

export const CAPABILITIES: Capability[] = [
  {
    id: "autothink",
    labelKey: "agent.cap.autothink.label",
    placeholderKey: "agent.cap.autothink.placeholder",
    prompt: "",
    icon: Sparkles,
  },
  {
    id: "chat",
    labelKey: "agent.cap.chat.label",
    placeholderKey: "agent.cap.chat.placeholder",
    prompt: "",
    icon: MessageSquare,
  },
  {
    id: "image",
    labelKey: "agent.cap.image.label",
    placeholderKey: "agent.cap.image.placeholder",
    prompt:
      "The user wants an image. You respond in text, so describe the image in vivid, specific detail and give a ready-to-use prompt for an image generator.",
    icon: ImagePlus,
  },
  {
    id: "video",
    labelKey: "agent.cap.video.label",
    placeholderKey: "agent.cap.video.placeholder",
    prompt:
      "The user wants a video. Produce a concise storyboard / shot list in Markdown and include a generation prompt.",
    icon: Video,
  },
  {
    id: "slides",
    labelKey: "agent.cap.slides.label",
    placeholderKey: "agent.cap.slides.placeholder",
    prompt:
      "The user wants a slide deck. Output a structured deck in Markdown — one `## Slide N: Title` heading per slide, followed by concise bullet points.",
    icon: Presentation,
  },
  {
    id: "docs",
    labelKey: "agent.cap.docs.label",
    placeholderKey: "agent.cap.docs.placeholder",
    prompt:
      "The user wants a document. Produce a well-structured Markdown document with clear headings, sections, and formatting.",
    icon: FileText,
  },
  {
    id: "graphs",
    labelKey: "agent.cap.graphs.label",
    placeholderKey: "agent.cap.graphs.placeholder",
    prompt:
      "The user wants a chart or graph. Provide a Mermaid code block for the chart and explain the underlying data.",
    icon: BarChart3,
  },
  {
    id: "music",
    labelKey: "agent.cap.music.label",
    placeholderKey: "agent.cap.music.placeholder",
    prompt:
      "The user wants music. Describe the composition (tempo, key, instruments, sections) and provide a generation prompt.",
    icon: Music,
  },
  {
    id: "research",
    labelKey: "agent.cap.research.label",
    placeholderKey: "agent.cap.research.placeholder",
    prompt:
      "The user wants deep research. Provide a thorough research brief with clear sections, key findings, and reasoned analysis.",
    icon: Search,
  },
  {
    id: "resume",
    labelKey: "agent.cap.resume.label",
    placeholderKey: "agent.cap.resume.placeholder",
    prompt:
      "The user wants a resume. Produce a tailored, professional resume in Markdown based on their experience and the provided job description.",
    icon: Contact,
  },
  {
    id: "motion",
    labelKey: "agent.cap.motion.label",
    placeholderKey: "agent.cap.motion.placeholder",
    prompt:
      "The user wants motion design. Describe the animation / motion sequence step by step, including timing, easing, and layers.",
    icon: Film,
  },
];

export const DEFAULT_CAPABILITY: CapabilityId = "autothink";

export function getCapability(id: CapabilityId): Capability {
  return CAPABILITIES.find((c) => c.id === id) ?? CAPABILITIES[0];
}
