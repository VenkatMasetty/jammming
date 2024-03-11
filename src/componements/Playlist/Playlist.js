import React, { useCallback } from "react";
import Tracklist from "../Tracklist/Tracklist";
import './Playlist.css';

const Playlist = (props) => {
    const handleNameChange = useCallback(
      (event) => {
        props.onNameChange(event.target.value);
      },
      [props.onNameChange]
    );

    const savePlaylist = useCallback(() => {
        // Check if the playlist name is empty or if there are no tracks in the playlist.
        if (!props.playlistName.trim() || props.playlistTracks.length === 0) {
            alert("Please enter a playlist name and add at least one track.");
            return;
        }
        props.onSave();
    }, [props.playlistName, props.playlistTracks, props.onSave]);

    return (
      <div className="Playlist">
        <input defaultValue="New Playlist" class="input-group_input" onChange={handleNameChange} />
        <Tracklist
          tracks={props.playlistTracks}
          isRemoval={true}
          onRemove={props.onRemove}
        />
        <button className="Playlist-save" onClick={savePlaylist}>
          SAVE TO SPOTIFY
        </button>
      </div>
    );
};

export default Playlist;
