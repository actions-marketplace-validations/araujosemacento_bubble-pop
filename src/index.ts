import * as core from '@actions/core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fetchUserContributions } from './api';
import { renderContributionSvg } from './svg';

async function run(): Promise<void> {
  try {
    const username = core.getInput('github_user_name', { required: true });
    const token = core.getInput('github_token', { required: true });
    const outputPath = core.getInput('output_path') || 'dist/github-contribution-grid-bubble.svg';
    const themeInput = core.getInput('theme') || 'auto';

    const theme = (['auto', 'dark', 'light', 'rose-pine', 'rose-pine-dawn'].includes(themeInput)
      ? themeInput
      : 'auto') as 'auto' | 'dark' | 'light' | 'rose-pine' | 'rose-pine-dawn';

    core.info(`[bubble-pop] Fetching contribution data for "${username}"...`);
    const calendar = await fetchUserContributions(username, token);

    core.info(
      `[bubble-pop] Successfully fetched ${calendar.totalContributions} contributions across ${calendar.weeks.length} weeks.`
    );

    const showHeader = core.getInput('show_header') !== 'false';
    const showLabels = core.getInput('show_labels') !== 'false';
    const showAvatar = core.getInput('show_avatar') === 'true';

    let avatarUrl: string | undefined = undefined;
    if (showAvatar && username) {
      const remoteUrl = `https://github.com/${username}.png?size=64`;
      try {
        const resp = await fetch(remoteUrl);
        if (resp.ok) {
          const arrayBuffer = await resp.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          const mime = resp.headers.get('content-type') || 'image/png';
          avatarUrl = `data:${mime};base64,${base64}`;
        } else {
          avatarUrl = remoteUrl;
        }
      } catch {
        avatarUrl = remoteUrl;
      }
    }

    core.info('[bubble-pop] Generating bubbling SVG animation...');
    const svgContent = renderContributionSvg(calendar, {
      username,
      theme,
      showHeader,
      showLabels,
      showAvatar,
      avatarUrl,
    });

    const targetFile = resolve(process.cwd(), outputPath);
    mkdirSync(dirname(targetFile), { recursive: true });
    writeFileSync(targetFile, svgContent, 'utf-8');

    core.info(`[bubble-pop] Successfully saved SVG to "${targetFile}".`);
    core.setOutput('svg_path', targetFile);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed(`Unknown error: ${String(error)}`);
    }
  }
}

run();
