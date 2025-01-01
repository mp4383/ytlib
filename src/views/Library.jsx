import { useState, useEffect, useRef } from 'react';
import { Card, Input, Select, Typography, Row, Col, Tooltip, Modal } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Search } = Input;
const { Text, Paragraph } = Typography;

function Library() {
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/videos');
      setVideos(response.data);
    } catch (error) {
      console.error('Failed to load videos:', error);
    }
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const filteredVideos = videos.filter(video => 
    video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.youtuber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedVideos = [...filteredVideos].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.created) - new Date(a.created);
    } else if (sortBy === 'title') {
      return a.title?.localeCompare(b.title);
    } else if (sortBy === 'youtuber') {
      return a.youtuber?.localeCompare(b.youtuber);
    }
    return 0;
  });

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ padding: '0 24px' }}>
      {/* Search and Sort Controls */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '24px',
        alignItems: 'center',
      }}>
        <Search
          placeholder="Search videos..."
          allowClear
          onChange={e => setSearchTerm(e.target.value)}
          style={{ maxWidth: 400 }}
        />
        <Select
          defaultValue="date"
          onChange={setSortBy}
          style={{ width: 120 }}
          options={[
            { value: 'date', label: 'Date' },
            { value: 'title', label: 'Title' },
            { value: 'youtuber', label: 'YouTuber' },
          ]}
        />
      </div>

      {/* Video Grid */}
      <Row gutter={[16, 16]}>
        {sortedVideos.map(video => (
          <Col key={video.path} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              onClick={() => handleVideoClick(video)}
              style={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
              styles={{
                body: { 
                  flex: 1, 
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                }
              }}
              cover={
                <div style={{ position: 'relative', paddingTop: '56.25%', backgroundColor: '#000' }}>
                  {video.thumbnail ? (
                    <img
                      alt={video.title}
                      src={video.thumbnail}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#1f1f1f',
                    }}>
                      <PlayCircleOutlined style={{ fontSize: '48px', opacity: 0.5 }} />
                    </div>
                  )}
                  {video.duration && (
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      background: 'rgba(0, 0, 0, 0.75)',
                      padding: '2px 4px',
                      borderRadius: '2px',
                      color: 'white',
                      fontSize: '12px',
                    }}>
                      {formatDuration(video.duration)}
                    </div>
                  )}
                </div>
              }
            >
              <div style={{ flex: 1 }}>
                <Tooltip title={video.title}>
                  <Paragraph
                    strong
                    ellipsis={{ rows: 2 }}
                    style={{ 
                      marginBottom: '4px', 
                      fontSize: '14px', 
                      lineHeight: '1.4',
                      minHeight: '2.8em',
                    }}
                  >
                    {video.title}
                  </Paragraph>
                </Tooltip>
                <Tooltip title={video.youtuber}>
                  <Text
                    type="secondary"
                    style={{ 
                      fontSize: '12px',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {video.youtuber}
                  </Text>
                </Tooltip>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

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

export default Library;
