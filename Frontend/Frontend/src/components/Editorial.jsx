import { useState, useRef, useEffect } from 'react';
import { Play, Pause, FastForward, Rewind, StopCircle, Volume2, VolumeX } from 'lucide-react';

const Editorial = ({ secureUrl, thumbnailUrl, duration }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1); // 0 to 1
  const [isMuted, setIsMuted] = useState(false);

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const stopVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const skipTime = (amount) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + amount));
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const changePlaybackRate = (rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume === 0 ? 0.5 : volume; // Restore to previous volume or default
        setVolume(volume === 0 ? 0.5 : volume);
      } else {
        videoRef.current.volume = 0;
        setVolume(0);
      }
      setIsMuted(!isMuted);
    }
  };

  // Update current time during playback
  useEffect(() => {
    const video = videoRef.current;
    
    const handleTimeUpdate = () => {
      if (video) setCurrentTime(video.currentTime);
    };

    const handleVideoEnd = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleVideoEnd);
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleVideoEnd);
      };
    }
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [playbackRate, volume, isMuted]);

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl bg-gray-900"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={secureUrl}
        poster={thumbnailUrl}
        onClick={togglePlayPause}
        className="w-full aspect-video bg-black cursor-pointer object-cover"
      />
      
      {/* Video Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ease-in-out ${
          isHovering || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Row: Play/Pause, Stop, Rewind, Fast Forward */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlayPause}
              className="btn btn-circle btn-primary btn-lg shadow-lg"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6"/>
              ) : (
                <Play className="w-6 h-6 translate-x-px"/>
              )}
            </button>
            <button
              onClick={stopVideo}
              className="btn btn-circle btn-ghost text-white hover:bg-gray-700 tooltip tooltip-bottom"
              data-tip="Stop"
              aria-label="Stop"
            >
              <StopCircle className="w-6 h-6"/>
            </button>
            <button
              onClick={() => skipTime(-10)}
              className="btn btn-circle btn-ghost text-white hover:bg-gray-700 tooltip tooltip-bottom"
              data-tip="Rewind 10s"
              aria-label="Rewind 10 seconds"
            >
              <Rewind className="w-6 h-6"/>
            </button>
            <button
              onClick={() => skipTime(10)}
              className="btn btn-circle btn-ghost text-white hover:bg-gray-700 tooltip tooltip-bottom"
              data-tip="Forward 10s"
              aria-label="Forward 10 seconds"
            >
              <FastForward className="w-6 h-6"/>
            </button>
          </div>

          {/* Playback Speed & Volume Controls */}
          <div className="flex items-center gap-3">
            {/* Playback Speed Dropdown */}
            <div className="dropdown dropdown-top dropdown-end">
              <label tabIndex={0} className="btn btn-ghost text-white hover:bg-gray-700 m-1 tooltip tooltip-bottom" data-tip="Playback Speed">
                {playbackRate}x
              </label>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-gray-800 rounded-box w-28 text-white">
                <li><button onClick={() => changePlaybackRate(0.5)} className="btn btn-ghost btn-sm">0.5x</button></li>
                <li><button onClick={() => changePlaybackRate(1)} className="btn btn-ghost btn-sm">1x</button></li>
                <li><button onClick={() => changePlaybackRate(1.5)} className="btn btn-ghost btn-sm">1.5x</button></li>
                <li><button onClick={() => changePlaybackRate(2)} className="btn btn-ghost btn-sm">2x</button></li>
              </ul>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="btn btn-circle btn-ghost text-white hover:bg-gray-700 tooltip tooltip-bottom"
                data-tip={isMuted ? "Unmute" : "Mute"}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-6 h-6"/> : <Volume2 className="w-6 h-6"/>}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="range range-xs range-primary w-24"
                aria-label="Volume"
              />
            </div>
          </div>
        </div>
        
        {/* Bottom Row: Progress Bar and Time */}
        <div className="flex items-center w-full">
          <span className="text-white text-sm font-mono mr-3 w-12 text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={(e) => {
              if (videoRef.current) {
                videoRef.current.currentTime = Number(e.target.value);
                setCurrentTime(Number(e.target.value));
              }
            }}
            className="range range-primary range-sm flex-1 cursor-pointer"
            aria-label="Video progress"
          />
          <span className="text-white text-sm font-mono ml-3 w-12">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Editorial;