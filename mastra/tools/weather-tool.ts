import { createTool } from "@mastra/core/tools";
import { z } from "zod";

interface GeocodingResponse {
  results: {
    latitude: number;
    longitude: number;
    name: string;
  }[];
}
export interface WeatherResponse {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_gusts_10m: number;
    weather_code: number;
  };
}

export const weatherTool = createTool({
  id: "get-weather",
  description: "Get current weather for a location",
  inputSchema: z.object({
    location: z.string().describe("City name"),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    feelsLike: z.number(),
    humidity: z.number(),
    windSpeed: z.number(),
    windGust: z.number(),
    conditions: z.string(),
    location: z.string(),
  }),
  execute: async ({ context }) => {
    return await getWeather(context.location);
  },
});

export const getWeather = async (location: string) => {
  // まずは日本語の地名に強めのバイアスで検索（language=ja, country=JP）。
  // 見つからない場合は、英語化のフォールバックや language=en でも再検索します。
  const normalized = normalizeJapaneseCity(location);

  const tryQueries: Array<{ name: string; params: Record<string, string> }> = [
    { name: location, params: { language: "ja", country: "JP" } },
    { name: location, params: { language: "en", country: "JP" } },
    ...(normalized && normalized !== location
      ? [
          { name: normalized, params: { language: "en", country: "JP" } },
          { name: normalized, params: { language: "en" } },
        ]
      : []),
  ];

  let found: GeocodingResponse["results"][number] | null = null;

  for (const q of tryQueries) {
    const search = new URL("https://geocoding-api.open-meteo.com/v1/search");
    search.searchParams.set("name", q.name);
    search.searchParams.set("count", "1");
    search.searchParams.set("format", "json");
    for (const [k, v] of Object.entries(q.params))
      search.searchParams.set(k, v);

    const res = await fetch(search.toString());
    if (!res.ok) continue;
    const data = (await res.json()) as GeocodingResponse;
    if (data.results?.[0]) {
      found = data.results[0];
      break;
    }
  }

  if (!found) {
    throw new Error(`Location '${location}' not found`);
  }

  const { latitude, longitude, name } = found;

  // 非商用利用は無料でアクセスできる天気API
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,weather_code`;

  const response = await fetch(weatherUrl);
  const data = (await response.json()) as WeatherResponse;

  return {
    temperature: data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    windGust: data.current.wind_gusts_10m,
    conditions: getWeatherCondition(data.current.weather_code),
    location: name,
  };
};

// よく使われる日本の主要都市の簡易マップ。
// 一般化のための外部依存は増やさず、ヒット率を上げるための軽いフォールバックです。
function normalizeJapaneseCity(input: string): string {
  const s = input.trim();
  const map: Record<string, string> = {
    東京: "Tokyo",
    東京都: "Tokyo",
    大阪: "Osaka",
    大阪市: "Osaka",
    京都: "Kyoto",
    横浜: "Yokohama",
    名古屋: "Nagoya",
    札幌: "Sapporo",
    神戸: "Kobe",
    福岡: "Fukuoka",
    仙台: "Sendai",
    広島: "Hiroshima",
    川崎: "Kawasaki",
    さいたま: "Saitama",
    千葉: "Chiba",
    静岡: "Shizuoka",
    金沢: "Kanazawa",
    那覇: "Naha",
  };
  return map[s] ?? s;
}

function getWeatherCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: "快晴",
    1: "ほぼ晴れ",
    2: "一部曇り",
    3: "曇り",
    45: "霧",
    48: "着氷性の霧",
    51: "霧雨（弱い）",
    53: "霧雨（並）",
    55: "霧雨（強い）",
    56: "着氷性の霧雨（弱い）",
    57: "着氷性の霧雨（強い）",
    61: "雨（弱い）",
    63: "雨（並）",
    65: "雨（強い）",
    66: "着氷性の雨（弱い）",
    67: "着氷性の雨（強い）",
    71: "降雪（弱い）",
    73: "降雪（並）",
    75: "降雪（強い）",
    77: "雪粒",
    80: "にわか雨（弱い）",
    81: "にわか雨（並）",
    82: "にわか雨（激しい）",
    85: "にわか雪（弱い）",
    86: "にわか雪（強い）",
    95: "雷雨",
    96: "雹を伴う雷雨（弱い）",
    99: "雹を伴う雷雨（激しい）",
  };
  return conditions[code] || "不明";
}
