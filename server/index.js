import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import youtubeDl from 'youtube-dl-exec';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import config from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const PORT = config.port || 3001;

// Storage paths
const VIDEOS_DIR = config.storage.path;
const METADATA_DIR = join(VIDEOS_DIR, 'metadata');

app.use(cors());
app.use(express.json());
app.use('/videos', express.static(VIDEOS_DIR));

// WebSocket connections store
const clients = new Map();

wss.on('connection', (ws) => {
  const clientId = Date.now();
  clients.set(clientId, ws);

  ws.on('close', () => {
    clients.delete(clientId);
  });
});

// Broadcast progress to all connected clients
const broadcastProgress = (downloadId, progress) => {
  const message = JSON.stringify({
    type: 'progress',
    downloadId,
    progress,
  });
  
  clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(message);
    }
  });
};

// Broadcast completion to all connected clients
const broadcastCompletion = (downloadId, success, error) => {
  const message = JSON.stringify({
    type: 'completion',
    downloadId,
    success,
    error,
  });
  
  clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(message);
    }
  });
};

// Error logging helper
const logError = async (error, context) => {
  const timestamp = new Date().toISOString();
  const errorLog = `${timestamp} - ${context}: ${error.message}\n${error.stack}\n\n`;
  try {
    await fs.appendFile(join(VIDEOS_DIR, 'error.log'), errorLog);
  } catch (e) {
    console.error('Failed to write error log:', e);
  }
  console.error(`${context}:`, error);
};

// Ensure directories exist
try {
  await fs.access(VIDEOS_DIR);
  await fs.access(METADATA_DIR);
} catch {
  try {
    await fs.mkdir(VIDEOS_DIR, { recursive: true });
    await fs.mkdir(METADATA_DIR, { recursive: true });
    console.log('Created directories:', VIDEOS_DIR, METADATA_DIR);
  } catch (error) {
    await logError(error, 'Directory creation failed');
    throw error;
  }
}

// Store video metadata
const metadataFile = join(METADATA_DIR, 'metadata.json');
let videoMetadata = {};

// Load existing metadata
try {
  const data = await fs.readFile(metadataFile, 'utf8');
  videoMetadata = JSON.parse(data);
  console.log('Loaded metadata for', Object.keys(videoMetadata).length, 'videos');
} catch (error) {
  if (error.code !== 'ENOENT') {
    await logError(error, 'Metadata loading failed');
  }
  try {
    await fs.writeFile(metadataFile, '{}');
    console.log('Created new metadata file');
  } catch (writeError) {
    await logError(writeError, 'Metadata file creation failed');
    throw writeError;
  }
}

// Get list of downloaded videos
app.get('/api/videos', async (req, res) => {
  try {
    const files = await fs.readdir(VIDEOS_DIR);
    const videoFiles = files.filter(file => 
      !file.startsWith('.') && 
      !file.startsWith('metadata') && 
      file !== 'error.log'
    );
    console.log('Found', videoFiles.length, 'videos in directory');
    
    const videos = await Promise.all(
      videoFiles.map(async (file) => {
        try {
          const stats = await fs.stat(join(VIDEOS_DIR, file));
          return {
            name: file,
            size: stats.size,
            created: stats.birthtime,
            path: file, // Just the filename, since we serve from /videos
            ...videoMetadata[file],
          };
        } catch (error) {
          await logError(error, `Failed to get stats for file: ${file}`);
          return null;
        }
      })
    );

    res.json(videos.filter(Boolean));
  } catch (error) {
    await logError(error, 'Video listing failed');
    res.status(500).json({ error: error.message });
  }
});

// Download video
app.post('/api/download', async (req, res) => {
  const { url, downloadId } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    console.log('Starting download for:', url);
    
    // Get video info first
    const info = await youtubeDl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
    });

    console.log('Got video info:', info.title);

    const filename = `${info.channel}-${info.title}.mp4`.replace(/[^\w\s-]/g, '');
    const outputPath = join(VIDEOS_DIR, filename);

    // Get best thumbnail
    const thumbnail = info.thumbnails ? 
      info.thumbnails.reduce((best, current) => {
        if (!best || current.height > best.height) return current;
        return best;
      }, null)?.url : null;

    // Send initial response with video info
    res.json({
      message: 'Starting download',
      video: {
        name: filename,
        youtuber: info.channel,
        title: info.title,
        thumbnail: thumbnail,
        duration: info.duration,
        path: filename, // Just the filename, since we serve from /videos
      },
    });

    // Download video with simulated progress updates
    console.log('Downloading to:', outputPath);
    
    // Start progress updates
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 5;
      if (progress <= 95) {
        broadcastProgress(downloadId, progress);
      }
    }, 500);

    try {
      await youtubeDl(url, {
        output: outputPath,
        format: 'best',
      });

      // Clear progress interval and send completion
      clearInterval(progressInterval);
      broadcastProgress(downloadId, 100);

      // Save metadata
      const metadata = {
        youtuber: info.channel,
        title: info.title,
        thumbnail: thumbnail,
        duration: info.duration,
        uploadDate: info.upload_date,
      };
      
      videoMetadata[filename] = metadata;
      await fs.writeFile(metadataFile, JSON.stringify(videoMetadata, null, 2));
      console.log('Saved metadata for:', filename);

      // Broadcast completion
      broadcastCompletion(downloadId, true);

    } catch (error) {
      clearInterval(progressInterval);
      throw error;
    }

  } catch (error) {
    await logError(error, 'Video download failed');
    broadcastCompletion(downloadId, false, error.message);
    throw error;
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Using directories:');
  console.log('- Videos:', VIDEOS_DIR);
  console.log('- Metadata:', METADATA_DIR);
});
