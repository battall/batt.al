import fs from "node:fs";

const SAVE_PATH = "iptv-gen.m3u";
let M3U = ``;

const REGEXP_SCRIPT_NEXT_DATA = /<script id\b[^>]*>[\s\S]*?<\/script\b[^>]*>/;
(async function () {
  let body1 = await (await fetch("https://www.blutv.com/canli-yayin")).text();

  let next_data = JSON.parse(
    REGEXP_SCRIPT_NEXT_DATA.exec(body1)[0].slice(
      `<script id="__NEXT_DATA__" type="application/json" nonce="vrdljt4w7of">`.length,
      -9,
    ),
  );

  let channels = next_data.props.pageProps.sections[1].contentItem;

  for (let channel of channels) {
    let channel_config = await (
      await fetch(`https://www.blutv.com/api/player-config?id=${channel.id}&media=mpd`)
    ).json();

    console.log("CHANNEL", channel, channel_config);

    channel_config.media.source;

    M3U += `#EXTINF:-1 tvg-logo="${channel_config.media.poster}" group-title="", ${channel_config.media.title}
${channel_config.media.source}
`;
  }

  fs.writeFileSync(`./${SAVE_PATH}`, M3U);
})();
