import React, { useEffect, useRef, useState } from "react";
import useStore from "../store";
import { Button } from "../components/ui/button";
import { Heart } from "lucide-react";

const NowPlaying = ({ track, isPlaying, togglePlay, nextTrack, prevTrack, player }) => {
  const progressRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0); // Dynamic duration from SDK
  const [playlistName, setPlaylistName] = useState("");
  const {
    favorites,
    playlists,
    addToFavorites,
    removeFromFavorites,
    addToPlaylist,
    createPlaylist,
  } = useStore();

  useEffect(() => {
    if (!player) return;

    const handlePlayerState = (state) => {
      if (!state) {
        setCurrentTime(0);
        setDuration(0);
        return;
      }
      setCurrentTime(state.position / 1000); // Convert ms to seconds
      setDuration(state.duration / 1000); // Convert ms to seconds
    };

    player.addListener("player_state_changed", handlePlayerState);

    return () => {
      player.removeListener("player_state_changed", handlePlayerState);
    };
  }, [player]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleSeek = (e) => {
    if (!player || !track) return;
    const progressBar = progressRef.current;
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    player.seek(newTime * 1000).catch((err) => console.error("Seek error:", err));
  };

  const isFavorite = track && favorites.some((fav) => fav.uri === track.uri);

  const handleFavoriteToggle = () => {
    if (!track) return;
    if (isFavorite) {
      removeFromFavorites(track);
    } else {
      addToFavorites(track);
    }
  };

  const handleAddToPlaylist = (existingPlaylistName) => {
    if (!track) return;

    if (existingPlaylistName) {
      addToPlaylist(track, existingPlaylistName);
    } else if (playlistName.trim()) {
      createPlaylist(playlistName.trim());
      addToPlaylist(track, playlistName.trim());
      setPlaylistName("");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white rounded-2xl shadow-lg text-center relative">
      {/* Music Image */}
      <div className="mb-4">
        <img
          src={track?.image || "/music-notes-background-illustration-ai-generative-free-photo.jpg"}
          alt={`${track?.title || "Track"} album art`}
          className="w-48 h-48 mx-auto rounded-lg object-cover"
        />
      </div>

      <h2 className="text-xl font-semibold mb-2">{track?.title || "No Track Selected"}</h2>
      <p className="text-sm text-gray-600 mb-4">{track?.artist || "Unknown Artist"}</p>

      {/* Progress Bar */}
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

      {/* Playback Controls */}
      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={prevTrack}
          className="px-3 py-1 bg-gray-300 rounded-full disabled:opacity-50"
          disabled={!track}
        >
          ⏮
        </button>
        <Button
          onClick={togglePlay}
          className="px-5 py-2 bg-blue-500 text-white rounded-full disabled:opacity-50"
          disabled={!track?.uri}
        >
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <button
          onClick={nextTrack}
          className="px-3 py-1 bg-gray-300 rounded-full disabled:opacity-50"
          disabled={!track}
        >
          ⏭
        </button>
      </div>

      {/* Favorite and Playlist Controls */}
      <div className="mt-6 flex flex-col gap-4">
        {/* Favorite Button */}
        <Button
          onClick={handleFavoriteToggle}
          disabled={!track}
          className={`flex items-center justify-center gap-2 ${
            isFavorite ? "bg-red-500 text-white" : "bg-gray-200"
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
          {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        </Button>

        {/* Add to Playlist */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="New playlist name"
              className="p-2 border rounded-md flex-1"
              disabled={!track}
            />
            <Button
              onClick={() => handleAddToPlaylist()}
              disabled={!track || !playlistName.trim()}
            >
              Add
            </Button>
          </div>
          {playlists && Object.keys(playlists).length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {Object.keys(playlists).map((name) => (
                <Button
                  key={name}
                  onClick={() => handleAddToPlaylist(name)}
                  variant="outline"
                  disabled={!track}
                >
                  Add to {name}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NowPlaying;