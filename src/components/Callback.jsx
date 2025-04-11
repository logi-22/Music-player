// src/components/Callback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTokenFromHash } from "../api/spotify";
import useStore from "../store";

function Callback() {
  const navigate = useNavigate();
  const { setSpotifyToken } = useStore();

  useEffect(() => {
    const token = getTokenFromHash();
    if (token) {
      setSpotifyToken(token);
      navigate("/");
    }
  }, [navigate, setSpotifyToken]);

  return <div>Redirecting...</div>;
}

export default Callback;