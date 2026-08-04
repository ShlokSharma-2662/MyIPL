/**
 * Render a shareable MyIPL season summary card to a PNG blob (no deps).
 */
export function renderSeasonCardPng({
  tourney,
  championName,
  championId,
  championColor = '#F59E0B',
  userName,
  userTeam,
  userWon,
  runs,
  sr,
  wickets,
  econ,
  orangeCap,
  purpleCap,
  recordLine,
}) {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, W, H);

  // Amber glow orb
  const glow = ctx.createRadialGradient(W / 2, 280, 20, W / 2, 280, 420);
  glow.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
  glow.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Top accent bar
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(0, 0, W, 8);

  // Eyebrow
  ctx.fillStyle = '#F59E0B';
  ctx.font = '600 28px IBM Plex Sans, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SEASON SUMMARY', W / 2, 90);

  // Tournament
  ctx.fillStyle = '#FAFAFA';
  ctx.font = '700 64px Bebas Neue, Impact, sans-serif';
  ctx.fillText((tourney || 'IPL').toUpperCase().slice(0, 36), W / 2, 170);

  // Champion badge circle
  ctx.beginPath();
  ctx.arc(W / 2, 320, 70, 0, Math.PI * 2);
  ctx.fillStyle = championColor;
  ctx.fill();
  ctx.fillStyle = '#09090b';
  ctx.font = '800 42px Bebas Neue, Impact, sans-serif';
  ctx.fillText((championId || '???').slice(0, 4), W / 2, 335);

  ctx.fillStyle = '#F59E0B';
  ctx.font = '600 24px IBM Plex Sans, system-ui, sans-serif';
  ctx.fillText('CHAMPIONS', W / 2, 430);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 56px Bebas Neue, Impact, sans-serif';
  ctx.fillText((championName || championId || '').toUpperCase().slice(0, 28), W / 2, 495);

  if (userWon) {
    ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';
    roundRect(ctx, W / 2 - 280, 530, 560, 64, 32);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#FCD34D';
    ctx.font = '700 26px IBM Plex Sans, system-ui, sans-serif';
    ctx.fillText(`YOU DID IT, ${(userName || '').toUpperCase()}`, W / 2, 572);
  }

  // Your season panel
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  roundRect(ctx, 80, 640, W - 160, 280, 24);
  ctx.fill();
  ctx.strokeStyle = 'rgba(63,63,70,0.9)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#A1A1AA';
  ctx.font = '600 22px IBM Plex Sans, system-ui, sans-serif';
  ctx.fillText(`YOUR SEASON — ${(userName || '').toUpperCase()} · ${userTeam || ''}`, W / 2, 700);

  const stats = [
    { label: 'RUNS', value: String(runs ?? 0), color: '#FBBF24' },
    { label: 'SR', value: String(sr ?? '-'), color: '#FBBF24' },
    { label: 'WICKETS', value: String(wickets ?? 0), color: '#E879F9' },
    { label: 'ECON', value: String(econ ?? '-'), color: '#E879F9' },
  ];
  const gap = (W - 160) / 4;
  stats.forEach((s, i) => {
    const x = 80 + gap * i + gap / 2;
    ctx.fillStyle = s.color;
    ctx.font = '700 64px Bebas Neue, Impact, sans-serif';
    ctx.fillText(s.value, x, 820);
    ctx.fillStyle = '#71717A';
    ctx.font = '600 20px IBM Plex Sans, system-ui, sans-serif';
    ctx.fillText(s.label, x, 860);
  });

  if (recordLine) {
    ctx.fillStyle = '#A1A1AA';
    ctx.font = '500 22px IBM Plex Mono, monospace';
    ctx.fillText(recordLine, W / 2, 900);
  }

  // Caps
  ctx.fillStyle = '#FAFAFA';
  ctx.font = '600 26px IBM Plex Sans, system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Orange Cap  ${orangeCap || '—'}`, 120, 1020);
  ctx.fillText(`Purple Cap  ${purpleCap || '—'}`, 120, 1070);

  // Footer
  ctx.textAlign = 'center';
  ctx.fillStyle = '#52525B';
  ctx.font = '600 22px IBM Plex Sans, system-ui, sans-serif';
  ctx.fillText('MYIPL · FANTASY T20 CAREER', W / 2, 1260);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export async function downloadSeasonCardPng(opts, filename = 'myipl-season.png') {
  const blob = await renderSeasonCardPng(opts);
  if (!blob) throw new Error('Could not render PNG');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return blob;
}
