import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import NowPlaying from "./components/NowPlaying";
import Playlist from "./components/Playlist";
import Auth from "./components/Auth";
import Callback from "./components/Callback.jsx";
import ErrorBoundary from "./components/ErrorBoundary";
import axios from "axios";
import getSpotifyToken from "./api/spotify";
import { getSpotifyAuthUrl } from "./api/spotify";
import useStore from "./store";
import { supabase } from "./supabase";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import SpotifyLogo from "./components/assets/images.png"; // or "spotify.png" if that's the correct file


function App() {
  const [tracks, setTracks] = useState([]);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [query, setQuery] = useState("genre:pop");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [player, setPlayer] = useState(null);
  const audioRef = useRef(new Audio()); // Initialize audio element directly
  const {
    favorites,
    playlists,
    currentPlaylist,
    user,
    isAuthenticated,
    authLoading,
    initializeAuth,
    setUser,
    spotifyToken,
    setSpotifyToken,
    logout,
  } = useStore();

  useEffect(() => {
    if (!spotifyToken) return;

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "React Spotify Player",
        getOAuthToken: (cb) => cb(spotifyToken),
        volume: 0.5,
      });

      player.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
        setPlayer(player);
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      player.addListener("player_state_changed", (state) => {
        if (!state) return;
        setIsPlaying(!state.paused);
        setTrackIndex(
          tracks.findIndex((t) => t.uri === state.track_window.current_track.uri) || 0
        );
      });

      player.connect();
    };

    return () => {
      if (player) player.disconnect();
    };
  }, [spotifyToken, tracks]);

  useEffect(() => {
    let isMounted = true;

    const setupAuth = async () => {
      const initialUser = await initializeAuth();
      if (isMounted && initialUser) setUser(initialUser);

      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (!isMounted) return;
        const newUser = session?.user ?? null;
        setUser(newUser);
      });

      return () => {
        isMounted = false;
        authListener.subscription.unsubscribe();
      };
    };

    setupAuth().catch((err) => {
      if (isMounted) setError("Failed to initialize authentication");
    });

    return () => {
      isMounted = false;
    };
  }, [initializeAuth, setUser]);

  const fetchTracks = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getSpotifyToken();
      const response = await axios.get(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const fetchedTracks = response.data.tracks.items.map((item) => ({
        title: item.name,
        artist: item.artists[0]?.name || "Unknown Artist",
        src: item.preview_url,
        hasPreview: !!item.preview_url,
        image: item.album?.images[0]?.url || "/music-notes-background-illustration-ai-generative-free-photo.jpg",
        uri: item.uri,
      }));
      console.log("Fetched tracks:", fetchedTracks); // Debug
      setTracks(fetchedTracks);
      setTrackIndex(0);
      setIsPlaying(false);
    } catch (error) {
      setError("Failed to load tracks. Please try again.");
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !authLoading) fetchTracks();
  }, [query, isAuthenticated, authLoading]);

  const togglePlay = () => {
    if (player && spotifyToken) {
      player.togglePlay();
    } else if (tracks[trackIndex]?.src) {
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    if (tracks.length === 0) return;

    if (player && spotifyToken) {
      player.nextTrack().catch((err) => console.error("Next track error:", err));
    } else if (tracks.length > 0) {
      const newIndex = (trackIndex + 1) % tracks.length;
      setTrackIndex(newIndex);
      setIsPlaying(tracks[newIndex]?.src ? true : false); // Only play if preview exists
    }
  };

  const prevTrack = () => {
    if (tracks.length === 0) return;

    if (player && spotifyToken) {
      player.previousTrack().catch((err) => console.error("Previous track error:", err));
    } else if (tracks.length > 0) {
      const newIndex = (trackIndex - 1 + tracks.length) % tracks.length;
      setTrackIndex(newIndex);
      setIsPlaying(tracks[newIndex]?.src ? true : false); // Only play if preview exists
    }
  };

  const playTrack = (index) => {
    let tracksToPlay = tracks;
    if (currentPlaylist === "favorites") tracksToPlay = favorites;
    else if (currentPlaylist && playlists[currentPlaylist]) tracksToPlay = playlists[currentPlaylist];

    const track = tracksToPlay[index];
    if (player && spotifyToken && track.uri) {
      player.play({ uris: [track.uri] });
    } else {
      const globalIndex = tracks.findIndex((t) => t.src === track.src);
      setTrackIndex(globalIndex >= 0 ? globalIndex : 0);
      setIsPlaying(true);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.elements.search.value.trim();
    setQuery(searchTerm || "genre:pop");
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Initializing authentication...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/callback" element={<Callback />} />
        <Route
          path="/"
          element={
            <ErrorBoundary>
              <div className="min-h-screen bg-gradient-to-r from-gray-200 to-purple-500">
                {isAuthenticated ? (
                  <>
                    <div className="p-4 flex justify-between items-center bg-white/10 backdrop-blur-sm sticky top-0 z-10">
                      <div>
                      {!spotifyToken && (
  <img
    src={SpotifyLogo}
    alt="Spotify Logo"
    className="w-15 h-10"
    title="Spotify Connected"
  />
)}

                      </div>
                      <Button
                        variant="destructive"
                        onClick={logout}
                        disabled={authLoading}
                      >
                        Logout
                      </Button>
                    </div>
                    <form onSubmit={handleSearch} className="p-4 text-center">
                      <Input
                        type="text"
                        name="search"
                        placeholder="Search tracks (e.g., 'artist:drake' or 'genre:pop')"
                        className="inline-block w-64 p-2 mr-2 border-border"
                        defaultValue={query}
                      />
                      <Button type="submit">Search</Button>
                    </form>
                    {loading ? (
                      <div className="text-center mt-4">Loading tracks...</div>
                    ) : error ? (
                      <div className="text-center mt-4">{error}</div>
                    ) : tracks.length > 0 ? (
                      <>
                        {/* Removed <audio> from here since audioRef is initialized in useRef */}
                        <Tabs defaultValue="nowplaying" className="w-full px-6">
                          <TabsList className="flex justify-center mb-6">
                            <TabsTrigger value="nowplaying">Now Playing</TabsTrigger>
                            <TabsTrigger value="playlist">Playlist</TabsTrigger>
                          </TabsList>
                          <TabsContent value="nowplaying" className="bg-gradient-to-r from-gray-200 to-purple-500">
                            <NowPlaying
                              track={tracks[trackIndex]}
                              isPlaying={isPlaying}
                              togglePlay={togglePlay}
                              nextTrack={nextTrack}
                              prevTrack={prevTrack}
                              audioRef={audioRef}
                            />
                          </TabsContent>
                          <TabsContent value="playlist" className="bg-gradient-to-r from-gray-200 to-purple-500">
                            <Playlist playTrack={playTrack} tracks={tracks} />
                          </TabsContent>
                        </Tabs>
                      </>
                    ) : (
                      <div className="text-center mt-4">No tracks found. Try a different search.</div>
                    )}
                  </>
                ) : (
                  <Auth />
                )}
              </div>
            </ErrorBoundary>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;