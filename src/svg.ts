import type { ContributionCalendar, RenderOptions } from './types';

// Deterministic pseudo-random number generator based on coordinates
function pseudoRandom(x: number, y: number, seed: number = 42): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 43758.5453) * 43758.5453;
  return n - Math.floor(n);
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

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

  const paddingLeft = 36;
  const paddingTop = 44;
  const paddingRight = 24;
  const paddingBottom = 28;

  const totalWidth = paddingLeft + gridWidth + paddingRight;
  const totalHeight = paddingTop + gridHeight + paddingBottom;

  // Compute month label positions
  const monthLabels: Array<{ text: string; x: number }> = [];
  let lastMonth = -1;

  weeks.forEach((week, wIndex) => {
    const firstDay = week.contributionDays[0];
    if (firstDay) {
      const month = new Date(firstDay.date).getMonth();
      if (month !== lastMonth && wIndex < numWeeks - 2) {
        lastMonth = month;
        monthLabels.push({
          text: MONTH_NAMES[month],
          x: paddingLeft + wIndex * (cellSize + cellGap),
        });
      }
    }
  });

  // Day labels (Mon, Wed, Fri)
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
      
      // Calculate randomized delay and duration variance
      const rnd = pseudoRandom(w, d, 99);
      const delay = (rnd * duration).toFixed(2);
      const individualDuration = (duration + (rnd - 0.5) * 1.2).toFixed(2);

      // Determine animation class based on contribution count
      // Level 0 (inactive days) have a mild gentle pulse / occasional pop
      // Active days (Level 1-4) have vibrant bubble-and-pop physics
      let animClass = 'bubble-cell';
      if (countLevel === 0) {
        animClass = 'bubble-calm';
      } else if (countLevel >= 3) {
        animClass = 'bubble-burst';
      }

      rectElements.push(
        `<rect class="${animClass} lvl-${countLevel}" data-date="${day.date}" data-count="${count}" ` +
        `x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cellSize}" height="${cellSize}" rx="${cellRadius}" ` +
        `style="animation-delay: ${delay}s; animation-duration: ${individualDuration}s;">` +
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
  <style>
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

    ${
      theme === 'light'
        ? `
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
    }`
        : theme === 'auto'
        ? `
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
    }`
        : ''
    }

    .card-bg {
      fill: var(--bg-color);
      stroke: var(--card-border);
      stroke-width: 1px;
      rx: 10px;
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
    .lvl-0 { fill: var(--empty-cell); }
    .lvl-1 { fill: var(--cell-l1); }
    .lvl-2 { fill: var(--cell-l2); }
    .lvl-3 { fill: var(--cell-l3); }
    .lvl-4 { fill: var(--cell-l4); }

    /* Core transform setup for SVG elements */
    .bubble-cell, .bubble-calm, .bubble-burst {
      transform-box: fill-box;
      transform-origin: center center;
      animation-iteration-count: infinite;
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Standard bubbling & popping animation */
    @keyframes bubblePop {
      0%, 72% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
        rx: ${cellRadius}px;
      }
      76% {
        /* Starts inflating & rounding into a buoyant bubble */
        transform: translateY(-2px) scale(1.18);
        rx: 50%;
      }
      82% {
        /* Floating higher, wobbling */
        transform: translateY(-6px) scale(1.3, 1.15);
        rx: 50%;
      }
      87% {
        /* Peak swelling & floating */
        transform: translateY(-9px) scale(1.42);
        rx: 50%;
        opacity: 1;
      }
      90% {
        /* POP! Instant expansion burst & vanish */
        transform: translateY(-11px) scale(2.2);
        opacity: 0;
      }
      91%, 95% {
        /* Invisible while popped */
        transform: translateY(0) scale(0);
        opacity: 0;
      }
      97% {
        /* Regenerates gently back into place */
        transform: scale(0.6);
        opacity: 0.5;
        rx: ${cellRadius}px;
      }
      100% {
        transform: scale(1);
        opacity: 1;
        rx: ${cellRadius}px;
      }
    }

    /* High-activity burst bubble */
    @keyframes bubblePopVibrant {
      0%, 68% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
        rx: ${cellRadius}px;
      }
      73% {
        transform: translateY(-3px) scale(1.22);
        rx: 50%;
      }
      80% {
        transform: translateY(-8px) scale(1.4, 1.25);
        rx: 50%;
      }
      86% {
        transform: translateY(-12px) scale(1.55);
        rx: 50%;
        opacity: 1;
      }
      89% {
        /* High energy POP! */
        transform: translateY(-14px) scale(2.6);
        opacity: 0;
      }
      90%, 94% {
        transform: translateY(0) scale(0);
        opacity: 0;
      }
      97% {
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

    /* Mild floating pulse for inactive / empty cells */
    @keyframes bubbleCalm {
      0%, 85% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
      }
      90% {
        transform: translateY(-2px) scale(1.1);
      }
      94% {
        transform: translateY(-3px) scale(1.15);
      }
      97% {
        transform: translateY(0) scale(0.95);
      }
      100% {
        transform: translate(0, 0) scale(1);
      }
    }

    .bubble-cell {
      animation-name: bubblePop;
    }

    .bubble-burst {
      animation-name: bubblePopVibrant;
    }

    .bubble-calm {
      animation-name: bubbleCalm;
    }
  </style>

  <!-- Background Card -->
  <rect class="card-bg" x="0.5" y="0.5" width="${totalWidth - 1}" height="${totalHeight - 1}" />

  <!-- Header -->
  <g id="header">
    <text class="title-text" x="${paddingLeft}" y="24">${userHeader}</text>
    <text class="subtitle-text" x="${totalWidth - paddingRight}" y="24" text-anchor="end">${totalText}</text>
  </g>

  <!-- Month Labels -->
  <g id="month-labels">
    ${monthLabels.map((m) => `<text class="label-text" x="${m.x.toFixed(1)}" y="${paddingTop - 8}">${m.text}</text>`).join('\n    ')}
  </g>

  <!-- Day of Week Labels -->
  <g id="day-labels">
    ${dayLabels.map((d) => `<text class="label-text" x="${paddingLeft - 8}" y="${d.y.toFixed(1)}" text-anchor="end">${d.text}</text>`).join('\n    ')}
  </g>

  <!-- Contribution Grid Cells -->
  <g id="contribution-grid">
    ${rectElements.join('\n    ')}
  </g>
</svg>
`;
}
