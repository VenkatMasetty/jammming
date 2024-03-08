// Define constants for the Spotify client ID and the redirect URI. These are required for the OAuth process.
const clientId = ''; // Your Spotify application's client ID.
const redirectUri = 'http://localhost:3000'; // The redirect URI after the user authorizes your app, must match the one in your Spotify dashboard.

// Variable to store the user's access token once we have it.
let accessToken;

// Define an object to interact with the Spotify API.
const Spotify = {
  // Method to retrieve an access token from Spotify.
  getAccessToken() {
    // If we already have an access token, log it and return it.
    if (accessToken) {
      console.log('Access token', accessToken);
      return accessToken;
    }

    // Attempt to retrieve the access token and expiration time from the URL.
    const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    console.log('Access token match', accessTokenMatch);
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
    console.log('expires' + expiresInMatch);

    // If both the access token and expiration time were found in the URL...
    if (accessTokenMatch && expiresInMatch) {
      // Store the access token.
      accessToken = accessTokenMatch[1];
      // Convert the expiration time to a number and set a timer to clear the access token when it expires.
      const expiresIn = Number(expiresInMatch[1]);
      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      // Clear the access token from the URL to prevent it from being reused.
      window.history.pushState('Access Token', null, '/');
      return accessToken;
    } else {
      // If the access token isn't in the URL, redirect the user to Spotify's authorization page.
      const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
      window.location = accessUrl;
    }
  },

  // Method to search the Spotify library.
  search(term) {
    const accessToken = Spotify.getAccessToken();
    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
      headers: {
        Authorization: `Bearer ${accessToken}` // Use the access token for authorization.
      }
    }).then(response => response.json()
    ).then(jsonResponse => {
      if (!jsonResponse.tracks) {
        return []; // If no tracks were returned, return an empty array.
      }
      // Map the returned tracks to a simplified format.
      return jsonResponse.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        uri: track.uri
      }));
    });
  },

  // Method to save a custom playlist to the user's Spotify account.
  savePlaylist(name, trackUris) {
    if (!name || !trackUris.length) {
      return; // If no name or track URIs are provided, exit the function.
    }

    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` }; // Headers for authorization.
    let userId;

    // First, retrieve the user's Spotify ID.
    return fetch('https://api.spotify.com/v1/me', {headers: headers}
    ).then(response => response.json()
    ).then(jsonResponse => {
      userId = jsonResponse.id;
      // Then, create a new playlist with the given name.
      return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        headers: headers,
        method: 'POST',
        body: JSON.stringify({name: name})
      }).then(response => response.json()
      ).then(jsonResponse => {
        const playlistId = jsonResponse.id;
        // Finally, add tracks to the newly created playlist.
        return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
          headers: headers,
          method: 'POST',
          body: JSON.stringify({uris: trackUris})
        });
      });
    });
  }
};

export default Spotify;
