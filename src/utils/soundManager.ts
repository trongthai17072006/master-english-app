/**
 * ============================================================================
 * MASTER ENGLISH — KIẾN TRÚC PHÂN CẤP ÂM THANH 3 TẦNG (3-TIER SOUND HIERARCHY)
 * & BỘ ĐỌC PHÁT ÂM CHUẨN HỌC THUẬT (CLICK-TO-SPEAK SANITIZER)
 * File: src/utils/soundManager.ts
 * ============================================================================
 *
 * BẢNG TRA CỨU NHANH 3 CẤP ĐỘ ÂM THANH (3-TIER SOUND HIERARCHY):
 * ----------------------------------------------------------------------------
 * 1. TIER_1_MAJOR (/sounds/jack-plug.mp3) — ÂM THANH MỤC TO / ĐIỀU HƯỚNG CHÍNH:
 *    - Tiếng "cạch" đầm và chắc (cắt tự động 0.22s quanh đỉnh Peak).
 *    - Dùng cho:
 *      + Các tab chuyển trang lớn ở Sidebar bên trái (Trang Nhất, Kho Chữ & Thuật Ngữ,
 *        Thẻ Hồ Sơ Lưu Trữ, Kỳ Xuất Bản 60 Số, Quy Chuẩn Hành Văn, Phối Ngữ & Mạch Văn,
 *        Thẩm Định Ngữ Nghĩa, Sơ Đồ Liên Đới, Chuyên Đề Học Thuật, Tổng Kho Tư Liệu,
 *        Bản Đính Chính, Báo Cáo Phát Hành, Thẻ Nhà Báo).
 *      + Các tab trên Header chính (Trang Bìa, Workspace, Lộ Trình 60 Ngày, Analytics).
 *      + Các nút hành động lớn màu đỏ/chính (Bắt đầu học, TRA CỨU, ĐỔI BỘ THẺ,
 *        TRAO ĐỔI NGAY, ĐÁNH DẤU ĐÃ THUỘC).
 *
 * 2. TIER_2_SUBITEM (/sounds/snappy-switch.mp3) — ÂM THANH MỤC CON / BỘ LỌC / NÚT NHỎ:
 *    - Tiếng công tắc "tách" nảy nhẹ, sắc nét (cắt tự động 0.14s quanh đỉnh Peak).
 *    - Dùng cho toàn bộ các mục con/nhỏ hơn trên mọi trang:
 *      + Thanh các ô lọc chủ đề con: TẤT CẢ CHỦ ĐỀ, TECHNOLOGY & AI, ENVIRONMENT & CLIMATE,
 *        EDUCATION & PEDAGOGY, HEALTH & MEDICINE, PSYCHOLOGY & MIND, ECONOMY & BUSINESS,
 *        SOCIETY & URBAN...
 *      + Cụm tab lọc trạng thái nhỏ: TẤT CẢ (3.948), CHƯA THUỘC (3.942), ĐÃ THUỘC (6)...
 *      + Menu dropdown chọn trình độ: Mọi trình độ (khi bấm mở và khi chọn option bên trong).
 *      + Các nút phụ, ô trắc nghiệm, nút icon chức năng nhỏ không phát giọng đọc.
 *
 * 3. TIER_3_PAGEFLIP (/sounds/pageturning.mp3) — ÂM THANH LẬT THẺ / LẬT TRANG:
 *    - Tiếng lật giấy "xoẹt" mượt nhất (cắt tự động 0.50s quanh đỉnh Peak).
 *    - Dùng khi:
 *      + Lật mặt thẻ Flashcard 3D (nhấn phím [SPACE] hoặc click trực tiếp vào thẻ).
 *      + Chuyển thẻ (← THẺ TRƯỚC / THẺ TIẾP → hoặc phím mũi tên ← / →).
 *
 * QUY TẮC ƯU TIÊN TUYỆT ĐỐI CHO ĐỌC PHÁT ÂM (SPEECH-ONLY MUTE RULE):
 * ----------------------------------------------------------------------------
 * - Khi người dùng bấm vào BẤT KỲ ô Collocation (⚡ ...), khung/dòng câu ví dụ tiếng Anh,
 *   hoặc nút loa phát âm (có `data-sound="none"`, `data-speak="true"`, `data-speak-only="true"`,
 *   `data-collocation`, `data-example`, `.collocation-tag`, `.example-box`, `.example-sentence`):
 *   -> Hệ thống LẬP TỨC TẮT HOÀN TOÀN tiếng ấn nút (không phát jack-plug hay snappy-switch),
 *      CHỈ PHÁT DUY NHẤT giọng đọc phát âm tiếng Anh trong trẻo.
 * ============================================================================
 */

import { speakWord } from './soundAndSpeech';

/** Mã định danh 5 cấp độ âm thanh chuẩn + các khóa tương thích ngược */
export type SoundTierKey =
  | 'TIER_1_MAJOR'
  | 'TIER_2_SUBITEM'
  | 'TIER_3_PAGEFLIP'
  | 'TIER_4_STAMP'
  | 'TIER_5_TIMER_BELL';
export type LegacySoundKey =
  | 'CLICK_JACK_PLUG'
  | 'SUB_SNAPPY_SWITCH'
  | 'FLIP_PAGE_TURN'
  | 'STAMP_RUBBER'
  | 'BELL_TYPEWRITER';
export type SoundEffectKey = SoundTierKey | LegacySoundKey;

/** Giá trị thuộc tính `data-sound` hỗ trợ gắn trực tiếp trên mọi thẻ HTML */
export type DataSoundAttribute = 'major' | 'sub' | 'flip' | 'stamp' | 'bell' | 'none';

export interface SoundRegistryItem {
  /** Mã định danh Cấp độ âm thanh (TIER_1_MAJOR .. TIER_5_TIMER_BELL) */
  id: SoundTierKey;
  /** Cấp bậc phân loại (1 = Mục lớn, 2 = Mục con/Bộ lọc, 3 = Lật thẻ/Trang, 4 = Đóng dấu mộc, 5 = Chuông báo hết giờ) */
  tierLevel: 1 | 2 | 3 | 4 | 5;
  /** Tên hiển thị tiếng Việt để dễ tra cứu */
  nameVi: string;
  /** Đường dẫn file âm thanh chính trong thư mục public/sounds */
  src: string;
  /** Đường dẫn dự phòng (file gốc đính kèm trong assets) */
  fallbackSrc: string;
  /** Mô tả chi tiết các vị trí sử dụng trên toàn trang web */
  usageDescriptionVi: string;
  /** Bật/tắt chế độ tự động quét và cắt lấy 1 đỉnh âm thanh to nhất (Auto Peak-Slicing) */
  autoPeakSlice: boolean;
  /** Tổng độ dài đoạn âm thanh cắt ra (tính bằng giây) quanh đỉnh Peak */
  sliceDurationSec: number;
  /** Khoảng thời gian lấy trước đỉnh Peak (giây) để giữ trọn phần đầu âm (attack transient) */
  prePeakOffsetSec: number;
  /** Thời gian làm mượt đầu đoạn cắt (fade-in) tránh tiếng bụp loa */
  fadeInSec: number;
  /** Thời gian làm mượt cuối đoạn cắt (fade-out) để âm tắt tự nhiên */
  fadeOutSec: number;
  /** Kiểu đường bao tắt âm: 'cosine' (nhanh/mượt cho click & lật thẻ) hoặc 'exponential' (ngân vang dài cho chuông) */
  decayCurve?: 'cosine' | 'exponential';
  /** Âm lượng phát chuẩn (1.0 = 100%) */
  volumeGain: number;
}

/**
 * ============================================================================
 * BẢNG DANH MỤC PHÂN CẤP ÂM THANH 5 TẦNG (SOUND_REGISTRY & SOUND_HIERARCHY)
 * ============================================================================
 */
export const SOUND_REGISTRY: Record<SoundTierKey, SoundRegistryItem> = {
  /**
   * [CẤP 1 — TIER_1_MAJOR]: ÂM THANH MỤC TO / ĐIỀU HƯỚNG CHÍNH (jack-plug.mp3)
   * - Tự động cắt lấy 1 âm to và đầm nhất (~0.22s quanh đỉnh Peak).
   * - Dùng cho: Các tab chuyển trang lớn ở Sidebar bên trái (Trang Nhất, Kho Chữ & Thuật Ngữ,
   *   Thẻ Hồ Sơ Lưu Trữ...), các tab trên Header chính, và các nút hành động lớn màu đỏ/chính
   *   (Bắt đầu học, TRA CỨU, ĐỔI BỘ THẺ, TRAO ĐỔI NGAY).
   */
  TIER_1_MAJOR: {
    id: 'TIER_1_MAJOR',
    tierLevel: 1,
    nameVi: 'Cấp 1 — Âm thanh Mục To / Điều Hướng Chính & Nút Hành Động Lớn (Jack-Plug)',
    src: '/sounds/jack-plug.mp3',
    fallbackSrc: '/sounds/jack-plug.mp3',
    usageDescriptionVi:
      'Phát khi bấm vào các tab chuyển trang lớn ở Sidebar bên trái (Trang Nhất, Kho Chữ & Thuật Ngữ, Thẻ Hồ Sơ Lưu Trữ...), các tab trên Header chính, và các nút hành động lớn màu đỏ/chính (Bắt đầu học, TRA CỨU, ĐỔI BỘ THẺ, TRAO ĐỔI NGAY).',
    autoPeakSlice: true,
    sliceDurationSec: 0.22,
    prePeakOffsetSec: 0.025,
    fadeInSec: 0.004,
    fadeOutSec: 0.045,
    decayCurve: 'cosine',
    volumeGain: 0.85
  },

  /**
   * [CẤP 2 — TIER_2_SUBITEM]: ÂM THANH MỤC CON / BỘ LỌC / NÚT NHỎ (snappy-switch.mp3)
   * - Tự động dùng Web Audio API cắt lấy đúng 1 tiếng "tách" to và sắc nét nhất (~0.14s quanh đỉnh Peak).
   * - Dùng cho:
   *   1. Thanh các ô lọc chủ đề con: TẤT CẢ CHỦ ĐỀ, TECHNOLOGY & AI, ENVIRONMENT & CLIMATE,
   *      EDUCATION & PEDAGOGY, HEALTH & MEDICINE, PSYCHOLOGY & MIND, ECONOMY & BUSINESS, SOCIETY & URBAN...
   *   2. Cụm tab lọc trạng thái nhỏ: TẤT CẢ (3.948), CHƯA THUỘC (3.942), ĐÃ THUỘC (6).
   *   3. Menu dropdown chọn trình độ: Mọi trình độ (khi bấm mở và khi chọn option bên trong).
   *   4. Các nút icon nhỏ ở góc thẻ và các ô chọn đáp án.
   */
  TIER_2_SUBITEM: {
    id: 'TIER_2_SUBITEM',
    tierLevel: 2,
    nameVi: 'Cấp 2 — Âm thanh Mục Con / Bộ Lọc Chủ Đề / Trạng Thái / Dropdown (Snappy-Switch)',
    src: '/sounds/snappy-switch.mp3',
    fallbackSrc: '/sounds/snappy-switch.mp3',
    usageDescriptionVi:
      'Phát tức thì (zero-latency) khi bấm vào các ô lọc chủ đề con (TẤT CẢ CHỦ ĐỀ, TECHNOLOGY & AI...), cụm tab lọc trạng thái nhỏ (TẤT CẢ, CHƯA THUỘC, ĐÃ THUỘC), menu dropdown chọn trình độ (Mọi trình độ) và các nút phụ nhỏ trên trang.',
    autoPeakSlice: true,
    sliceDurationSec: 0.14,
    prePeakOffsetSec: 0.015,
    fadeInSec: 0.003,
    fadeOutSec: 0.03,
    decayCurve: 'cosine',
    volumeGain: 0.78
  },

  /**
   * [CẤP 3 — TIER_3_PAGEFLIP]: ÂM THANH LẬT THẺ / LẬT TRANG (pageturning.mp3)
   * - Cắt lọc chính xác 1 tiếng "xoẹt" lướt giấy duy nhất (Single Swish Isolation: 0.28s quanh đỉnh sóng âm chính,
   *   loại bỏ hoàn toàn nhịp đập/tiếng chạm thứ hai).
   * - Áp dụng Smooth Audio Envelope qua GainNode: Fade-in 15ms (0.015s) triệt tiêu tiếng "bụp" đầu âm,
   *   và Fade-out 48ms (0.048s) ở cuối âm để tiếng giấy tắt dần tự nhiên, êm tai.
   * - Có khóa chống kích hoạt kép (Debounce Cooldown 300ms qua `lastFlipTime`).
   */
  TIER_3_PAGEFLIP: {
    id: 'TIER_3_PAGEFLIP',
    tierLevel: 3,
    nameVi: 'Cấp 3 — Âm thanh Lật Thẻ Flashcard 3D / Chuyển Thẻ Trước-Sau (Single Swish Page-Turn)',
    src: '/sounds/pageturning.mp3',
    fallbackSrc: '/sounds/pageturning.mp3',
    usageDescriptionVi:
      'Phát đúng 1 tiếng "xoẹt" lướt giấy mượt (0.28s, fade-in 15ms, fade-out 48ms, khóa chống lặp 300ms) khi trạng thái lật thẻ Flashcard 3D (isFlipped) thay đổi hoặc khi chuyển ← THẺ TRƯỚC / THẺ TIẾP →.',
    autoPeakSlice: true,
    sliceDurationSec: 0.28,
    prePeakOffsetSec: 0.035,
    fadeInSec: 0.015,
    fadeOutSec: 0.048,
    decayCurve: 'cosine',
    volumeGain: 0.72
  },

  /**
   * [CẤP 4 — TIER_4_STAMP]: TIẾNG ĐÓNG DẤU MỘC CAO SU (rubber-stamp.mp3)
   * - Đặc trưng: Tiếng gõ/đóng mộc gọn, đầm chắc.
   * - Cách cắt (Slice): Cắt ngắn gọn tập trung vào cú "cộp" đầm chắc ở phần đỉnh sóng âm (Peak),
   *   thời lượng 220ms (0.22s, nằm trong khoảng 200ms - 240ms), áp dụng Fade-out nhanh (45ms)
   *   để tiếng mộc chắc nịch, dứt khoát không bị kéo dài.
   * - Gắn kết: Kích hoạt khi bấm nút "ĐÁNH DẤU ĐÃ THUỘC" hoặc khi hoàn thành một mốc học tập.
   */
  TIER_4_STAMP: {
    id: 'TIER_4_STAMP',
    tierLevel: 4,
    nameVi: 'Cấp 4 — Tiếng Đóng Dấu Mộc Đã Thuộc & Hoàn Thành Mốc Học Tập (Rubber-Stamp)',
    src: '/sounds/rubber-stamp.mp3',
    fallbackSrc: '/sounds/rubber-stamp.mp3',
    usageDescriptionVi:
      'Phát cú "cộp" đóng dấu mộc đầm chắc (220ms, fade-out nhanh) khi người dùng bấm nút ĐÁNH DẤU ĐÃ THUỘC hoặc hoàn thành một nhiệm vụ / mốc học tập.',
    autoPeakSlice: true,
    sliceDurationSec: 0.22,
    prePeakOffsetSec: 0.015,
    fadeInSec: 0.005,
    fadeOutSec: 0.045,
    decayCurve: 'cosine',
    volumeGain: 0.86
  },

  /**
   * [CẤP 5 — TIER_5_TIMER_BELL]: TIẾNG CHUÔNG NGÂN DÀI BÁO HẾT GIỜ (typewriter-ding.mp3)
   * - Đặc trưng: Tiếng chuông báo có độ ngân vang trong trẻo.
   * - Cách cắt (Slice): Giữ dải ngân vang của chuông (~1.75s từ đỉnh chuông đầu tiên),
   *   áp dụng đường bao Fade-in cực ngắn (5ms = 0.005s) và Fade-out rất chậm (Exponential Decay kéo dài 1.25s)
   *   để âm thanh chuông ngân dài, vang vọng tự nhiên.
   * - Gắn kết: Kích hoạt khi đồng hồ Pomodoro (BoundedBannerTimer.tsx) đếm ngược về 00:00 (hết giờ).
   */
  TIER_5_TIMER_BELL: {
    id: 'TIER_5_TIMER_BELL',
    tierLevel: 5,
    nameVi: 'Cấp 5 — Tiếng Chuông Ngân Dài Báo Hết Giờ Đồng Hồ Pomodoro (Typewriter-Ding / Chime)',
    src: '/sounds/typewriter-ding.mp3',
    fallbackSrc: '/sounds/typewriter-ding.mp3',
    usageDescriptionVi:
      'Phát tiếng chuông ngân dài (1.75s, fade-in 5ms, Exponential Decay kéo dài) khi đồng hồ Pomodoro (BoundedBannerTimer.tsx) đếm ngược về 00:00 (hết giờ).',
    autoPeakSlice: true,
    sliceDurationSec: 1.75,
    prePeakOffsetSec: 0.015,
    fadeInSec: 0.005,
    fadeOutSec: 1.25,
    decayCurve: 'exponential',
    volumeGain: 0.82
  }
};

/** Xuất khẩu đồng thời dưới tên `SOUND_HIERARCHY` để dễ tra cứu theo đúng kiến trúc phân cấp */
export const SOUND_HIERARCHY = SOUND_REGISTRY;

/** Ánh xạ tương thích ngược để không làm gãy bất kỳ lệnh gọi cũ nào */
function resolveTierKey(key: SoundEffectKey): SoundTierKey {
  switch (key) {
    case 'TIER_1_MAJOR':
    case 'CLICK_JACK_PLUG':
      return 'TIER_1_MAJOR';
    case 'TIER_2_SUBITEM':
    case 'SUB_SNAPPY_SWITCH':
      return 'TIER_2_SUBITEM';
    case 'TIER_3_PAGEFLIP':
    case 'FLIP_PAGE_TURN':
      return 'TIER_3_PAGEFLIP';
    case 'TIER_4_STAMP':
    case 'STAMP_RUBBER':
      return 'TIER_4_STAMP';
    case 'TIER_5_TIMER_BELL':
    case 'BELL_TYPEWRITER':
      return 'TIER_5_TIMER_BELL';
  }
}

// ============================================================================
// BỘ NHỚ ĐỆM WEB AUDIO API (ZERO-LATENCY AUDIO BUFFER CACHE)
// ============================================================================
let sharedAudioCtx: AudioContext | null = null;
const slicedBufferCache = new Map<SoundTierKey, AudioBuffer>();
const loadingPromises = new Map<SoundTierKey, Promise<AudioBuffer | null>>();

/** Chống phát chồng nhiều âm thanh trong cùng 1 thao tác click (< 55ms) */
let lastGlobalSoundTimestamp = 0;

/**
 * KHÓA CHỐNG KÍCH HOẠT KÉP CHO ÂM THANH LẬT THẺ (AUDIO DEBOUNCE / COOLDOWN LOCK):
 * Nếu lệnh gọi phát âm thanh lật thẻ diễn ra cách lần trước dưới 300ms -> Lập tức bỏ qua (`return`),
 * không cho phép phát chồng âm hoặc kích hoạt 2 lần liên tiếp (ví dụ: mousedown + click hoặc keydown lặp).
 */
let lastFlipTime = 0;
const FLIP_COOLDOWN_MS = 300;
let lastBellTime = 0;
const BELL_COOLDOWN_MS = 1500;
let activeFlipSource: AudioBufferSourceNode | null = null;

function getOrCreateAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioCtxClass) {
      sharedAudioCtx = new AudioCtxClass();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

/**
 * Thuật toán Auto Peak-Slicing & Envelope Shaping bằng Web Audio API:
 * Áp dụng chính xác `sliceDurationSec`, `fadeInSec`, `fadeOutSec` và `decayCurve` riêng biệt cho từng loại âm thanh:
 * - `TIER_1_MAJOR`: 0.22s (jack-plug)
 * - `TIER_2_SUBITEM`: 0.14s (snappy-switch)
 * - `TIER_3_PAGEFLIP`: 0.28s (pageturning — Single Swish Isolation)
 * - `TIER_4_STAMP`: 0.22s (rubber-stamp — Cú "cộp" đóng dấu gọn, chắc nịch)
 * - `TIER_5_TIMER_BELL`: 1.75s (typewriter-ding — Giữ trọn độ ngân vang chuông với Exponential Decay)
 */
function extractLoudestPeakSlice(
  ctx: AudioContext,
  fullBuffer: AudioBuffer,
  config: SoundRegistryItem
): AudioBuffer {
  if (!config.autoPeakSlice) {
    return fullBuffer;
  }

  const sampleRate = fullBuffer.sampleRate;
  const totalSamples = fullBuffer.length;
  const numChannels = fullBuffer.numberOfChannels;
  const sliceSamples = Math.min(
    totalSamples,
    Math.max(1, Math.floor(config.sliceDurationSec * sampleRate))
  );

  // Gộp biên độ tuyệt đối cực đại của các kênh để tìm đỉnh chính xác
  const monoAbs = new Float32Array(totalSamples);
  for (let ch = 0; ch < numChannels; ch++) {
    const channelData = fullBuffer.getChannelData(ch);
    for (let i = 0; i < totalSamples; i++) {
      const absVal = Math.abs(channelData[i]);
      if (absVal > monoAbs[i]) {
        monoAbs[i] = absVal;
      }
    }
  }

  // Dùng cửa sổ trượt ngắn (25ms) để tìm cụm xung chính (Main Peak / Strike)
  const shortWindow = Math.max(64, Math.floor(0.025 * sampleRate));
  let currentWindowSum = 0;
  for (let i = 0; i < Math.min(shortWindow, totalSamples); i++) {
    currentWindowSum += monoAbs[i] * monoAbs[i];
  }

  let bestEnergy = currentWindowSum;
  let bestWindowStart = 0;

  for (let i = 1; i <= Math.max(1, totalSamples - shortWindow); i++) {
    const prev = monoAbs[i - 1];
    const next = monoAbs[Math.min(totalSamples - 1, i + shortWindow - 1)];
    currentWindowSum += next * next - prev * prev;
    if (currentWindowSum > bestEnergy) {
      bestEnergy = currentWindowSum;
      bestWindowStart = i;
    }
  }

  // Tìm mẫu có biên độ tuyệt đối cực đại ngay trong cửa sổ mạnh nhất đó
  let peakSampleIndex = bestWindowStart;
  let maxSampleAmp = 0;
  const searchEnd = Math.min(totalSamples, bestWindowStart + shortWindow);
  for (let i = bestWindowStart; i < searchEnd; i++) {
    if (monoAbs[i] > maxSampleAmp) {
      maxSampleAmp = monoAbs[i];
      peakSampleIndex = i;
    }
  }

  // Tính điểm bắt đầu cắt (lùi về trước đỉnh một khoảng prePeakOffsetSec để giữ trọn âm đầu)
  const preSamples = Math.floor(config.prePeakOffsetSec * sampleRate);
  const startSample =
    totalSamples <= sliceSamples
      ? 0
      : Math.max(0, Math.min(totalSamples - sliceSamples, peakSampleIndex - preSamples));

  // Tạo AudioBuffer mới chứa đúng đoạn âm theo sliceDurationSec của từng Tier
  const slicedBuffer = ctx.createBuffer(numChannels, sliceSamples, sampleRate);
  const maxFadeOutRatio = config.decayCurve === 'exponential' ? 0.85 : 0.5;
  const fadeInSamples = Math.min(
    Math.floor(config.fadeInSec * sampleRate),
    Math.floor(sliceSamples * 0.35)
  );
  const fadeOutSamples = Math.min(
    Math.floor(config.fadeOutSec * sampleRate),
    Math.floor(sliceSamples * maxFadeOutRatio)
  );

  // Hệ số chuẩn hóa biên độ phù hợp cho từng loại hiệu ứng
  const targetPeak = config.id === 'TIER_3_PAGEFLIP' ? 0.78 : 0.90;
  const normScale = maxSampleAmp > 0.01 ? Math.min(1.8, targetPeak / maxSampleAmp) : 1.0;

  for (let ch = 0; ch < numChannels; ch++) {
    const srcData = fullBuffer.getChannelData(ch);
    const dstData = slicedBuffer.getChannelData(ch);

    for (let i = 0; i < sliceSamples; i++) {
      let env = 1.0;
      if (fadeInSamples > 0 && i < fadeInSamples) {
        // Đường cong Sine/Cosine mượt cho Fade-in (triệt tiêu hoàn toàn tiếng "bụp" đầu sóng)
        const phase = i / fadeInSamples;
        env = 0.5 * (1 - Math.cos(Math.PI * phase));
      } else if (fadeOutSamples > 0 && i >= sliceSamples - fadeOutSamples) {
        const remain = sliceSamples - 1 - i;
        const normalizedRemain = Math.max(0, remain / fadeOutSamples);
        if (config.decayCurve === 'exponential') {
          // Exponential Decay kéo dài cho tiếng chuông ngân vang tự nhiên
          env = Math.pow(normalizedRemain, 2.1);
        } else {
          // Đường cong Sine/Cosine mượt cho Fade-out gọn gàng
          env = 0.5 * (1 - Math.cos(Math.PI * normalizedRemain));
        }
      }
      const sampleIdx = Math.min(totalSamples - 1, startSample + i);
      const raw = srcData[sampleIdx] * normScale * env;
      dstData[i] = Math.max(-1, Math.min(1, raw));
    }
  }

  return slicedBuffer;
}

/**
 * Tải file âm thanh, giải mã bằng AudioContext.decodeAudioData,
 * tự động cắt theo cấu hình riêng của từng Tier và lưu vào bộ nhớ đệm (slicedBufferCache).
 */
async function loadAndSliceSound(rawKey: SoundEffectKey): Promise<AudioBuffer | null> {
  const key = resolveTierKey(rawKey);
  if (slicedBufferCache.has(key)) {
    return slicedBufferCache.get(key)!;
  }
  if (loadingPromises.has(key)) {
    return loadingPromises.get(key)!;
  }

  const config = SOUND_REGISTRY[key];
  const promise = (async (): Promise<AudioBuffer | null> => {
    try {
      const ctx = getOrCreateAudioContext();
      if (!ctx) return null;

      let response = await fetch(config.src);
      if (!response.ok && config.fallbackSrc) {
        response = await fetch(config.fallbackSrc);
      }
      if (!response.ok) return null;

      const arrayBuffer = await response.arrayBuffer();
      const decodedBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
      const sliced = extractLoudestPeakSlice(ctx, decodedBuffer, config);
      slicedBufferCache.set(key, sliced);
      return sliced;
    } catch {
      return null;
    } finally {
      loadingPromises.delete(key);
    }
  })();

  loadingPromises.set(key, promise);
  return promise;
}

/**
 * Nạp trước toàn bộ 5 cấp độ âm thanh vào RAM để khi người dùng bấm hoặc hết giờ
 * là phát ra ngay lập tức (0ms latency).
 */
export function preloadAllSounds(): void {
  if (typeof window === 'undefined') return;
  (Object.keys(SOUND_REGISTRY) as SoundTierKey[]).forEach((key) => {
    void loadAndSliceSound(key);
  });
}

/**
 * Phát ngay lập tức 1 hiệu ứng âm thanh thuộc đúng cấp độ từ bộ nhớ đệm Web Audio API.
 * - Với `TIER_3_PAGEFLIP`: Kiểm tra khóa `lastFlipTime` (cooldown 300ms) và Smooth Cosine Envelope.
 * - Với `TIER_4_STAMP`: Cú đóng dấu mộc gọn 220ms, Fade-out nhanh chắc nịch.
 * - Với `TIER_5_TIMER_BELL`: Tiếng chuông ngân dài 1.75s, Fade-in 5ms và Exponential Decay kéo dài.
 */
export function playSound(rawKey: SoundEffectKey): void {
  if (typeof window === 'undefined') return;

  const key = resolveTierKey(rawKey);
  const nowMs = performance.now();

  // Khóa chống kích hoạt kép 300ms dành riêng cho âm thanh lật thẻ (TIER_3_PAGEFLIP)
  if (key === 'TIER_3_PAGEFLIP') {
    if (nowMs - lastFlipTime < FLIP_COOLDOWN_MS) {
      return;
    }
    lastFlipTime = nowMs;
    lastGlobalSoundTimestamp = nowMs;
  } else if (key === 'TIER_5_TIMER_BELL') {
    // Khóa chống lặp 1500ms cho tiếng chuông báo hết giờ (TIER_5_TIMER_BELL)
    if (nowMs - lastBellTime < BELL_COOLDOWN_MS) {
      return;
    }
    lastBellTime = nowMs;
  } else {
    // Chống phát chồng 2 âm thanh click trong cùng 1 thao tác (< 55ms)
    if (nowMs - lastGlobalSoundTimestamp < 55) {
      return;
    }
    lastGlobalSoundTimestamp = nowMs;
  }

  const config = SOUND_REGISTRY[key];
  const ctx = getOrCreateAudioContext();
  if (!ctx) return;

  const playFromBuffer = (buffer: AudioBuffer) => {
    try {
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }

      // Nếu là âm lật thẻ và có 1 âm lật thẻ trước đó chưa tắt hẳn, ngắt nhẹ để không bao giờ chồng 2 tiếng
      if (key === 'TIER_3_PAGEFLIP' && activeFlipSource) {
        try {
          activeFlipSource.stop();
        } catch {
          // Bỏ qua nếu source đã dừng
        }
        activeFlipSource = null;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const gainNode = ctx.createGain();
      const startTime = ctx.currentTime;
      const duration = buffer.duration;

      if (config.decayCurve === 'exponential') {
        // Đường bao chuyên biệt cho TIER_5_TIMER_BELL (typewriter-ding.mp3):
        // Fade-in cực ngắn (5ms) và Exponential Decay kéo dài đến cuối âm để chuông ngân vang trong trẻo
        const fadeInSec = Math.min(config.fadeInSec, 0.01);
        const peakTime = startTime + fadeInSec;
        gainNode.gain.setValueAtTime(0.0001, startTime);
        gainNode.gain.linearRampToValueAtTime(config.volumeGain, peakTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      } else {
        // Đường bao chuẩn cho TIER_1_MAJOR, TIER_2_SUBITEM, TIER_3_PAGEFLIP, TIER_4_STAMP
        const fadeInSec = Math.min(config.fadeInSec, duration * 0.35);
        const fadeOutSec = Math.min(config.fadeOutSec, duration * 0.5);
        const sustainEnd = Math.max(startTime + fadeInSec, startTime + duration - fadeOutSec);

        gainNode.gain.setValueAtTime(0.0001, startTime);
        gainNode.gain.linearRampToValueAtTime(config.volumeGain, startTime + fadeInSec);
        gainNode.gain.setValueAtTime(config.volumeGain, sustainEnd);
        gainNode.gain.linearRampToValueAtTime(0.0001, startTime + duration);
      }

      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (key === 'TIER_3_PAGEFLIP') {
        activeFlipSource = source;
        source.onended = () => {
          if (activeFlipSource === source) {
            activeFlipSource = null;
          }
        };
      }

      source.start(startTime);
    } catch {
      // Bỏ qua nếu trình duyệt chặn tự phát trước khi tương tác
    }
  };

  const cached = slicedBufferCache.get(key);
  if (cached) {
    playFromBuffer(cached);
  } else {
    void loadAndSliceSound(key).then((buf) => {
      if (buf) playFromBuffer(buf);
    });
  }
}

/** Phát âm thanh CẤP 1 — Mục To / Điều Hướng Chính / Nút CTA Chính (jack-plug.mp3) */
export function playTier1Major(): void {
  playSound('TIER_1_MAJOR');
}

/** Phát âm thanh CẤP 2 — Mục Con / Bộ Lọc Chủ Đề / Trạng Thái / Dropdown (snappy-switch.mp3) */
export function playTier2Subitem(): void {
  playSound('TIER_2_SUBITEM');
}

/**
 * Phát âm thanh CẤP 3 — Lật Thẻ Flashcard 3D / Chuyển Thẻ Trước-Sau (pageturning.mp3)
 * Đã tích hợp khóa chống kích hoạt kép `lastFlipTime` (Cooldown 300ms) và Smooth Envelope (Fade-in 15ms, Fade-out 48ms).
 */
export function playFlipSound(): void {
  playSound('TIER_3_PAGEFLIP');
}

export const playTier3PageFlip = playFlipSound;

/**
 * Phát âm thanh CẤP 4 — Tiếng Đóng Dấu Mộc Đã Thuộc & Hoàn Thành Mốc Học Tập (rubber-stamp.mp3)
 * Cắt gọn 220ms quanh đỉnh Peak với Fade-out nhanh tạo cú "cộp" chắc nịch.
 */
export function playTier4Stamp(): void {
  playSound('TIER_4_STAMP');
}

export const playStampSound = playTier4Stamp;

/**
 * Phát âm thanh CẤP 5 — Tiếng Chuông Ngân Dài Báo Hết Giờ Đồng Hồ Pomodoro (typewriter-ding.mp3)
 * Giữ dải ngân vang 1.75s với Fade-in 5ms và Exponential Decay kéo dài.
 */
export function playTier5TimerBell(): void {
  playSound('TIER_5_TIMER_BELL');
}

export const playTimerBellSound = playTier5TimerBell;

// Các hàm bí danh tương thích ngược
export const playJackPlugClick = playTier1Major;
export const playSnappySwitchClick = playTier2Subitem;
export const playPageTurnFlip = playFlipSound;

// ============================================================================
// XỬ LÝ LỌC SẠCH CHỮ TIẾNG ANH TRƯỚC KHI ĐỌC PHÁT ÂM (CLICK-TO-SPEAK)
// ============================================================================

/**
 * Hàm `extractPureEnglish(text)`:
 * Tự động loại bỏ:
 * - Icon sấm sét `⚡`, cờ `🇻🇳`, mũi tên dịch `↳`, ký hiệu mục `§`, `📐`, `📄`, `🌟`, `📌`, `❌`, `✅`
 * - Dấu ngoặc kép `"..."`, `“...”`, `'...'`
 * - Toàn bộ phần giải nghĩa tiếng Việt hoặc ghi chú trong ngoặc đơn `(...)` hoặc ngoặc vuông `[...]`
 *   (ví dụ: `⚡ increasingly medium (ngày càng trở nên người trung gian)` -> `increasingly medium`)
 * - Phần dịch tiếng Việt phía sau dấu `↳`, `Dịch nghĩa:`, hoặc sau dấu gạch ngang `—` có chữ tiếng Việt.
 */
export function extractPureEnglish(rawText: string): string {
  if (!rawText) return '';

  // 1. Cắt bỏ dòng dịch bắt đầu bằng ↳, 🇻🇳, hoặc "Dịch nghĩa:"
  let text = rawText
    .split(/\n|↳|🇻🇳|Dịch nghĩa:/i)[0]
    .trim();

  // 2. Loại bỏ tiền tố nhãn như "Lỗi sai phổ biến:", "Cách dùng chuẩn xác:", "Ghi chú gốc trong PDF:"
  text = text.replace(
    /^(?:❌\s*Lỗi sai phổ biến:|✅\s*Cách dùng chuẩn xác:|❌\s*Sai:|✅\s*Chuẩn xác:|Ví dụ\s*\d*:|Collocations?:|Cụm từ đi kèm:)\s*/i,
    ''
  );

  // 3. Loại bỏ các icon trang trí đầu/cuối câu
  text = text.replace(/[⚡📐📄🌟📌§•★♛🔊🎧✓✔✕✖❌✅]/g, ' ');

  // 4. Loại bỏ mọi nội dung trong ngoặc đơn (...) và ngoặc vuông [...]
  //    (bao gồm cả trường hợp ngoặc bị cắt dở bằng dấu ... ở cuối)
  text = text
    .replace(/\s*\([^)]*\)/g, ' ')
    .replace(/\s*\([^)]*$/g, ' ')
    .replace(/\s*\[[^\]]*\]/g, ' ');

  // 5. Nếu có dấu gạch ngang dài "—" hoặc " - " mà phía sau chứa ký tự tiếng Việt có dấu,
  //    cắt bỏ phần giải nghĩa tiếng Việt phía sau dấu gạch ngang đó.
  const dashParts = text.split(/\s+(?:—|–|-)\s+/);
  if (dashParts.length > 1) {
    const vietnameseDiacriticRegex =
      /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    const pureParts = dashParts.filter((part) => !vietnameseDiacriticRegex.test(part));
    if (pureParts.length > 0) {
      text = pureParts.join('. ');
    } else {
      text = dashParts[0];
    }
  }

  // 6. Loại bỏ dấu ngoặc kép bao ngoài và chuẩn hóa khoảng trắng
  text = text
    .replace(/["“”«»]/g, '')
    .replace(/^['‘’]+|['‘’]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}

/**
 * Hàm đọc phát âm chuẩn tiếng Anh (`speakText`):
 * Tự động lọc sạch icon `⚡`, ngoặc kép `"..."`, phần chữ tiếng Việt trong ngoặc `(...)`
 * và dòng dịch `↳ ...` bằng `extractPureEnglish` trước khi đưa vào bộ đọc phát âm.
 * KHÔNG phát bất kỳ tiếng ấn nút nào để giọng đọc tiếng Anh vang lên hoàn toàn trong trẻo.
 */
export function speakText(rawText: string, lang = 'en-US'): void {
  const cleanEnglish = extractPureEnglish(rawText);
  if (!cleanEnglish) return;
  speakWord(cleanEnglish, lang);
}

// ============================================================================
// BỘ NHẬN DIỆN TỰ ĐỘNG 3 CẤP ĐỘ & LOẠI TRỪ PHÁT ÂM (GLOBAL SOUND INTERCEPTOR)
// ============================================================================
let globalListenersInstalled = false;

/**
 * KIỂM TRA LOẠI TRỪ (SPEECH / MUTE BYPASS):
 * Trả về `true` nếu phần tử được click là ô Collocation, khung/dòng câu ví dụ tiếng Anh,
 * nút loa đọc phát âm, hoặc bất kỳ phần tử nào được gắn `data-sound="none"`.
 * Khi hàm này trả về `true`, bộ lắng nghe toàn cục LẬP TỨC `return` (tắt hoàn toàn tiếng ấn nút).
 */
export function isMutedOrSpeechElement(target: HTMLElement): boolean {
  // 1. Kiểm tra các selector & data-attribute dành riêng cho đọc phát âm / tắt tiếng nút
  const speechOrMutedAncestor = target.closest(
    '[data-sound="none"], [data-speak-only="true"], [data-speak="true"], [data-speak], [data-collocation], [data-example], .collocation-tag, .example-box, .example-sentence'
  );
  if (speechOrMutedAncestor) {
    return true;
  }

  // 2. Kiểm tra phần tử tương tác gần nhất xem có phải là tag Collocation (⚡), câu ví dụ (“...”) hoặc nút loa phát âm không
  const interactiveEl = target.closest('button, span, p, div') as HTMLElement | null;
  if (interactiveEl) {
    const rawText = (interactiveEl.textContent || '').trim();
    const titleAttr = (interactiveEl.getAttribute('title') || '').trim().toLowerCase();
    const ariaLabel = (interactiveEl.getAttribute('aria-label') || '').trim().toLowerCase();

    // Nếu là ô tag bắt đầu bằng ⚡ (Collocation tag)
    if (rawText.startsWith('⚡')) {
      return true;
    }

    // Nếu là nút có chú thích nghe đọc phát âm tiếng Anh
    if (
      titleAttr.includes('nghe phát âm') ||
      titleAttr.includes('bấm để nghe') ||
      titleAttr.includes('phát âm câu') ||
      titleAttr.includes('phát âm cụm') ||
      titleAttr.includes('nghe đọc cả câu') ||
      titleAttr.includes('nghe cả câu') ||
      titleAttr.includes('nghe câu mẫu') ||
      ariaLabel.includes('phát âm')
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Phân loại tự động 1 phần tử tương tác vào đúng 1 trong 3 Cấp độ âm thanh:
 * - `TIER_3_PAGEFLIP`: Lật mặt thẻ Flashcard 3D hoặc chuyển `← THẺ TRƯỚC` / `THẺ TIẾP →`
 * - `TIER_1_MAJOR`: Sidebar menu trái, Header nav chính, hoặc nút CTA chính (Bắt đầu học, TRA CỨU, ĐỔI BỘ THẺ, TRAO ĐỔI NGAY, ĐÁNH DẤU ĐÃ THUỘC...)
 * - `TIER_2_SUBITEM`: Các ô lọc chủ đề (`TECHNOLOGY & AI`...), cụm tab trạng thái (`TẤT CẢ / CHƯA THUỘC / ĐÃ THUỘC`), dropdown `<select>`, và các nút con/nhỏ
 */
export function classifyElementSoundTier(el: HTMLElement): SoundTierKey | null {
  const text = (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const title = (el.getAttribute('title') || '').trim().toLowerCase();
  const combined = `${text} ${title}`;
  const classNameStr = typeof el.className === 'string' ? el.className : '';

  // 0. Ưu tiên kiểm tra nếu là nút "ĐÁNH DẤU ĐÃ THUỘC" / "ĐÃ THUỘC TỪ NÀY" -> TIER_4_STAMP (rubber-stamp.mp3)
  //    (Lưu ý: Không áp dụng cho tab bộ lọc "ĐÃ THUỘC (6)" có số đếm trong ngoặc)
  const isFilterTabWithCount = /^(tất cả|chưa thuộc|đã thuộc|cần học|đã lưu|đang ôn)(\s*\([\d.,]+\))$/i.test(text);
  if (
    !isFilterTabWithCount &&
    (text.includes('đánh dấu đã thuộc') ||
      text.includes('đã thuộc từ này') ||
      title.includes('đánh dấu đã thuộc') ||
      title.includes('bỏ đánh dấu đã thuộc'))
  ) {
    return 'TIER_4_STAMP';
  }

  // 0b. Thuộc tính chỉ định cứng `data-sound="major" | "sub" | "flip" | "stamp" | "bell" | "none"`
  const explicitAttr = el
    .closest('[data-sound]')
    ?.getAttribute('data-sound')
    ?.trim()
    .toLowerCase() as DataSoundAttribute | undefined;

  if (explicitAttr === 'none') return null;
  if (explicitAttr === 'stamp') return 'TIER_4_STAMP';
  if (explicitAttr === 'bell') return 'TIER_5_TIMER_BELL';
  if (explicitAttr === 'major') return 'TIER_1_MAJOR';
  if (explicitAttr === 'sub') return 'TIER_2_SUBITEM';
  if (explicitAttr === 'flip') {
    const txt = (el.textContent || '').trim().toLowerCase();
    if (txt.includes('đổi bộ thẻ') || txt.includes('đổi bộ từ')) {
      return 'TIER_1_MAJOR';
    }
    return 'TIER_3_PAGEFLIP';
  }

  // ==========================================================================
  // 1. KIỂM TRA CẤP 3 (TIER_3_PAGEFLIP — LẬT THẺ FLASHCARD & THẺ TRƯỚC / TIẾP)
  // ==========================================================================
  if (
    text === 'thẻ trước' ||
    text === 'thẻ tiếp' ||
    text === '← thẻ trước' ||
    text === 'thẻ tiếp →' ||
    combined.includes('thẻ trước') ||
    combined.includes('thẻ tiếp') ||
    combined.includes('thẻ kế tiếp') ||
    combined.includes('lật mặt sau') ||
    combined.includes('gõ phím cách (space) để lật')
  ) {
    return 'TIER_3_PAGEFLIP';
  }

  // Click trực tiếp vào mặt thẻ Flashcard 3D (.perspective-1000) để lật thẻ
  if (el.classList.contains('perspective-1000') || el.closest('.perspective-1000')) {
    if (el.tagName === 'BUTTON' && text.length === 0) {
      return 'TIER_2_SUBITEM';
    }
    return 'TIER_3_PAGEFLIP';
  }

  // ==========================================================================
  // 2. KIỂM TRA CẤP 2 (TIER_2_SUBITEM — BỘ LỌC CHỦ ĐỀ, TAB TRẠNG THÁI, DROPDOWN, NÚT NHỎ)
  // ==========================================================================
  // 2a. Menu dropdown chọn trình độ (<select> hoặc <option>)
  if (el.tagName === 'SELECT' || el.tagName === 'OPTION' || el.closest('select')) {
    return 'TIER_2_SUBITEM';
  }

  // 2b. Thanh các ô lọc chủ đề con (TẤT CẢ CHỦ ĐỀ, TECHNOLOGY & AI, ENVIRONMENT & CLIMATE...)
  const topicFilterKeywords = [
    'tất cả chủ đề',
    'technology & ai',
    'environment & climate',
    'education & pedagogy',
    'health & medicine',
    'psychology & mind',
    'economy & business',
    'society & urban',
    'culture & arts',
    'work & employment',
    'law & justice',
    'science & research'
  ];
  if (topicFilterKeywords.some((kw) => text === kw || text.startsWith(kw))) {
    return 'TIER_2_SUBITEM';
  }

  // 2c. Cụm tab lọc trạng thái nhỏ: TẤT CẢ (3.948), CHƯA THUỘC (3.942), ĐÃ THUỘC (6), CẦN HỌC, ĐÃ LƯU
  if (
    /^(tất cả|chưa thuộc|đã thuộc|cần học|đã lưu|đang ôn)(\s*\([\d.,]+\))?$/i.test(text)
  ) {
    return 'TIER_2_SUBITEM';
  }

  // ==========================================================================
  // 3. KIỂM TRA CẤP 1 (TIER_1_MAJOR — SIDEBAR MENU TRÁI, HEADER NAV CHÍNH, NÚT HÀNH ĐỘNG LỚN)
  // ==========================================================================
  // 3a. Các tab chuyển trang lớn ở Sidebar bên trái (<aside>) hoặc Header chính (<header nav>)
  if (el.closest('aside') || el.closest('header nav')) {
    return 'TIER_1_MAJOR';
  }

  // 3b. Các nút hành động lớn màu đỏ / nút CTA chính
  const majorActionKeywords = [
    'bắt đầu học',
    'bắt đầu số báo',
    'tra cứu',
    'đổi bộ thẻ',
    'đổi bộ từ',
    'trao đổi ngay',
    'đăng nhập',
    'đăng ký',
    'đăng xuất',
    'hiệu đính ngay',
    'tổng kho tư liệu',
    'kỳ xuất bản 60 số',
    'báo cáo phát hành',
    'trang chủ học tập',
    'từ điển 3,666+ từ',
    'lộ trình 60 ngày',
    'analytics báo chí',
    'tải thêm từ vựng'
  ];
  if (
    classNameStr.includes('btn-newspaper-red') ||
    majorActionKeywords.some((kw) => text.includes(kw))
  ) {
    return 'TIER_1_MAJOR';
  }

  // ==========================================================================
  // 4. MẶC ĐỊNH CHO CÁC NÚT CON / Ô LỌC / NÚT NHỎ BÊN TRONG TRANG -> TIER_2_SUBITEM
  // ==========================================================================
  return 'TIER_2_SUBITEM';
}

/**
 * Khởi tạo Global Event Listener cho toàn bộ ứng dụng MASTER ENGLISH theo Kiến trúc 3 Tầng:
 * - Tự động nạp sẵn 3 âm thanh đã cắt đỉnh (`TIER_1_MAJOR`, `TIER_2_SUBITEM`, `TIER_3_PAGEFLIP`).
 * - Tự động TẮT HOÀN TOÀN tiếng click khi bấm vào bất kỳ ô Collocation hay câu ví dụ đọc phát âm nào.
 * - Đảm bảo mỗi lần click chỉ phát ĐÚNG 1 âm thanh thuộc đúng cấp độ của phần tử đó.
 */
export function installGlobalSoundListeners(): () => void {
  if (typeof window === 'undefined' || globalListenersInstalled) {
    return () => {};
  }
  globalListenersInstalled = true;
  preloadAllSounds();

  const handleGlobalPointerDown = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // 1. Bỏ qua nếu bấm vào ô nhập liệu văn bản thuần túy
    const tagName = target.tagName;
    if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
      return;
    }

    // 2. QUY TẮC SỐ 1 (AUDIO CONFLICT FIX):
    //    Nếu phần tử được click (hoặc phần tử cha gần nhất) là ô Collocation, khung/câu ví dụ,
    //    nút loa phát âm, hoặc có `data-sound="none"` / `data-speak-only="true"` / `data-speak="true"`
    //    -> LẬP TỨC RETURN NGAY (không phát bất kỳ âm thanh TIER_1, TIER_2 hay TIER_3 nào!)
    if (isMutedOrSpeechElement(target)) {
      return;
    }

    // 3. Tìm phần tử tương tác gần nhất
    const interactiveEl = target.closest(
      'button, a, select, [role="button"], [role="tab"], [data-sound], .perspective-1000, .cursor-pointer'
    ) as HTMLElement | null;

    if (!interactiveEl) return;
    if ((interactiveEl as HTMLButtonElement).disabled) return;

    // Kiểm tra lại một lần nữa trên interactiveEl để chắc chắn không phải phần tử đọc phát âm
    if (isMutedOrSpeechElement(interactiveEl)) {
      return;
    }

    // 4. Phân loại tự động vào đúng 1 trong 3 cấp (TIER_1_MAJOR | TIER_2_SUBITEM | TIER_3_PAGEFLIP)
    const tierKey = classifyElementSoundTier(interactiveEl);
    if (tierKey) {
      // Nếu là thao tác lật thẻ (TIER_3_PAGEFLIP) trên thẻ .perspective-1000 hoặc nút [data-sound="flip"],
      // để chính hàm onClick của component gọi playFlipSound() khi trạng thái isFlipped thay đổi
      // nhằm tránh hiện tượng mousedown phát 1 lần rồi nhả chuột (click) lại phát lần 2.
      if (
        tierKey === 'TIER_3_PAGEFLIP' &&
        (interactiveEl.classList.contains('perspective-1000') ||
          interactiveEl.closest('.perspective-1000') ||
          interactiveEl.hasAttribute('data-sound'))
      ) {
        return;
      }
      playSound(tierKey);
    }
  };

  // Khi người dùng chọn 1 option bên trong menu dropdown <select> (ví dụ: chọn Band B1, B2, C1, C2)
  const handleGlobalSelectChange = (e: Event) => {
    const target = e.target as HTMLElement | null;
    if (target && target.tagName === 'SELECT') {
      playTier2Subitem();
    }
  };

  window.addEventListener('mousedown', handleGlobalPointerDown, true);
  window.addEventListener('change', handleGlobalSelectChange, true);

  return () => {
    window.removeEventListener('mousedown', handleGlobalPointerDown, true);
    window.removeEventListener('change', handleGlobalSelectChange, true);
    globalListenersInstalled = false;
  };
}
