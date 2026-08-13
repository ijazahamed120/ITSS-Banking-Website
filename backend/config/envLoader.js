import fs from 'node:fs';
import path from 'node:path';

/**
 * Simple .env parser for backend environment variables
 */
export function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.substring(0, eqIdx).trim();
          const val = trimmed.substring(eqIdx + 1).trim().replace(/^["']/, '').replace(/["']$/, '');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    });
  }
}
