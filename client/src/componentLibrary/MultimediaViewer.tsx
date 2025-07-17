import React, { useState, useRef, useEffect } from 'react';
import { RepositoryFile } from '../services/types';
import { formatDuration, getFileTypeCategory } from '../data/RepositoryFileData';

interface MultimediaViewerProps {
  file: RepositoryFile;
  onClose?: () => void;
  className?: string;
}

const MultimediaViewer: React.FC<MultimediaViewerProps> = ({
  file,
  onClose,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fileTypeCategory = getFileTypeCategory(file.fileName);

  // Handle video/audio time updates
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    const media = video || audio;

    if (!media) return;

    const handleTimeUpdate = () => {
      setCurrentTime(media.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(media.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    media.addEventListener('timeupdate', handleTimeUpdate);
    media.addEventListener('loadedmetadata', handleLoadedMetadata);
    media.addEventListener('play', handlePlay);
    media.addEventListener('pause', handlePause);
    media.addEventListener('ended', handleEnded);

    return () => {
      media.removeEventListener('timeupdate', handleTimeUpdate);
      media.removeEventListener('loadedmetadata', handleLoadedMetadata);
      media.removeEventListener('play', handlePlay);
      media.removeEventListener('pause', handlePause);
      media.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Auto-hide controls for video
  useEffect(() => {
    if (fileTypeCategory !== 'video') return;

    let timeout: ReturnType<typeof setTimeout>;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      timeout = setTimeout(() => setShowControls(false), 3000);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      clearTimeout(timeout);
    };
  }, [fileTypeCategory]);

  // Media controls
  const togglePlay = () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    const media = video || audio;

    if (media) {
      if (isPlaying) {
        media.pause();
      } else {
        media.play();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    const audio = audioRef.current;
    const media = video || audio;

    if (media) {
      const newTime = parseFloat(e.target.value);
      media.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    const video = videoRef.current;
    const audio = audioRef.current;
    const media = video || audio;

    if (media) {
      media.volume = newVolume;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Render different content based on file type
  const renderContent = () => {
    switch (fileTypeCategory) {
      case 'image':
        return (
          <div className="relative">
            <img
              src={file.fileUrl}
              alt={file.fileName}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-image.png';
              }}
            />
            {file.thumbnail && (
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                {file.dimensions && `${file.dimensions.width} × ${file.dimensions.height}`}
              </div>
            )}
          </div>
        );

      case 'video':
        return (
          <div ref={containerRef} className="relative group">
            <video
              ref={videoRef}
              src={file.fileUrl}
              className="max-w-full max-h-full"
              poster={file.thumbnail?.url}
              onError={(e) => {
                console.error('Video error:', e);
              }}
            />
            
            {/* Video Controls */}
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}>
              {/* Progress Bar */}
              <div className="mb-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-white text-xs mt-1">
                  <span>{formatDuration(currentTime)}</span>
                  <span>{formatDuration(duration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlay}
                    className="text-white hover:text-gray-300 transition-colors"
                  >
                    {isPlaying ? '⏸️' : '▶️'}
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-white text-sm">🔊</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleFullscreen}
                    className="text-white hover:text-gray-300 transition-colors"
                  >
                    {isFullscreen ? '⏹️' : '⛶'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="bg-gray-100 rounded-lg p-6">
            <audio
              ref={audioRef}
              src={file.fileUrl}
              controls
              className="w-full"
              onError={(e) => {
                console.error('Audio error:', e);
              }}
            />
            
            {/* Audio Metadata */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Duration: {file.durationFormatted || 'Unknown'}</span>
                <span>Bitrate: {file.bitrate ? `${file.bitrate} kbps` : 'Unknown'}</span>
              </div>
            </div>
          </div>
        );

      case 'document':
        return (
          <div className="bg-gray-100 rounded-lg p-6">
            <div className="text-center space-y-4">
              <div className="text-6xl">📄</div>
              <div>
                <h3 className="font-semibold text-lg">{file.fileName}</h3>
                <p className="text-gray-600">{file.description}</p>
              </div>
              
              {/* Document Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Size:</span> {file.fileSizeFormatted}
                </div>
                <div>
                  <span className="font-medium">Format:</span> {file.fileExtension.toUpperCase()}
                </div>
                {file.pageCount && (
                  <div>
                    <span className="font-medium">Pages:</span> {file.pageCount}
                  </div>
                )}
                {file.language && (
                  <div>
                    <span className="font-medium">Language:</span> {file.language}
                  </div>
                )}
              </div>

              {/* Download Button */}
              <button
                onClick={() => window.open(file.fileUrl, '_blank')}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Download Document
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-100 rounded-lg p-6">
            <div className="text-center space-y-4">
              <div className="text-6xl">📁</div>
              <div>
                <h3 className="font-semibold text-lg">{file.fileName}</h3>
                <p className="text-gray-600">{file.description}</p>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>File Type: {file.fileExtension.toUpperCase()}</p>
                <p>Size: {file.fileSizeFormatted}</p>
              </div>

              <button
                onClick={() => window.open(file.fileUrl, '_blank')}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Download File
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 ${className}`}>
      <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">
              {fileTypeCategory === 'image' && '🖼️'}
              {fileTypeCategory === 'video' && '🎥'}
              {fileTypeCategory === 'audio' && '🎧'}
              {fileTypeCategory === 'document' && '📄'}
              {!['image', 'video', 'audio', 'document'].includes(fileTypeCategory) && '📁'}
            </span>
            <div>
              <h2 className="font-semibold text-gray-900">{file.fileName}</h2>
              <p className="text-sm text-gray-600">
                {file.fileSizeFormatted} • {file.fileExtension.toUpperCase()}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
          {renderContent()}
        </div>

        {/* Footer with metadata */}
        <div className="p-4 border-t bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Uploaded by:</span>
              <p>{file.uploadBy.firstName} {file.uploadBy.lastName}</p>
            </div>
            <div>
              <span className="font-medium">Category:</span>
              <p className="capitalize">{file.category.replace('-', ' ')}</p>
            </div>
            <div>
              <span className="font-medium">Department:</span>
              <p className="uppercase">{file.department}</p>
            </div>
            <div>
              <span className="font-medium">Level:</span>
              <p>{file.level}</p>
            </div>
            {file.courseCode && (
              <div>
                <span className="font-medium">Course:</span>
                <p>{file.courseCode}</p>
              </div>
            )}
            <div>
              <span className="font-medium">Downloads:</span>
              <p>{file.downloadCount}</p>
            </div>
            <div>
              <span className="font-medium">Views:</span>
              <p>{file.viewCount}</p>
            </div>
            <div>
              <span className="font-medium">Uploaded:</span>
              <p>{new Date(file.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {file.tags && file.tags.length > 0 && (
            <div className="mt-3">
              <span className="font-medium text-sm text-gray-600">Tags:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {file.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultimediaViewer; 