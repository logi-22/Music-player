import useStore from "../store";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Play, X, Clock } from "lucide-react";

function Playlist({ playTrack, tracks }) {
  const {
    favorites,
    playlists,
    currentPlaylist,
    setCurrentPlaylist,
    removeFromPlaylist,
  } = useStore();

  const displayTracks = currentPlaylist === "favorites"
    ? favorites
    : currentPlaylist
      ? playlists[currentPlaylist] || []
      : tracks;

  const activeTab = currentPlaylist || "main";

  const handleTabChange = (value) => {
    if (value === "main") {
      setCurrentPlaylist(null);
    } else {
      setCurrentPlaylist(value);
    }
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${secs}`;
  };

  return (
    <div className="flex flex-col items-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center">Playlist</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="w-full">
              <TabsTrigger value="main">Main Playlist</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              {Object.keys(playlists).map((name) => (
                <TabsTrigger key={name} value={name}>
                  {name}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={activeTab} className="mt-4">
              <div className="space-y-2">
                {displayTracks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No tracks in this playlist
                  </p>
                ) : (
                  <div className="grid grid-cols-[40px_3fr_2fr_1fr_50px] gap-2 text-sm text-gray-500 mb-2">
                    <div>#</div>
                    <div>Title</div>
                    <div>Artist</div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Duration
                    </div>
                    <div></div>
                  </div>
                )}
                {displayTracks.map((track, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[40px_3fr_2fr_1fr_50px] gap-2 items-center p-3 bg-card border rounded-lg"
                  >
                    <div>{index + 1}</div>
                    <div className="flex items-center space-x-3">
                      <img
                        src={track.image || "/music-notes-background-illustration-ai-generative-free-photo.jpg"}
                        alt="Album"
                        className="w-10 h-10 rounded"
                      />
                      <div>
                        <h3 className="text-lg">{track.title}</h3>
                      </div>
                    </div>
                    <div>{track.artist}</div>
                    <div>{track.duration_ms ? formatTime(track.duration_ms) : "-"}</div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => track.uri && playTrack(index)}
                        disabled={!track.uri}
                        title={track.uri ? "Play track" : "Track not available"}
                      >
                        {track.uri ? <Play className="h-4 w-4" /> : "🚫"}
                      </Button>
                      {currentPlaylist && currentPlaylist !== "favorites" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromPlaylist(track, currentPlaylist)}
                          title="Remove from playlist"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default Playlist;