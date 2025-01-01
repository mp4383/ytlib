import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  // Server configuration
  port: 3001,
  host: 'localhost',

  // Video storage configuration
  storage: {
    // Default local storage path (relative to server directory)
    path: join(__dirname, '..', 'downloads'),
    
    // NAS configuration (uncomment and modify as needed)
    // nas: {
    //   enabled: false,
    //   path: '/mnt/nas/videos',
    // }
  },

  // Download settings
  download: {
    // Maximum concurrent downloads
    maxConcurrent: 2,
    
    // Preferred video quality (highest, 1080p, 720p, etc.)
    quality: 'highest',
    
    // Preferred video format
    format: 'mp4',
    
    // Download timeout in milliseconds
    timeout: 300000, // 5 minutes
  },

  // WebSocket configuration
  websocket: {
    // How often to send progress updates (in milliseconds)
    progressInterval: 1000,
  }
};
