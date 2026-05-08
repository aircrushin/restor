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
      title: "Restor - De-AI your audio",
      description:
        "Strip the AI signature off generated music and voice. Spectral reshaping, rhythm humanization, phase entropy, watermark wash - all in one pipeline.",
    },
    nav: {
      how: "How it works",
      science: "Science",
      launch: "Launch app",
      language: "中文",
    },
    footer: {
      tagline: "RESTOR · LOCAL_PROCESSING_ONLY · NO_TRAINING_DATA",
      note: "Use only on audio you own or have rights to. No piracy, no fraud.",
    },
    home: {
      tag: "Audio De-AI Processor",
      titleLead: "Make your AI audio",
      titleAccent: "undetectable.",
      intro:
        "Modern detectors flag AI music and voice through spectral combs, perfect timing and coherent phase.",
      introBrand:
        "Restor rewrites all four signatures in one pipeline - no manual mastering, no detector cat-and-mouse.",
      ctaPrimary: "Process audio",
      ctaSecondary: "How it works",
      stats: [
        { label: "modules", value: "4" },
        { label: "avg job", value: "< 12s" },
        { label: "upload cap", value: "60 MB" },
      ],
      pipeline: {
        eyebrow: "01 · Pipeline",
        title: "Four passes. One signal-clean output.",
        cards: [
          {
            number: "01",
            title: "Spectral Reshape",
            body: "STFT -> autocorrelation peak detection -> IIR notches at suspected vocoder bins -> tape/tube saturation. The MFCC contour drifts off the AI-trained classifier manifold.",
            tag: "anti-comb",
          },
          {
            number: "02",
            title: "Rhythm Humanizer",
            body: "Onset detection slices the signal at every transient. Each slice is shifted by +/-4-16 ms with a small velocity drift so the timing grid stops being mathematically perfect.",
            tag: "anti-grid",
          },
          {
            number: "03",
            title: "Phase Randomize",
            body: "Mid/high band phase angles take a controlled random walk. A short synthetic room IR reintroduces the stochastic phase drift of a real microphone in real space.",
            tag: "anti-coherence",
          },
          {
            number: "04",
            title: "Watermark Wash",
            body: "Diffusion-style re-noise: add Gaussian perturbation, blur, subtract - one micro forward-reverse cycle. Upper-band magnitude wobble disrupts the bins SynthID-class watermarks ride.",
            tag: "anti-watermark",
          },
        ],
      },
      science: {
        eyebrow: "02 · Why it works",
        title: "Detectors look for four fingerprints. We rewrite all of them.",
        fingerprint: "fingerprint",
        detector: "detector",
        counter: "counter",
        rows: [
          {
            label: "Spectral comb",
            detector:
              "Detectors compute the autocorrelation of the average magnitude spectrum and flag periodic peaks left by transposed-convolution synthesis.",
            counter:
              "We notch the offending bins with narrow IIR filters and overlay analog-style nonlinearity. The comb disappears, the timbre stays.",
          },
          {
            label: "Quantized timing",
            detector:
              "Generative models snap onsets to grid positions. Inter-onset intervals carry an unnaturally narrow distribution.",
            counter:
              "Per-onset jitter draws from a Gaussian centered on zero, widening the IOI distribution to match human-played reference statistics.",
          },
          {
            label: "Phase coherence",
            detector:
              "Real recordings have high phase entropy - room reflections decorrelate the signal. AI output is too clean.",
            counter:
              "Mid/high band phase is randomized within frequency-dependent bounds, then convolved with a small synthetic room IR.",
          },
          {
            label: "Statistical watermark",
            detector:
              "SynthID-class watermarks embed a low-energy pattern that survives MP3 transcoding but not aggressive diffusion noise.",
            counter:
              "A single forward/reverse diffusion micro-step plus upper-band magnitude wobble pushes watermark confidence below the detection threshold.",
          },
        ],
      },
      finalCta: {
        title: "Drop a track. Get a clean version back.",
        body: "Everything runs locally on your worker. Files auto-purge after processing. No accounts in the MVP.",
        button: "Launch processor",
      },
      visual: {
        analysis: "SIGNAL · ANALYSIS",
        live: "live",
      },
    },
    process: {
      eyebrow: "CONFIG · PIPELINE",
      title: "Configure the run.",
      description:
        "Drop your audio, pick the modules to engage, dial intensity, and submit. The worker will stream progress here.",
      source: "Source audio",
      modules: "Modules",
      submit: "Submit",
      readyPrefix: "Ready to process",
      readySuffix: ".",
      empty: "Add a file above to enable processing.",
      noModules: "No modules selected - output will pass through unchanged.",
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
      modules: [
        {
          id: "spectral",
          label: "Spectral Reshape",
          shortLabel: "01 · SPEC",
          description: "Erase vocoder peaks. Add tape & tube saturation.",
          detail:
            "Detects periodic peaks left by transposed-convolution synthesis and notches them, then layers analog-style nonlinearity to break the MFCC fingerprint.",
        },
        {
          id: "humanizer",
          label: "Rhythm Humanizer",
          shortLabel: "02 · TIME",
          description: "Micro-jitter onsets. Vary velocity per hit.",
          detail:
            "Detects onsets and shifts each by +/-4-16 ms with small velocity drift so the timing grid stops being mathematically perfect.",
        },
        {
          id: "phase",
          label: "Phase Randomize",
          shortLabel: "03 · PHASE",
          description: "Inject mid/high-band phase entropy + room IR.",
          detail:
            "Real recordings drift in phase because of room reflections. We raise phase entropy in the 1.5-18 kHz band and convolve a tiny synthetic room.",
        },
        {
          id: "watermark",
          label: "Watermark Wash",
          shortLabel: "04 · WMARK",
          description: "Diffusion-style re-noising vs SynthID.",
          detail:
            "Adds controlled Gaussian perturbation, blurs and subtracts to mimic one diffusion micro-step, plus upper-band magnitude/phase wobble that disrupts spectral watermarks.",
        },
      ],
      intensityLabel: "GLOBAL · INTENSITY",
      intensityHelp: "How aggressive each module should be",
      subtle: "subtle",
      balanced: "balanced",
      aggressive: "aggressive",
    },
    job: {
      eyebrow: "RUN · STATUS",
      title: "De-AI in progress.",
      description:
        "Live readout from the worker. We'll surface the download link as soon as the pipeline completes.",
      notFound: "Job not found. It may have expired or the worker restarted.",
      pollingFailed: "polling failed",
      complete: "Processing complete",
      failed: "Processing failed",
      running: "De-AI pipeline running",
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
        { id: "watermark", label: "Wash watermark" },
        { id: "loudness", label: "Match loudness" },
        { id: "writing", label: "Encode WAV" },
        { id: "done", label: "Done" },
      ],
    },
  },
  zh: {
    metadata: {
      title: "Restor - 让 AI 音频听起来更自然",
      description:
        "让生成音乐和语音少一点机器味，多一点真实录制的自然感。",
    },
    nav: {
      how: "工作原理",
      science: "技术依据",
      launch: "开始处理",
      language: "EN",
    },
    footer: {
      tagline: "RESTOR · 本地处理 · 不拿你的音频做训练",
      note: "请仅处理你拥有或已获授权的音频。禁止盗版、欺诈等用途。",
    },
    home: {
      tag: "AI 音频自然化工具",
      titleLead: "让你的 AI 音频",
      titleAccent: "更像真实录制。",
      intro:
        "AI 音乐和语音常常太整齐、太干净，也因此容易留下生成痕迹。",
      introBrand:
        "Restor 会自动处理这些不自然的细节，让声音保留原本风格，同时更接近真实录音。",
      ctaPrimary: "处理音频",
      ctaSecondary: "工作原理",
      stats: [
        { label: "自然化步骤", value: "4" },
        { label: "平均任务", value: "< 12s" },
        { label: "上传上限", value: "60 MB" },
      ],
      pipeline: {
        eyebrow: "01 · 处理流程",
        title: "四步处理，让声音自然一点。",
        cards: [
          {
            number: "01",
            title: "柔化机器感",
            body: "AI 合成音频有时会在频谱里留下很规则的纹路。Restor 会轻轻削弱这些痕迹，再补一点类似模拟设备的细微质感。",
            tag: "频谱",
          },
          {
            number: "02",
            title: "放松节奏",
            body: "真实演奏和说话不会每一下都卡在完美网格上。这里会加入非常轻微的时间和力度变化，让节奏更有人味。",
            tag: "时间",
          },
          {
            number: "03",
            title: "加入空间感",
            body: "现实里的麦克风会受到房间反射影响，声音不会完全平滑干净。Restor 会补上一点受控的空间变化，让声音更像在真实环境里发生。",
            tag: "空间",
          },
          {
            number: "04",
            title: "打散隐藏模式",
            body: "有些生成音频会带着很弱、很隐蔽的统计模式。Restor 会做一次细微的重新纹理化，尽量减少这类模式的稳定性。",
            tag: "纹理",
          },
        ],
      },
      science: {
        eyebrow: "02 · 背后的逻辑",
        title: "很多生成痕迹都来自这些“不够真实”的细节。",
        fingerprint: "线索",
        detector: "常见问题",
        counter: "Restor 怎么处理",
        rows: [
          {
            label: "频谱太规则",
            detector:
              "合成模型有时会留下周期性很强的频谱纹路，听感上可能不明显，但统计上很扎眼。",
            counter:
              "Restor 会削弱这些过于规则的部分，并用轻微的模拟质感把声音重新揉开。",
          },
          {
            label: "节奏太准",
            detector:
              "AI 生成的起音点常常太整齐，间隔分布比真人演奏或自然说话窄很多。",
            counter:
              "每个起音点只做毫秒级的小幅调整，让节奏仍然稳定，但不再像完全对齐的网格。",
          },
          {
            label: "空间太干净",
            detector:
              "真实录音会有房间、麦克风和反射带来的细小变化；AI 输出有时干净得不太自然。",
            counter:
              "Restor 会给中高频加入一点受控的空间扰动，让声音不那么“贴着屏幕”。",
          },
          {
            label: "隐藏模式",
            detector:
              "某些工具会在音频里留下很弱的统计模式，肉耳听不见，但检测模型可能会利用它。",
            counter:
              "一次轻量的重新纹理化会扰动这些固定模式，同时尽量避免明显改变原音色。",
          },
        ],
      },
      finalCta: {
        title: "拖入音轨，取回更干净的版本。",
        body: "处理在本地 worker 完成。文件处理完会自动清理，当前版本也不需要注册账号。",
        button: "启动处理器",
      },
      visual: {
        analysis: "信号 · 分析",
        live: "实时",
      },
    },
    process: {
      eyebrow: "配置 · 处理",
      title: "配置本次处理。",
      description: "拖入音频，选择想启用的处理步骤，再调一下整体强度。提交后进度会显示在这里。",
      source: "源音频",
      modules: "处理步骤",
      submit: "提交",
      readyPrefix: "准备处理",
      readySuffix: "。",
      empty: "先添加一个文件，才能开始处理。",
      noModules: "未选择任何步骤，输出会基本保持原样。",
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
      modules: [
        {
          id: "spectral",
          label: "柔化机器感",
          shortLabel: "01 · 频谱",
          description: "减少过于规则的频谱纹路，补一点自然质感。",
          detail:
            "适合处理听起来偏冷、偏硬，或统计特征太整齐的生成音频。处理会尽量保留原来的音色。",
        },
        {
          id: "humanizer",
          label: "放松节奏",
          shortLabel: "02 · 时间",
          description: "加入毫秒级的小变化，让节奏不那么机械。",
          detail:
            "适合节拍、鼓点、说话停顿过于规整的音频。变化很轻，不会刻意把节奏弄乱。",
        },
        {
          id: "phase",
          label: "加入空间感",
          shortLabel: "03 · 相位",
          description: "让声音多一点真实空间里的细微变化。",
          detail:
            "适合过于干净、过于贴脸的 AI 输出。会加入受控的房间感，但不会做成明显混响。",
        },
        {
          id: "watermark",
          label: "打散隐藏模式",
          shortLabel: "04 · 水印",
          description: "细微重塑高频纹理，减少固定统计模式。",
          detail:
            "适合需要进一步降低生成痕迹的场景。建议先用默认关闭状态，必要时再开启。",
        },
      ],
      intensityLabel: "整体 · 强度",
      intensityHelp: "控制整体处理力度",
      subtle: "轻微",
      balanced: "均衡",
      aggressive: "强力",
    },
    job: {
      eyebrow: "任务 · 状态",
      title: "正在处理音频。",
      description: "这里会实时显示处理进度。完成后，下载按钮会自动出现。",
      notFound: "任务不存在，可能已经过期，或本地 worker 重启过。",
      pollingFailed: "轮询失败",
      complete: "处理完成",
      failed: "处理失败",
      running: "正在让音频更自然",
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
        { id: "spectral", label: "柔化机器感" },
        { id: "humanizer", label: "放松节奏" },
        { id: "phase", label: "加入空间感" },
        { id: "watermark", label: "打散隐藏模式" },
        { id: "loudness", label: "响度匹配" },
        { id: "writing", label: "编码 WAV" },
        { id: "done", label: "完成" },
      ],
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)[Locale];
