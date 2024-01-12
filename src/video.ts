const buildSearchUrl = ({ channelId }: { channelId: string }) => {
  if (!process.env.GOOGLE_API_KEY) {
    console.error("GOOGLE_API_KEY is undefined");
    return undefined;
  }
  return `https://www.googleapis.com/youtube/v3/search?key=${process.env.GOOGLE_API_KEY}&part=snippet&channelId=${channelId}&maxResults=4&fields=items(id,snippet(thumbnails,title,channelTitle))&q="雑談"&order=date`;
};

export const fetchVideo = async ({ channelId }: { channelId: string }) => {
  const searchUrl = buildSearchUrl({ channelId });

  if (!searchUrl) {
    console.error("Failed to build search url.");
    return undefined;
  }

  const res = await fetch(searchUrl, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  return data.items;
};

export const fetchVideos = async () => {
  const items = await Promise.all(
    CHANNEL_ID_LIST_HOLOLIVE.map(async (channelId) => {
      let items;
      try {
        items = await fetchVideo({ channelId });
      } catch (error) {
        console.error(`Failed to fetch video. channelId : ${channelId}`);
      }

      if (!items) {
        return undefined;
      }

      // TODO: asを外す
      const videoList = items.filter(
        (item: { id: { kind: string } }) => item.id.kind === "youtube#video",
      ) as {
        id: { videoId: string };
        snippet: {
          title: string;
          channelTitle: string;
        };
      }[];

      const videoListWithThumbnail = await Promise.all(
        videoList.map(async (video) => {
          let thumbnailUrl = `https://img.youtube.com/vi/${video.id.videoId}/maxresdefault.jpg`;

          // maxresdefault.jpg が存在しない場合は 上下に黒帯が入ってしまうが、hqdefault.jpg を使用する
          const res = await fetch(thumbnailUrl);
          if (res.status !== 200) {
            thumbnailUrl = `https://img.youtube.com/vi/${video.id.videoId}/hqdefault.jpg`;
          }

          return { ...video, thumbnailUrl };
        }),
      );

      return {
        channel: { id: channelId, name: videoList[0].snippet.channelTitle },
        videoList: videoListWithThumbnail,
      };
    }),
  );

  return items.filter((item) => item !== undefined);
};

// 参考 : https://hololive.hololivepro.com/talents
export const CHANNEL_ID_LIST_HOLOLIVE = [
  // 0期生
  "UCp6993wxpyDPHUpavwDFqgg", // ときのそら
  "UC0TXe_LYZ4scaW2XMyi5_kw", // AZki
  "UC-hM6YJuNYVAmUWxeIr9FeA", // さくらみこ
  "UC5CwaMl1eIgY8h02uZw7u8A", // 星街すいせい
  "UCDqI2jOz0weumE8s7paEk6g", // ロボ子さん
  // 1期生
  "UCD8HOxPs4Xvsm8H0ZxXGiBw", // 夜空メル
  "UCFTLzh12_nrtzqBPsTCqenA", // アキ・ローゼンタール
  "UC1CfXB_kRs3C-zaeTG3oGyg", // 赤井はあと
  "UCdn5BQ06XqgXoAxIhbqw5Rg", // 白上フブキ
  "UCQ0UDLQCjY0rmuxCDE38FGg", // 夏色まつり
  // 2期生
  "UC1opHUrw8rvnsadT-iGp7Cg", // 湊あくあ
  "UCXTpFs_3PqI41qX2d9tL2Rw", // 紫咲シオン
  "UC7fk0CB07ly8oSl0aqKkqFg", // 百鬼あやめ
  "UC1suqwovbL1kzsoaZgFZLKg", // 癒月ちょこ
  "UCvzGlP9oQwU--Y0r9id_jnA", // 大空スバル
  // ゲーマーズ
  "UCp-5t9SrOQwXMU7iIjQfARg", // 大神ミオ
  "UCvaTdHTWBGv3MKj3KVqJVCw", // 猫又おかゆ
  "UChAnqc_AY5_I3Px5dig3X1Q", // 戌神ころね
  // 3期生
  "UC1DCedRgGHBdm81E1llLhOQ", // 兎田ぺこら
  "UCvInZx9h3jC2JzsIzoOebWg", // 不知火フレア
  "UCdyqAaZDKHXg4Ahi7VENThQ", // 白銀ノエル
  "UCCzUftO8KOVkV4wQG1vkUvg", // 宝鐘マリン
  // 4期生
  "UCZlDXzGoo7d44bwdNObFacg", // 天音かなた
  "UCqm3BQLlJfvkTsX_hvm0UmA", // 角巻わため
  "UC1uv2Oq6kNxgATlCiez59hw", // 常闇トワ
  "UCa9Y57gfeY0Zro_noHRVrnw", // 姫森ルーナ
  // 5期生
  "UCFKOVgVbGmX65RxO3EtH3iw", // 雪花ラミィ
  "UCAWSyEs_Io8MtpY3m-zqILA", // 桃鈴ねね
  "UCUKD-uaobj9jiqB-VXt71mA", // 獅白ぼたん
  "UCK9V2B22uJYu3N7eR_BT9QA", // 尾丸ポルカ
  // 6期生
  "UCENwRMx5Yh42zWpzURebzTw", // ラプラス・ダークネス
  "UCs9_O1tRPMQTHQ-N_L6FU2g", // 鷹嶺ルイ
  "UC6eWCld0KwmyHFbAqK3V-Rw", // 博衣こより
  "UCIBY1ollUsauvVi4hW4cumw", // 沙花叉クロヱ
  "UC_vMYWcDjmfdpH6r4TTn1MQ", // 風真いろは
] as const;
