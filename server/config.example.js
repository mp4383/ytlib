module.exports = {
  // Server configuration
  port: 3001,
  host: 'localhost',

  // Video storage configuration
  storage: {
    // Default local storage path
    path: './downloads',
    
    // Example NAS configuration (uncomment and modify as needed)
    // nas: {
    //   enabled: false,
    //   path: '/mnt/nas/videos',
    //   // Add any additional NAS-specific settings here
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
