// 定数テキスト
export const TEXTS = {
  TITLE: "Mastra Agent Test Page",
  INPUT_PLACEHOLDER: "地域名を入力",
  BUTTON_TEXT: "天気情報を取得",
  LOADING_TEXT: "Loading...",
  RESPONSE_HEADER: "Response",
  PLACE: "ヒットした場所",
  WEATHER: "天気",
  TEMPERATURE: "気温",
  FEELS_LIKE: "体感温度",
  HUMIDITY: "湿度",
  WIND_SPEED: "風速",
  WIND_GUST: "突風",
};

// 天気読み上げ文を生成するための定数関数
export const BUILD_NARRATION = (data: {
  location: string;
  conditions: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windGust: number;
}) =>
  `${data.location}の現在の天気は${data.conditions}。気温は${data.temperature}度、体感${data.feelsLike}度。湿度${data.humidity}%、風速${data.windSpeed}、突風${data.windGust}です。`;
