// Replace "your_channel_name" with your Twitch channel name
const channelName = "vinylminty";
const clientId = "y7akltjivgb4v24f5bonvjw0niesqk";
const accessToken = "frisuj9wvhtjuz665pwhnj0twfejgj";

fetch(`https://api.twitch.tv/helix/streams?user_login=${channelName}`, {
  headers: {
    "Client-ID": clientId,
    "Authorization": `Bearer ${accessToken}`
  }
})
.then(response => response.json())
.then(data => {
  const isLive = data.data.length > 0;

  if (isLive) {
    new Twitch.Embed("twitch-embed", {
      width: "100%",
      height: "100%",
      channel: channelName,
      layout: "video-with-chat",
      theme: "dark"
    });
  }
})
.catch(error => {
  console.error("Error fetching stream status:", error);
});
