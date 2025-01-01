import { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Card, Typography, Space, Progress, Tooltip, Modal } from 'antd';
import { DownloadOutlined, LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Text, Paragraph } = Typography;

// Load downloads from localStorage
const loadDownloads = () => {
  try {
    const saved = localStorage.getItem('downloads');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load downloads:', error);
    return [];
  }
};

// Save downloads to localStorage
const saveDownloads = (downloads) => {
  try {
    localStorage.setItem('downloads', JSON.stringify(downloads));
  } catch (error) {
    console.error('Failed to save downloads:', error);
  }
};

function Download() {
  const [form] = Form.useForm();
  const [downloads, setDownloads] = useState(() => loadDownloads());
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const navigate = useNavigate();
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const videoRef = useRef(null);

  // Save downloads whenever they change
  useEffect(() => {
    saveDownloads(downloads);
  }, [downloads]);

  const connectWebSocket = () => {
    try {
      wsRef.current = new WebSocket('ws://localhost:3001');

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        // Clear any reconnection timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('WebSocket message:', message);
        
        if (message.type === 'progress') {
          // Update download progress
          setDownloads(prev => prev.map(d => 
            d.id === message.downloadId ? {
              ...d,
              progress: message.progress,
            } : d
          ));
        } else if (message.type === 'completion') {
          // Update download status
          setDownloads(prev => prev.map(d => 
            d.id === message.downloadId ? {
              ...d,
              status: message.success ? 'completed' : 'error',
              error: message.error,
              progress: message.success ? 100 : d.progress,
            } : d
          ));

          // Keep only last 10 completed downloads in history
          if (message.success) {
            setDownloads(prev => {
              const completed = prev.filter(d => d.status === 'completed');
              const inProgress = prev.filter(d => d.status === 'downloading');
              const failed = prev.filter(d => d.status === 'error');
              return [...inProgress, ...failed, ...completed].slice(0, 10);
            });
          }
          setIsDownloading(false);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected. Reconnecting...');
        // Try to reconnect after 2 seconds
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 2000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      // Try to reconnect after 2 seconds
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 2000);
    }
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const handleDownload = async (values) => {
    if (isDownloading) return;

    const { url } = values;
    setIsDownloading(true);

    // Create a new download entry
    const downloadId = Date.now();
    const newDownload = {
      id: downloadId,
      url,
      progress: 0,
      status: 'downloading',
      title: 'Fetching info...',
    };

    setDownloads(prev => [newDownload, ...prev]);
    form.resetFields();

    try {
      console.log('Starting download request...');
      const response = await axios.post('http://localhost:3001/api/download', { 
        url,
        downloadId,
      });
      console.log('Download response:', response.data);
      
      // Update download entry with video info
      setDownloads(prev => prev.map(d => 
        d.id === downloadId ? {
          ...d,
          title: response.data.video.title,
          youtuber: response.data.video.youtuber,
          path: response.data.video.path,
        } : d
      ));

    } catch (err) {
      console.error('Download error:', err);
      // Update download entry with error
      setDownloads(prev => prev.map(d => 
        d.id === downloadId ? {
          ...d,
          status: 'error',
          error: err.response?.data?.error || 'Failed to download video',
        } : d
      ));
      setIsDownloading(false);
    }
  };

  const handleVideoClick = (video) => {
    if (video.status === 'completed') {
      setSelectedVideo(video);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '24px', height: '100%' }}>
      {/* Main download area */}
      <div style={{ flex: 1 }}>
        <Card style={{ maxWidth: 600, margin: '0 auto' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                Download YouTube Video
              </Text>
              <Text type="secondary">
                Enter a YouTube video URL to download it to your library
              </Text>
            </div>
            
            <Form 
              form={form}
              onFinish={handleDownload}
              style={{ width: '100%' }}
            >
              <Space.Compact style={{ width: '100%' }}>
                <Form.Item
                  name="url"
                  style={{ flex: 1, marginBottom: 0 }}
                  rules={[{ required: true, message: 'Please enter a YouTube URL' }]}
                >
                  <Input
                    placeholder="https://www.youtube.com/watch?v=..."
                    size="large"
                    disabled={isDownloading}
                  />
                </Form.Item>
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button 
                    type="primary" 
                    icon={<DownloadOutlined />}
                    htmlType="submit"
                    disabled={isDownloading}
                    size="large"
                    loading={isDownloading}
                  >
                    Download
                  </Button>
                </Form.Item>
              </Space.Compact>
            </Form>
          </Space>
        </Card>
      </div>

      {/* Download history sidebar */}
      <Card 
        title="Download History" 
        styles={{
          body: { padding: '12px' },
          header: { borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }
        }}
        style={{ 
          width: 300,
          height: 'calc(100vh - 140px)',
          overflow: 'auto',
          position: 'sticky',
          top: '24px',
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          {downloads.length === 0 ? (
            <Text type="secondary" style={{ textAlign: 'center', padding: '20px 0' }}>
              No downloads yet
            </Text>
          ) : (
            downloads.map(download => (
              <Card 
                key={download.id}
                size="small"
                styles={{
                  body: { padding: '12px' }
                }}
                style={{ 
                  marginBottom: 8, 
                  width: '100%',
                  cursor: download.status === 'completed' ? 'pointer' : 'default',
                }}
                onClick={() => handleVideoClick(download)}
                hoverable={download.status === 'completed'}
              >
                <Tooltip title={download.title || download.url}>
                  <Text
                    ellipsis
                    style={{
                      display: 'block',
                      marginBottom: download.status === 'downloading' ? 8 : 0,
                    }}
                  >
                    {download.status === 'downloading' ? (
                      <LoadingOutlined style={{ marginRight: 8 }} />
                    ) : download.status === 'completed' ? (
                      <PlayCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                    ) : (
                      <CloseCircleOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
                    )}
                    {download.title || 'Loading...'}
                  </Text>
                </Tooltip>
                {download.status === 'downloading' && (
                  <Progress 
                    percent={download.progress} 
                    size="small"
                    status="active"
                    style={{ marginTop: 8 }}
                  />
                )}
                {download.status === 'error' && (
                  <Text type="danger" style={{ fontSize: '12px' }}>
                    {download.error}
                  </Text>
                )}
              </Card>
            ))
          )}
        </Space>
      </Card>

      {/* Video Player Modal */}
      <Modal
        title={selectedVideo?.title}
        open={!!selectedVideo}
        onCancel={() => {
          setSelectedVideo(null);
          if (videoRef.current) {
            videoRef.current.pause();
          }
        }}
        footer={null}
        width="80%"
        style={{ top: 20 }}
        styles={{
          body: { padding: 0 },
          header: { borderBottom: '1px solid rgba(255, 255, 255, 0.1)' },
          content: { backgroundColor: '#1f1f1f' },
        }}
      >
        {selectedVideo && (
          <video
            ref={videoRef}
            controls
            style={{ width: '100%', maxHeight: 'calc(100vh - 200px)' }}
            src={`http://localhost:3001/videos/${selectedVideo.path}`}
            autoPlay
          />
        )}
      </Modal>
    </div>
  );
}

export default Download;
