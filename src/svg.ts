import type { ContributionCalendar, RenderOptions } from './types';

// Deterministic 2D integer hash with avalanche bit mixing to prevent spatial column banding
function hash2D(x: number, y: number, seed: number = 0x9e3779b9): number {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + seed) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h = Math.imul(h ^ (h >>> 16), 2246822519);
  h = (h ^ (h >>> 15)) >>> 0;
  return h / 4294967296;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

function getThemeVariables(theme: string = 'auto'): string {
  switch (theme) {
    case 'light':
    case 'github-light':
      return `
    :root {
      --bg-color: #ffffff;
      --card-border: #d0d7de;
      --text-primary: #1f2328;
      --text-secondary: #656d76;
      --empty-cell: #ebedf0;
      --cell-l1: #9be9a8;
      --cell-l2: #40c463;
      --cell-l3: #30a14e;
      --cell-l4: #216e39;
      --bubble-glow: rgba(64, 196, 99, 0.4);
    }`;
    case 'rose-pine':
      return `
    :root {
      --bg-color: #191724;
      --card-border: #26233a;
      --text-primary: #e0def4;
      --text-secondary: #908caa;
      --empty-cell: #26233a;
      --cell-l1: #5b374d;
      --cell-l2: #8f4a6e;
      --cell-l3: #c45e88;
      --cell-l4: #eb6f92;
      --bubble-glow: rgba(235, 111, 146, 0.45);
    }`;
    case 'rose-pine-dawn':
      return `
    :root {
      --bg-color: #faf4ed;
      --card-border: #f2e9de;
      --text-primary: #575279;
      --text-secondary: #797593;
      --empty-cell: #f2e9de;
      --cell-l1: #f2ccd7;
      --cell-l2: #e293a9;
      --cell-l3: #cb6585;
      --cell-l4: #b4637a;
      --bubble-glow: rgba(180, 99, 122, 0.4);
    }`;
    case 'dracula':
      return `
    :root {
      --bg-color: #282a36;
      --card-border: #44475a;
      --text-primary: #f8f8f2;
      --text-secondary: #6272a4;
      --empty-cell: #343746;
      --cell-l1: #1e4b33;
      --cell-l2: #2d7a4f;
      --cell-l3: #3ebc69;
      --cell-l4: #50fa7b;
      --bubble-glow: rgba(80, 250, 123, 0.45);
    }`;
    case 'alucard':
      return `
    :root {
      --bg-color: #fffbeb;
      --card-border: #cfcfde;
      --text-primary: #1f1f1f;
      --text-secondary: #6c664b;
      --empty-cell: #f0ece1;
      --cell-l1: #bfe2ba;
      --cell-l2: #75bc6c;
      --cell-l3: #38952b;
      --cell-l4: #14710a;
      --bubble-glow: rgba(20, 113, 10, 0.35);
    }`;
    case 'mocha':
    case 'catppuccin-mocha':
      return `
    :root {
      --bg-color: #1e1e2e;
      --card-border: #313244;
      --text-primary: #cdd6f4;
      --text-secondary: #a6adc8;
      --empty-cell: #313244;
      --cell-l1: #274236;
      --cell-l2: #457256;
      --cell-l3: #6fa878;
      --cell-l4: #a6e3a1;
      --bubble-glow: rgba(166, 227, 161, 0.45);
    }`;
    case 'latte':
    case 'catppuccin-latte':
      return `
    :root {
      --bg-color: #eff1f5;
      --card-border: #ccd0da;
      --text-primary: #4c4f69;
      --text-secondary: #6c6f85;
      --empty-cell: #e6e9ef;
      --cell-l1: #c3e3be;
      --cell-l2: #8bc584;
      --cell-l3: #5cae50;
      --cell-l4: #40a02b;
      --bubble-glow: rgba(64, 160, 43, 0.4);
    }`;
    case 'gitlab-dark':
      return `
    :root {
      --bg-color: #181818;
      --card-border: #333333;
      --text-primary: #ececef;
      --text-secondary: #89888d;
      --empty-cell: #222222;
      --cell-l1: #103824;
      --cell-l2: #005928;
      --cell-l3: #108548;
      --cell-l4: #2da160;
      --bubble-glow: rgba(45, 161, 96, 0.4);
    }`;
    case 'gitlab-light':
      return `
    :root {
      --bg-color: #ffffff;
      --card-border: #e1e1e1;
      --text-primary: #2e2e32;
      --text-secondary: #707077;
      --empty-cell: #ededed;
      --cell-l1: #cbe2cd;
      --cell-l2: #8fc295;
      --cell-l3: #4ea059;
      --cell-l4: #108548;
      --bubble-glow: rgba(16, 133, 72, 0.4);
    }`;
    case 'codeberg-dark':
      return `
    :root {
      --bg-color: #282c34;
      --card-border: #3e4451;
      --text-primary: #abb2bf;
      --text-secondary: #5c6370;
      --empty-cell: #1e2227;
      --cell-l1: #183c50;
      --cell-l2: #1a5b7a;
      --cell-l3: #1e81a8;
      --cell-l4: #21a0d0;
      --bubble-glow: rgba(33, 160, 208, 0.4);
    }`;
    case 'codeberg-light':
      return `
    :root {
      --bg-color: #ffffff;
      --card-border: #d4d4d5;
      --text-primary: #212121;
      --text-secondary: #757575;
      --empty-cell: #eaebed;
      --cell-l1: #b5ddf6;
      --cell-l2: #6bbce8;
      --cell-l3: #329cd5;
      --cell-l4: #2185d0;
      --bubble-glow: rgba(33, 133, 208, 0.4);
    }`;
    case 'auto':
      return `
    @media (prefers-color-scheme: light) {
      :root {
        --bg-color: #ffffff;
        --card-border: #d0d7de;
        --text-primary: #1f2328;
        --text-secondary: #656d76;
        --empty-cell: #ebedf0;
        --cell-l1: #9be9a8;
        --cell-l2: #40c463;
        --cell-l3: #30a14e;
        --cell-l4: #216e39;
        --bubble-glow: rgba(64, 196, 99, 0.4);
      }
    }`;
    case 'dark':
    case 'github-dark':
    default:
      return '';
  }
}

export function renderContributionSvg(
  calendar: ContributionCalendar,
  options: RenderOptions = {}
): string {
  const {
    cellSize = 10.5,
    cellGap = 3,
    cellRadius = 2.5,
    duration = 5.5,
    theme = 'auto',
    username,
  } = options;

  const weeks = calendar.weeks;
  const numWeeks = weeks.length;
  const gridWidth = numWeeks * (cellSize + cellGap) - cellGap;
  const gridHeight = 7 * (cellSize + cellGap) - cellGap;

  const paddingLeft = 40;
  const paddingTop = 62;
  const paddingRight = 24;
  const paddingBottom = 26;

  const totalWidth = paddingLeft + gridWidth + paddingRight;
  const totalHeight = paddingTop + gridHeight + paddingBottom;

  // Compute month label positions with overlap & squish detection
  interface MonthLabelCandidate {
    text: string;
    col: number;
    x: number;
  }

  const rawMonthTransitions: MonthLabelCandidate[] = [];
  let lastMonth = -1;

  weeks.forEach((week, wIndex) => {
    const firstDay = week.contributionDays[0];
    if (firstDay) {
      const month = new Date(firstDay.date).getMonth();
      if (month !== lastMonth) {
        lastMonth = month;
        rawMonthTransitions.push({
          text: MONTH_NAMES[month],
          col: wIndex,
          x: paddingLeft + wIndex * (cellSize + cellGap),
        });
      }
    }
  });

  // Filter out squished / overlapping labels
  const monthLabels: MonthLabelCandidate[] = [];
  const minLabelDistancePx = 32;

  for (let i = 0; i < rawMonthTransitions.length; i++) {
    const candidate = rawMonthTransitions[i];
    const nextCandidate = rawMonthTransitions[i + 1];

    // If this is the first month and the next month starts within 3 weeks or < 32px,
    // suppress this partial month label to prevent squished overlap.
    if (i === 0 && nextCandidate && (nextCandidate.col - candidate.col < 3 || nextCandidate.x - candidate.x < minLabelDistancePx)) {
      continue;
    }

    // Do not place labels in the final 2 weeks to prevent right edge overflow
    if (candidate.col > numWeeks - 3) {
      continue;
    }

    // Ensure adequate spacing from the previous rendered label
    const prev = monthLabels[monthLabels.length - 1];
    if (prev && candidate.x - prev.x < minLabelDistancePx) {
      continue;
    }

    monthLabels.push(candidate);
  }

  // Day labels (Mon, Wed, Fri) with improved vertical positioning matching grid
  const dayLabels = [
    { text: 'Mon', y: paddingTop + 1 * (cellSize + cellGap) + cellSize * 0.8 },
    { text: 'Wed', y: paddingTop + 3 * (cellSize + cellGap) + cellSize * 0.8 },
    { text: 'Fri', y: paddingTop + 5 * (cellSize + cellGap) + cellSize * 0.8 },
  ];

  // Build rect elements with individualized bubbling animations
  const rectElements: string[] = [];

  weeks.forEach((week, w) => {
    week.contributionDays.forEach((day, d) => {
      const x = paddingLeft + w * (cellSize + cellGap);
      const y = paddingTop + d * (cellSize + cellGap);
      
      const count = day.contributionCount;
      const countLevel = count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 10 ? 3 : 4;
      
      // Uncorrelated hash values for duration, phase, and keyframe profile
      const hDuration = hash2D(w, d, 1013);
      const hPhase = hash2D(w, d, 2017);
      const hVariant = hash2D(w, d, 3037);

      // Incommensurate duration spread using golden ratio scaling (~0.65 to ~1.40 of base duration)
      // Produces coprime-like irrational period ratios that never align in harmonic resonance
      const phi = 1.618033988749895;
      const durationFactor = 0.65 + ((hDuration * phi) % 1) * 0.75;
      const individualDuration = Math.max(2.2, duration * durationFactor).toFixed(2);
      
      // Negative phase delay scaled to each bubble's own duration for perfectly uniform t=0 distribution
      const delay = (hPhase * parseFloat(individualDuration)).toFixed(2);

      // Distribute animation class across complementary phase profiles and activity levels
      // Inactive (L0) days ONLY wave/undulate gently without ever turning into bubbles or popping
      let animClass = 'bubble-calm-a';
      if (countLevel === 0) {
        animClass = hVariant > 0.5 ? 'bubble-calm-a' : 'bubble-calm-b';
      } else if (countLevel >= 3) {
        animClass = hVariant > 0.5 ? 'bubble-burst-a' : 'bubble-burst-b';
      } else {
        animClass = hVariant > 0.5 ? 'bubble-cell-a' : 'bubble-cell-b';
      }

      rectElements.push(
        `<rect class="${animClass} lvl-${countLevel}" data-date="${day.date}" data-count="${count}" ` +
        `x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cellSize}" height="${cellSize}" rx="${cellRadius}" ` +
        `style="animation-delay: -${delay}s; animation-duration: ${individualDuration}s;">` +
        `<title>${count} contributions on ${day.date}</title>` +
        `</rect>`
      );
    });
  });

  // Title / status text
  const userHeader = username ? `${username}'s Contributions` : 'GitHub Contributions';
  const totalText = `${calendar.totalContributions.toLocaleString()} contributions in the last year`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}" height="${totalHeight}">
  <style id="bubble-pop-styles">
    :root {
      --bg-color: #0d1117;
      --card-border: #30363d;
      --text-primary: #e6edf3;
      --text-secondary: #7d8590;
      --empty-cell: #161b22;
      --cell-l1: #0e4429;
      --cell-l2: #006d32;
      --cell-l3: #26a641;
      --cell-l4: #39d353;
      --bubble-glow: rgba(57, 211, 83, 0.4);
    }

    ${getThemeVariables(theme)}

    .card-bg {
      fill: var(--bg-color);
      stroke: var(--card-border);
      stroke-width: 1px;
      rx: 10px;
      transition: fill 0.4s ease, stroke 0.4s ease;
    }

    .title-text, .subtitle-text, .label-text {
      transition: fill 0.4s ease;
    }

    .title-text {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
      font-size: 13px;
      font-weight: 600;
      fill: var(--text-primary);
    }

    .subtitle-text {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
      font-size: 11px;
      font-weight: 400;
      fill: var(--text-secondary);
    }

    .label-text {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
      font-size: 9.5px;
      fill: var(--text-secondary);
      user-select: none;
    }

    /* Cell level base colors */
    rect {
      transition: fill 0.4s ease;
    }

    .lvl-0 { fill: var(--empty-cell); }
    .lvl-1 { fill: var(--cell-l1); }
    .lvl-2 { fill: var(--cell-l2); }
    .lvl-3 { fill: var(--cell-l3); }
    .lvl-4 { fill: var(--cell-l4); }

    /* Core transform setup for SVG elements */
    .bubble-cell, .bubble-cell-a, .bubble-cell-b,
    .bubble-burst, .bubble-burst-a, .bubble-burst-b,
    .bubble-calm, .bubble-calm-a, .bubble-calm-b {
      transform-box: fill-box;
      transform-origin: center center;
      animation-iteration-count: infinite;
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Standard bubbling & popping - Phase Profile A (late cycle burst) */
    @keyframes bubblePopA {
      0%, 65% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
        rx: ${cellRadius}px;
      }
      72% {
        transform: translateY(-2px) scale(1.18);
        rx: 50%;
      }
      78% {
        transform: translateY(-5px) scale(1.3, 1.15);
        rx: 50%;
      }
      83% {
        transform: translateY(-8px) scale(1.42);
        rx: 50%;
        opacity: 1;
      }
      86% {
        transform: translateY(-10px) scale(2.1);
        opacity: 0;
      }
      87%, 92% {
        transform: translateY(0) scale(0);
        opacity: 0;
      }
      96% {
        transform: scale(0.65);
        opacity: 0.6;
        rx: ${cellRadius}px;
      }
      100% {
        transform: scale(1);
        opacity: 1;
        rx: ${cellRadius}px;
      }
    }

    /* Standard bubbling & popping - Phase Profile B (mid cycle burst, breaks temporal alignment) */
    @keyframes bubblePopB {
      0%, 28% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
        rx: ${cellRadius}px;
      }
      35% {
        transform: translateY(-2px) scale(1.18);
        rx: 50%;
      }
      41% {
        transform: translateY(-5px) scale(1.3, 1.15);
        rx: 50%;
      }
      46% {
        transform: translateY(-8px) scale(1.42);
        rx: 50%;
        opacity: 1;
      }
      49% {
        transform: translateY(-10px) scale(2.1);
        opacity: 0;
      }
      50%, 55% {
        transform: translateY(0) scale(0);
        opacity: 0;
      }
      59% {
        transform: scale(0.65);
        opacity: 0.6;
        rx: ${cellRadius}px;
      }
      63%, 100% {
        transform: scale(1);
        opacity: 1;
        rx: ${cellRadius}px;
      }
    }

    /* High-activity burst bubble - Phase Profile A */
    @keyframes bubbleBurstA {
      0%, 63% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
        rx: ${cellRadius}px;
      }
      70% {
        transform: translateY(-3px) scale(1.22);
        rx: 50%;
      }
      77% {
        transform: translateY(-7px) scale(1.4, 1.25);
        rx: 50%;
      }
      83% {
        transform: translateY(-11px) scale(1.55);
        rx: 50%;
        opacity: 1;
      }
      86% {
        transform: translateY(-13px) scale(2.5);
        opacity: 0;
      }
      87%, 92% {
        transform: translateY(0) scale(0);
        opacity: 0;
      }
      96% {
        transform: scale(0.5);
        opacity: 0.7;
        rx: ${cellRadius}px;
      }
      100% {
        transform: scale(1);
        opacity: 1;
        rx: ${cellRadius}px;
      }
    }

    /* High-activity burst bubble - Phase Profile B (mid cycle burst) */
    @keyframes bubbleBurstB {
      0%, 26% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
        rx: ${cellRadius}px;
      }
      33% {
        transform: translateY(-3px) scale(1.22);
        rx: 50%;
      }
      40% {
        transform: translateY(-7px) scale(1.4, 1.25);
        rx: 50%;
      }
      46% {
        transform: translateY(-11px) scale(1.55);
        rx: 50%;
        opacity: 1;
      }
      49% {
        transform: translateY(-13px) scale(2.5);
        opacity: 0;
      }
      50%, 55% {
        transform: translateY(0) scale(0);
        opacity: 0;
      }
      59% {
        transform: scale(0.5);
        opacity: 0.7;
        rx: ${cellRadius}px;
      }
      63%, 100% {
        transform: scale(1);
        opacity: 1;
        rx: ${cellRadius}px;
      }
    }

    /* Gentle undulating wave for inactive L0 cells (pure waving, no popping, no bubble morphing) */
    @keyframes bubbleCalmA {
      0%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-1.5px);
      }
      75% {
        transform: translateY(0.8px);
      }
    }

    @keyframes bubbleCalmB {
      0%, 100% {
        transform: translateY(0);
      }
      35% {
        transform: translateY(1.0px);
      }
      70% {
        transform: translateY(-1.2px);
      }
    }

    .bubble-cell, .bubble-cell-a {
      animation-name: bubblePopA;
    }

    .bubble-cell-b {
      animation-name: bubblePopB;
    }

    .bubble-burst, .bubble-burst-a {
      animation-name: bubbleBurstA;
    }

    .bubble-burst-b {
      animation-name: bubbleBurstB;
    }

    .bubble-calm, .bubble-calm-a {
      animation-name: bubbleCalmA;
    }

    .bubble-calm-b {
      animation-name: bubbleCalmB;
    }
  </style>

  <!-- Background Card -->
  <rect class="card-bg" x="0.5" y="0.5" width="${totalWidth - 1}" height="${totalHeight - 1}" />

  <!-- Header -->
  <g id="header">
    <text class="title-text" x="${paddingLeft}" y="28">${userHeader}</text>
    <text class="subtitle-text" x="${totalWidth - paddingRight}" y="28" text-anchor="end">${totalText}</text>
  </g>

  <!-- Month Labels -->
  <g id="month-labels">
    ${monthLabels.map((m) => `<text class="label-text" x="${m.x.toFixed(1)}" y="${paddingTop - 12}">${m.text}</text>`).join('\n    ')}
  </g>

  <!-- Day of Week Labels -->
  <g id="day-labels">
    ${dayLabels.map((d) => `<text class="label-text" x="${paddingLeft - 10}" y="${d.y.toFixed(1)}" text-anchor="end">${d.text}</text>`).join('\n    ')}
  </g>

  <!-- Contribution Grid Cells -->
  <g id="contribution-grid">
    ${rectElements.join('\n    ')}
  </g>
</svg>
`;
}
