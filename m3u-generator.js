import fetch from 'node-fetch';
import fs from 'fs';

const channelURL = 'https://tv7api2.tv.init7.net/api/tvchannel/';
const m3uURL = 'https://tv7api2.tv.init7.net/api/playlist/default.m3u?rp=true';

const channelsResponse = await fetch(channelURL);
const channels = await channelsResponse.json();

const m3uResponse = await fetch(m3uURL);
const m3u = await m3uResponse.text();

const parts = m3u.split(`\n`);
for (let i = 1; i < parts.length; i+=2) {
  const channel = channels.results.find(channel => channel.hls_src == parts[i+1]);
  if (channel && channel.has_replay) {
    parts[i] = parts[i].replace(
      '#EXTINF:0',
      `#EXTINF:0 catchup="default" catchup-source="https://tv7api2.tv.init7.net/api/replay/?channel=${channel.pk}&epg_pk={catchup-id}" catchup-days="7",`
    )
  }
}

fs.writeFileSync('output/TV7-replay.m3u', parts.join('\n'));

console.log('M3U File written');
