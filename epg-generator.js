import fetch from 'node-fetch';
import fs from 'fs';
import XMLWriter from 'xml-writer';
import cliProgress from 'cli-progress';
import zlib from 'zlib';

const egpPageSize = 2000;

function getXMLTVTimeFromUTC(utcString) {
  // Hackys way to convert the time from UTC string to XML TV
  // 2021-08-23T07:15:00Z => 20210829130000 +0000
  return utcString.replace(/[-:ZT]/g, '') + ' +0000';
}

async function getChannels() {
  const channelURL = 'https://tv7api2.tv.init7.net/api/tvchannel/';
  const channelsResponse = await fetch(channelURL);
  return channelsResponse.json();
}

async function getEpg(channel, limit = 1000, offset = 0) {
  const epgUrl = `https://tv7api2.tv.init7.net/api/epg/?limit=${limit}&channel=${channel}&offset=${offset}`;
  const egpResponse = await fetch(epgUrl);
  return egpResponse.json();
}

const xw = new XMLWriter;
xw.startDocument();

xw.startElement('tv');
const channels = await getChannels();
for (let channel of channels.results) {
  xw
    .startElement('channel').writeAttribute('id', channel.pk)
      .startElement('display-name').writeAttribute('lang', 'de').text(channel.name).endElement()
      .startElement('display-name').writeAttribute('lang', 'fr').text(channel.name).endElement()
      .startElement('display-name').writeAttribute('lang', 'it').text(channel.name).endElement()
      .startElement('icon').writeAttribute('src', channel.logo).endElement()
    .endElement()
}

const progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
progress.start(channels.results.length, 0);

for (let channel of channels.results) {
  let epg;
  do {
    let page = 0;
    epg = await getEpg(channel.pk, egpPageSize, page*egpPageSize);
    for (let result of epg.results) {
      xw
        .startElement('programme')
          .writeAttribute('start', getXMLTVTimeFromUTC(result.timeslot.lower))
          .writeAttribute('stop', getXMLTVTimeFromUTC(result.timeslot.upper))
          .writeAttribute('channel', channel.pk)
          .writeAttribute('catchup-id', result.pk)
          .startElement('title').text(result.title).endElement();
        if (result['sub_title']) {
          xw.startElement('sub-title').text(result['sub_title']).endElement();
        }
        if (result.desc) {
          xw.startElement('desc').text(result.desc).endElement();
        }
        if (result.icons && result.icons.length > 0) {
          xw.startElement('icon').writeAttribute('src', result.icons[0]).endElement();
        }
        xw.endElement();
    }
    page++;
  } while (epg.count === 2000)


  progress.increment();
}
progress.stop();

xw.endElement();
xw.endDocument();

zlib.gzip(xw.toString(), function(error, data) {
  fs.writeFileSync('output/epg.xml.gz', data);
  console.log('XML File written');
});

