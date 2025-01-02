# YTLib - YouTube Video Library

YTLib is a web application that allows you to download YouTube videos and maintain a personal library. Videos can be downloaded, organized, and played back directly in the application.

## Features

- **Video Downloads**
  - Download videos from YouTube by URL
  - Real-time download progress tracking
  - Download history with status indicators
  - Automatic metadata extraction (title, channel)

- **Video Library**
  - Browse downloaded videos in a grid layout
  - Sort videos by date, title, or YouTuber
  - Search videos by title or channel name
  - Video thumbnails and duration display

- **Video Playback**
  - Built-in video player
  - Click to play downloaded videos
  - Full-screen support
  - Playback controls (play/pause, seek, volume)

## Tech Stack

- Frontend:
  - React
  - Ant Design UI components
  - Vite build tool
  - WebSocket for real-time updates

- Backend:
  - Node.js
  - Express
  - youtube-dl for video downloads
  - WebSocket for progress updates

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ytlib.git
cd ytlib
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd server
npm install
```

4. Configure the application:
```bash
# Copy the example configuration file
cp server/config.example.js server/config.js

# Edit config.js with your settings
nano server/config.js
```

5. Start both services using the provided script:
```bash
./start.sh
```

The application will be available at `http://localhost:5173`. The services will run in the background and logs will be available in the `logs` directory.

To stop the services:
```bash
./stop.sh
```

### Service Management Scripts

Two scripts are provided to manage the application services:

- **start.sh**
  - Starts both backend and frontend servers in the background
  - Creates PID files for process tracking
  - Logs output to `logs/backend.log` and `logs/frontend.log`
  - Verifies services are running properly
  - Provides status output

- **stop.sh**
  - Gracefully stops all services
  - Cleans up PID and log files
  - Falls back to force kill if needed
  - Ensures complete cleanup

The services will continue running without requiring the terminal to stay open. You can monitor the services through the log files in the `logs` directory.

## Configuration

### Basic Configuration

The `server/config.js` file controls all server-side settings. A template is provided in `config.example.js` with the following options:

- Server port and host
- Video storage location
- Download settings (quality, format, concurrent downloads)
- WebSocket configuration

### Video Storage

By default, videos are stored in the `downloads` directory. To change this:

1. Open `server/config.js`
2. Modify the `storage.path` setting
3. Ensure the new location is writable by the application

### NAS Storage

To store videos on a NAS:

1. Mount your NAS storage locally
2. Update `server/config.js`:
```javascript
storage: {
  nas: {
    enabled: true,
    path: '/path/to/nas/mount'
  }
}
```

### Security Notes

- Never commit `config.js` or any `.env` files to version control
- Keep NAS mount points and network paths private
- The `.gitignore` file is configured to exclude sensitive files
- Create separate configurations for development and production

## Usage

1. **Downloading Videos**
   - Navigate to the Download page
   - Paste a YouTube video URL
   - Click Download
   - Monitor progress in the download history

2. **Browsing Library**
   - Navigate to the Library page
   - Use the search bar to find videos
   - Sort videos using the dropdown
   - Click on a video to play

3. **Playing Videos**
   - Click any downloaded video to open the player
   - Use standard video controls
   - Click the close button or outside the modal to exit

## Development

### Project Structure

```
ytlib/
├── src/                # Frontend source code
│   ├── views/         # React components for each page
│   ├── styles/        # CSS styles
│   └── assets/        # Static assets
├── server/            # Backend server code
│   ├── index.js      # Express server setup
│   ├── config.js     # Server configuration (gitignored)
│   └── config.example.js  # Configuration template
├── downloads/         # Default video storage location (gitignored)
├── logs/             # Service logs directory (gitignored)
├── start.sh          # Service startup script
└── stop.sh           # Service shutdown script
```

### Adding Features

1. Frontend:
   - Components go in `src/views/`
   - Styles in `src/styles.css`
   - Assets in `src/assets/`

2. Backend:
   - Add routes in `server/index.js`
   - Update configuration template in `server/config.example.js`
   - Keep sensitive settings in `server/config.js` (gitignored)

### Environment Variables

For additional security, sensitive information can be stored in `.env` files:

```bash
# .env example
NAS_PATH=/mnt/nas/videos
NAS_USER=username
NAS_PASS=password
```

These files are automatically gitignored.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

**Note:** Ensure no sensitive information is included in your commits.

## License

MIT License - feel free to use this project for personal or commercial purposes.
