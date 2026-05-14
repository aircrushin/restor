export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function localeFromPath(pathname: string): Locale | null {
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment && isLocale(segment) ? segment : null;
}

export function localizedPath(locale: Locale, path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${normalized === "/" ? "" : normalized}`;
}

export const dictionaries = {
  en: {
    metadata: {
      title: "Restor - AI audio enhancement platform",
      description:
        "Enhance generated music and voice with natural timing, richer texture, and production-ready WAV output.",
    },
    nav: {
      how: "How it works",
      science: "Quality",
      launch: "Start processing",
      language: "中文",
    },
    footer: {
      tagline: "RESTOR · PRIVATE AUDIO PROCESSING · PRODUCTION-READY OUTPUT",
      note: "Use Restor only with audio you own or are authorized to process.",
    },
    home: {
      tag: "AI Audio Enhancement",
      titleLead: "Better AI",
      titleAccent: "Audio",
      intro:
        "Turn generated music and voice into cleaner, warmer, more natural audio that is ready for review, publishing, or client demos.",
      introBrand:
        "Restor applies a focused enhancement pipeline that improves texture, timing, space, and high-frequency detail in one streamlined workflow.",
      ctaPrimary: "Start processing",
      ctaSecondary: "See workflow",
      stats: [
        { label: "modules", value: "4" },
        { label: "avg job", value: "<12s" },
        { label: "file limit", value: "60MB" },
      ],
      pipeline: {
        eyebrow: "01 · Workflow",
        title: "A complete enhancement pass for generated audio.",
        cards: [
          {
            number: "01",
            title: "Spectral Cleanup",
            body: "Smooth harsh spectral patterns and add subtle analog-style saturation so the output feels less brittle and more finished.",
            tag: "texture",
          },
          {
            number: "02",
            title: "Timing Polish",
            body: "Apply small transient-level timing and energy adjustments to reduce rigid, grid-like movement while preserving the original groove.",
            tag: "timing",
          },
          {
            number: "03",
            title: "Spatial Depth",
            body: "Introduce controlled phase variation and short-room reflections to give dry AI output a more believable sense of space.",
            tag: "space",
          },
          {
            number: "04",
            title: "Detail Refine",
            body: "Rebalance high-frequency texture and reduce fixed digital grain while keeping the core voice, mix, and character intact.",
            tag: "detail",
          },
        ],
      },
      science: {
        eyebrow: "02 · Quality Engine",
        title: "Built around the artifacts listeners notice first.",
        fingerprint: "issue",
        detector: "common symptom",
        counter: "restor improvement",
        rows: [
          {
            label: "Harsh tone",
            detector:
              "Generated audio often carries brittle spectral peaks that make music and speech sound over-processed.",
            counter:
              "Targeted spectral shaping and light saturation improve warmth without masking the source.",
          },
          {
            label: "Rigid timing",
            detector:
              "Perfectly aligned transients can make drums, vocals, and speech rhythms feel mechanical.",
            counter:
              "Micro timing and energy variation adds a more natural performance feel while keeping tempo stable.",
          },
          {
            label: "Flat space",
            detector:
              "Very dry AI output can feel pasted onto the mix instead of placed in a believable environment.",
            counter:
              "Controlled phase and room cues create subtle depth that translates better across speakers.",
          },
          {
            label: "Digital grain",
            detector:
              "High-frequency texture can sound static, noisy, or disconnected from the rest of the signal.",
            counter:
              "A restrained detail pass smooths fixed grain while protecting clarity and intelligibility.",
          },
        ],
      },
      finalCta: {
        title: "Process a track in minutes.",
        body: "Upload an audio file, choose the enhancement modules, set intensity, and export a polished WAV from a simple private workflow.",
        button: "Start processing",
      },
      visual: {
        title: "Quality",
        analysis: "SIGNAL · ENHANCEMENT",
        live: "live",
      },
    },
    process: {
      eyebrow: "ENHANCEMENT · SETUP",
      title: "Configure your audio enhancement.",
      description:
        "Upload a file, choose the enhancement modules, set the processing intensity, and export a production-ready WAV.",
      source: "Source audio",
      modules: "Modules",
      submit: "Submit",
      readyPrefix: "Ready to process",
      readySuffix: ".",
      empty: "Add a file above to enable processing.",
      noModules: "No modules selected - the output will pass through unchanged.",
      submitting: "Submitting...",
      button: "Process audio",
      uploadError: "unexpected upload error",
      uploadFailed: "upload failed",
    },
    dropzone: {
      unsupported: "Unsupported format. Use WAV / MP3 / FLAC / M4A / AAC / OGG.",
      tooLargePrefix: "File too large",
      tooLargeSuffix: "Max 60 MB.",
      title: "Drop an audio file here",
      browsePrefix: "or",
      browseAction: "click to browse",
      privacy: "MAX 60 MB · 100% private · auto-purged",
      clear: "clear",
    },
    options: {
      mastering: {
        eyebrow: "ONE-CLICK · MASTER",
        label: "Clip-safe mastering",
        description: "Set release-ready level with conservative peak protection.",
        detail:
          "Adds light glue compression, controlled loudness lift, and a -1 dBFS peak ceiling so the output stays clean instead of distorted.",
        enabled: "on",
        disabled: "off",
      },
      modules: [
        {
          id: "spectral",
          label: "Spectral Cleanup",
          shortLabel: "01 · SPEC",
          description: "Smooth harsh peaks and add subtle analog warmth.",
          detail:
            "Targets brittle frequency patterns and applies controlled saturation so generated audio feels more balanced and mix-ready.",
        },
        {
          id: "humanizer",
          label: "Timing Polish",
          shortLabel: "02 · TIME",
          description: "Reduce rigid timing with small transient-level movement.",
          detail:
            "Adds subtle timing and energy variation to onsets while preserving the original tempo, phrasing, and groove.",
        },
        {
          id: "phase",
          label: "Spatial Depth",
          shortLabel: "03 · PHASE",
          description: "Add controlled space and depth to dry AI output.",
          detail:
            "Introduces subtle phase variation and short-room response so the audio sits more naturally in playback environments.",
        },
        {
          id: "watermark",
          label: "Detail Refine",
          shortLabel: "04 · DETAIL",
          description: "Smooth static high-frequency texture and digital grain.",
          detail:
            "Applies a light re-texturing pass to improve high-end consistency while protecting clarity and source character.",
        },
      ],
      intensityLabel: "PROCESSING · INTENSITY",
      intensityHelp: "How strongly the selected modules should be applied",
      subtle: "subtle",
      balanced: "balanced",
      aggressive: "aggressive",
    },
    job: {
      eyebrow: "JOB · STATUS",
      title: "Enhancement in progress.",
      description:
        "Live processing status from the worker. The download link appears as soon as the WAV is ready.",
      notFound: "Job not found. It may have expired or the worker restarted.",
      pollingFailed: "polling failed",
      complete: "Processing complete",
      failed: "Processing failed",
      running: "Enhancement pipeline running",
      doneIn: "Done in",
      output: "output",
      unknownFailure: "Unknown failure",
      stage: "Stage",
      progress: "PROGRESS",
      download: "Download .wav",
      another: "Process another",
      emptyStage: "-",
      stages: [
        { id: "queued", label: "Queued" },
        { id: "loading", label: "Loading audio" },
        { id: "analysis", label: "Analyze content" },
        { id: "spectral", label: "Spectral reshape" },
        { id: "humanizer", label: "Humanizer" },
        { id: "phase", label: "Phase entropy" },
        { id: "watermark", label: "Detail refine" },
        { id: "loudness", label: "Match loudness" },
        { id: "mastering", label: "Mastering" },
        { id: "writing", label: "Encode WAV" },
        { id: "done", label: "Done" },
      ],
    },
  },
  zh: {
    metadata: {
      title: "Restor - AI 音频增强平台",
      description:
        "为生成音乐和语音提供自然化增强、细节优化和可交付 WAV 输出。",
    },
    nav: {
      how: "工作原理",
      science: "音质能力",
      launch: "开始处理",
      language: "EN",
    },
    footer: {
      tagline: "RESTOR · 私密音频处理 · 可交付输出",
      note: "请仅处理你拥有或已获授权的音频。",
    },
    home: {
      tag: "AI 音频增强",
      titleLead: "更好的",
      titleAccent: "AI 音频",
      intro:
        "把生成音乐和语音处理成更干净、更温暖、更自然的版本，适合评审、发布和客户演示。",
      introBrand:
        "Restor 通过一条清晰的增强流程，同时优化频谱质感、节奏自然度、空间感和高频细节。",
      ctaPrimary: "开始处理",
      ctaSecondary: "查看流程",
      stats: [
        { label: "增强模块", value: "4" },
        { label: "平均任务", value: "<12s" },
        { label: "文件上限", value: "60MB" },
      ],
      pipeline: {
        eyebrow: "01 · 工作流",
        title: "面向生成音频的一次完整增强。",
        cards: [
          {
            number: "01",
            title: "频谱清理",
            body: "平滑刺耳的频谱峰值，并加入轻微模拟质感，让输出更温暖、更接近可交付状态。",
            tag: "纹理",
          },
          {
            number: "02",
            title: "节奏优化",
            body: "对瞬态做小幅时间和能量调整，减少机械网格感，同时保留原本速度和律动。",
            tag: "节奏",
          },
          {
            number: "03",
            title: "空间增强",
            body: "加入受控相位变化和短房间响应，让偏干的 AI 输出拥有更可信的空间层次。",
            tag: "空间",
          },
          {
            number: "04",
            title: "细节精修",
            body: "重新平衡高频纹理，减少固定数字颗粒，同时保留原始人声、混音和音色特征。",
            tag: "细节",
          },
        ],
      },
      science: {
        eyebrow: "02 · 音质引擎",
        title: "优先处理听众最容易察觉的生成痕迹。",
        fingerprint: "问题",
        detector: "常见表现",
        counter: "Restor 优化",
        rows: [
          {
            label: "音色偏硬",
            detector:
              "生成音频常见刺耳峰值和过度处理感，音乐与语音听起来偏冷、偏薄。",
            counter:
              "定向频谱塑形配合轻微饱和，在不遮盖原声的前提下提升温暖度。",
          },
          {
            label: "节奏生硬",
            detector:
              "完全对齐的瞬态会让鼓点、人声和语音停顿显得机械。",
            counter:
              "毫秒级时间和能量变化让表现更自然，同时保持整体速度稳定。",
          },
          {
            label: "空间偏平",
            detector:
              "过干的 AI 输出容易像贴在混音表面，而不是处在可信的声音环境里。",
            counter:
              "受控相位与房间线索带来轻微深度，在不同播放设备上更稳定。",
          },
          {
            label: "数字颗粒",
            detector:
              "高频纹理可能固定、发噪，或与主体声音分离。",
            counter:
              "轻量细节处理平滑固定颗粒，同时保护清晰度和可懂度。",
          },
        ],
      },
      finalCta: {
        title: "几分钟完成一段音频增强。",
        body: "上传音频，选择增强模块，设定处理强度，然后从私密流程中导出一份可交付 WAV。",
        button: "开始处理",
      },
      visual: {
        title: "音质",
        analysis: "信号 · 增强",
        live: "实时",
      },
    },
    process: {
      eyebrow: "增强 · 设置",
      title: "配置音频增强任务。",
      description: "上传音频，选择增强模块，设定整体强度，然后导出可交付的 WAV 文件。",
      source: "源音频",
      modules: "增强模块",
      submit: "提交",
      readyPrefix: "准备处理",
      readySuffix: "。",
      empty: "先添加一个文件，才能开始处理。",
      noModules: "未选择任何模块，输出会基本保持原样。",
      submitting: "提交中...",
      button: "处理音频",
      uploadError: "上传时发生未知错误",
      uploadFailed: "上传失败",
    },
    dropzone: {
      unsupported: "暂不支持该格式。请使用 WAV / MP3 / FLAC / M4A / AAC / OGG。",
      tooLargePrefix: "文件过大",
      tooLargeSuffix: "最大 60 MB。",
      title: "把音频文件拖到这里",
      browsePrefix: "或",
      browseAction: "点击选择文件",
      privacy: "最大 60 MB · 100% 私密 · 自动清理",
      clear: "清除",
    },
    options: {
      mastering: {
        eyebrow: "一键 · 母带",
        label: "防削波母带",
        description: "自动整理响度和峰值，让输出更接近发布状态。",
        detail:
          "使用轻量胶合压缩、保守响度提升和 -1 dBFS 峰值上限；没有足够余量时会优先保持干净，不硬推到失真。",
        enabled: "已开",
        disabled: "关闭",
      },
      modules: [
        {
          id: "spectral",
          label: "频谱清理",
          shortLabel: "01 · 频谱",
          description: "平滑刺耳峰值，加入轻微模拟温暖感。",
          detail:
            "针对偏冷、偏硬的频率模式做定向优化，让生成音频更均衡、更接近可混音状态。",
        },
        {
          id: "humanizer",
          label: "节奏优化",
          shortLabel: "02 · 时间",
          description: "用小幅瞬态变化减少机械网格感。",
          detail:
            "给起音点加入轻微时间和能量变化，同时保留原始速度、语气和律动。",
        },
        {
          id: "phase",
          label: "空间增强",
          shortLabel: "03 · 相位",
          description: "为偏干的 AI 输出加入受控空间层次。",
          detail:
            "加入轻微相位变化和短房间响应，让声音在播放环境里更自然，不会变成明显混响。",
        },
        {
          id: "watermark",
          label: "细节精修",
          shortLabel: "04 · 细节",
          description: "平滑固定高频纹理和数字颗粒。",
          detail:
            "轻量重塑高频一致性，改善清晰度与细节稳定性，同时尽量保留原始音色。",
        },
      ],
      intensityLabel: "处理 · 强度",
      intensityHelp: "控制所选增强模块的整体力度",
      subtle: "轻微",
      balanced: "均衡",
      aggressive: "强力",
    },
    job: {
      eyebrow: "任务 · 状态",
      title: "正在增强音频。",
      description: "这里会实时显示处理进度。WAV 准备好后，下载按钮会自动出现。",
      notFound: "任务不存在，可能已经过期，或本地 worker 重启过。",
      pollingFailed: "轮询失败",
      complete: "处理完成",
      failed: "处理失败",
      running: "增强流程运行中",
      doneIn: "完成耗时",
      output: "输出文件",
      unknownFailure: "未知错误",
      stage: "阶段",
      progress: "进度",
      download: "下载 .wav",
      another: "继续处理",
      emptyStage: "-",
      stages: [
        { id: "queued", label: "排队中" },
        { id: "loading", label: "加载音频" },
        { id: "analysis", label: "分析内容" },
        { id: "spectral", label: "频谱清理" },
        { id: "humanizer", label: "节奏优化" },
        { id: "phase", label: "空间增强" },
        { id: "watermark", label: "细节精修" },
        { id: "loudness", label: "响度匹配" },
        { id: "mastering", label: "母带处理" },
        { id: "writing", label: "编码 WAV" },
        { id: "done", label: "完成" },
      ],
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)[Locale];
