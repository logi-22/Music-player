import React, { useEffect, useRef, useState } from "react";

const NowPlaying = ({ track, isPlaying, togglePlay, nextTrack, prevTrack, audioRef }) => {
  const progressRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [track]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleSeek = (e) => {
    const progressBar = progressRef.current;
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audioRef.current.currentTime = newTime;
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white rounded-2xl shadow-lg text-center">
      <h2 className="text-xl font-semibold mb-2">{track.title}</h2>
      <p className="text-sm text-gray-600 mb-4">{track.artist}</p>

      <div className="flex justify-center gap-4 mt-4">
        <button onClick={prevTrack} className="px-3 py-1 bg-gray-300 rounded-full">⏮</button>
        <button onClick={togglePlay} className="px-5 py-2 bg-blue-500 text-white rounded-full">
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button onClick={nextTrack} className="px-3 py-1 bg-gray-300 rounded-full">⏭</button>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div
          ref={progressRef}
          className="relative h-2 bg-gray-300 rounded-full mt-1 cursor-pointer"
          onClick={handleSeek}
        >
          <div
            className="absolute h-2 bg-blue-500 rounded-full"
            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default NowPlaying;
