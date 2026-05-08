"use client";

import type { JobOptions } from "@/lib/python-client";

export type Module = "spectral" | "humanizer" | "phase" | "watermark";

type ModuleCopy = {
  id: Module;
  label: string;
  shortLabel: string;
  description: string;
  detail: string;
};

type Copy = {
  modules: readonly ModuleCopy[];
  intensityLabel: string;
  intensityHelp: string;
  subtle: string;
  balanced: string;
  aggressive: string;
};

const MODULES: ModuleCopy[] = [
  {
    id: "spectral",
    label: "Spectral Reshape",
    shortLabel: "01 · SPEC",
    description: "Erase vocoder peaks. Add tape & tube saturation.",
    detail: "Detects periodic peaks left by transposed-convolution synthesis and notches them, then layers analog-style nonlinearity to break the MFCC fingerprint.",
  },
  {
    id: "humanizer",
    label: "Rhythm Humanizer",
    shortLabel: "02 · TIME",
    description: "Micro-jitter onsets. Vary velocity per hit.",
    detail: "Detects onsets and shifts each by ±4–16 ms with small velocity drift so the timing grid stops being mathematically perfect.",
  },
  {
    id: "phase",
    label: "Phase Randomize",
    shortLabel: "03 · PHASE",
    description: "Inject mid/high-band phase entropy + room IR.",
    detail: "Real recordings drift in phase because of room reflections. We raise phase entropy in the 1.5–18 kHz band and convolve a tiny synthetic room.",
  },
  {
    id: "watermark",
    label: "Watermark Wash",
    shortLabel: "04 · WMARK",
    description: "Diffusion-style re-noising vs SynthID.",
    detail: "Adds controlled Gaussian perturbation, blurs and subtracts to mimic one diffusion micro-step, plus upper-band magnitude/phase wobble that disrupts spectral watermarks.",
  },
];

const defaultCopy: Copy = {
  modules: MODULES,
  intensityLabel: "GLOBAL · INTENSITY",
  intensityHelp: "How aggressive each module should be",
  subtle: "subtle",
  balanced: "balanced",
  aggressive: "aggressive",
};

type Props = {
  value: JobOptions;
  onChange: (next: JobOptions) => void;
  disabled?: boolean;
  copy?: Copy;
};

export function ProcessingOptions({ value, onChange, disabled = false, copy = defaultCopy }: Props) {
  const set = <K extends keyof JobOptions>(key: K, v: JobOptions[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <div className={disabled ? "opacity-60 pointer-events-none" : ""}>
      <div className="grid gap-3 md:grid-cols-2">
        {copy.modules.map((m) => {
          const enabled = value[m.id];
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => set(m.id, !enabled)}
              className={[
                "group relative min-h-44 overflow-hidden text-left rounded-[var(--radius-lg)] border transition-all p-4 sm:p-5",
                "hover:border-[var(--accent)]/50 hover:bg-[var(--bg-surface)]/80",
                enabled
                  ? "border-[var(--accent)]/60 bg-[var(--bg-surface)]"
                  : "border-[var(--line)] bg-[var(--bg-elevated)]/60",
              ].join(" ")}
              aria-pressed={enabled}
            >
              {enabled && (
                <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" />
              )}
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] tracking-[0.16em] text-[var(--text-faint)] sm:tracking-[0.25em]">
                      {m.shortLabel}
                    </span>
                    <span
                      className={[
                        "inline-block h-1.5 w-1.5 rounded-full transition-all",
                        enabled
                          ? "bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]"
                          : "bg-[var(--text-faint)]",
                      ].join(" ")}
                    />
                  </div>
                  <h4 className="text-base font-medium text-[var(--text-primary)]">
                    {m.label}
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)] leading-snug">
                    {m.description}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed pt-2 max-w-[42ch]">
                    {m.detail}
                  </p>
                </div>
                <Toggle on={enabled} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--bg-elevated)]/60 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] tracking-[0.25em] text-[var(--text-faint)]">
              {copy.intensityLabel}
            </div>
            <div className="mt-1 text-sm text-[var(--text-secondary)]">
              {copy.intensityHelp}
            </div>
          </div>
          <div className="font-mono text-2xl text-[var(--accent)]">
            {Math.round(value.intensity * 100)}
            <span className="text-sm text-[var(--text-muted)]">%</span>
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(value.intensity * 100)}
          onChange={(e) => set("intensity", Number(e.currentTarget.value) / 100)}
          className="mt-4 w-full accent-[var(--accent)]"
        />
        <div className="mt-1 flex justify-between text-[10px] font-mono uppercase tracking-[0.08em] text-[var(--text-faint)] sm:tracking-[0.2em]">
          <span>{copy.subtle}</span>
          <span>{copy.balanced}</span>
          <span>{copy.aggressive}</span>
        </div>
      </div>
    </div>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={[
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        on ? "bg-[var(--accent-deep)]" : "bg-[var(--bg-base)] border border-[var(--line)]",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-4 w-4 transform rounded-full transition-transform",
          on
            ? "translate-x-6 bg-[var(--accent-strong)] shadow-[0_0_8px_var(--accent)]"
            : "translate-x-1 bg-[var(--text-muted)]",
        ].join(" ")}
      />
    </span>
  );
}
