/**
 * Generate a shareable challenge image using Canvas API
 * Returns a data URL that can be downloaded or shared
 */

interface ChallengeImageOptions {
  score: number;
  challengerAddress?: string;
  coins: number;
}

export function generateChallengeImage(options: ChallengeImageOptions): string {
  const { score, challengerAddress, coins } = options;
  
  // Create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  // Set dimensions (Instagram/Twitter friendly)
  canvas.width = 800;
  canvas.height = 800;
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#0a0b10');
  gradient.addColorStop(1, '#16192e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Decorative border
  ctx.strokeStyle = '#ff6c15';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
  
  // Inner glow
  ctx.strokeStyle = 'rgba(77, 225, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
  
  // Title
  ctx.fillStyle = '#4de1ff';
  ctx.font = 'bold 48px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⚔️ CHALLENGE!', canvas.width / 2, 120);
  
  // Game title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Arial, sans-serif';
  ctx.fillText('HEMI SHADOW RUNNER', canvas.width / 2, 170);
  
  // Divider line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(150, 200);
  ctx.lineTo(650, 200);
  ctx.stroke();
  
  // Challenger info
  if (challengerAddress) {
    ctx.fillStyle = 'rgba(77, 225, 255, 0.8)';
    ctx.font = '24px Arial, sans-serif';
    ctx.fillText('From:', canvas.width / 2, 260);
    
    ctx.fillStyle = '#4de1ff';
    ctx.font = 'bold 28px monospace';
    const shortAddress = `${challengerAddress.slice(0, 10)}...${challengerAddress.slice(-8)}`;
    ctx.fillText(shortAddress, canvas.width / 2, 300);
  }
  
  // Score box
  ctx.fillStyle = 'rgba(255, 108, 21, 0.2)';
  ctx.fillRect(150, 350, 500, 150);
  ctx.strokeStyle = '#ff6c15';
  ctx.lineWidth = 3;
  ctx.strokeRect(150, 350, 500, 150);
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '24px Arial, sans-serif';
  ctx.fillText('TARGET SCORE', canvas.width / 2, 390);
  
  ctx.fillStyle = '#ffd447';
  ctx.font = 'bold 72px Arial, sans-serif';
  ctx.fillText(score.toLocaleString(), canvas.width / 2, 470);
  
  // Coins
  ctx.fillStyle = '#ff6c15';
  ctx.font = 'bold 28px Arial, sans-serif';
  ctx.fillText(`🪙 ${coins} coins collected`, canvas.width / 2, 560);
  
  // Call to action
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.fillText('Can you beat it?', canvas.width / 2, 640);
  
  // Footer
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '20px Arial, sans-serif';
  ctx.fillText('Play on Hemi Network', canvas.width / 2, 710);
  
  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = '#4de1ff';
  ctx.fillText(window.location.origin, canvas.width / 2, 740);
  
  // Convert to data URL
  return canvas.toDataURL('image/png');
}

/**
 * Download the generated image
 */
export function downloadChallengeImage(dataUrl: string, filename: string = 'challenge.png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
