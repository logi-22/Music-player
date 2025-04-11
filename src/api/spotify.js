import axios from "axios";

const CLIENT_ID = "7bf016f6c9a24351b46f75530bc8a973";
const CLIENT_SECRET = "0694254cedc84d35b432190e379c70e4";
const REDIRECT_URI = "http://127.0.0.1:3000/callback";
const SCOPES = "streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state";

export const getSpotifyAuthUrl = () => {
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
  return authUrl;
};

export const getTokenFromHash = () => {
  const hash = window.location.hash
    .substring(1)
    .split("&")
    .reduce((acc, item) => {
      const [key, value] = item.split("=");
      acc[key] = value;
      return acc;
    }, {});
  window.location.hash = "";
  return hash.access_token;
};

const getSpotifyToken = async () => {
  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      "grant_type=client_credentials",
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Basic " + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`),
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Error getting Spotify token:", error);
    throw error;
  }
};

export default getSpotifyToken;