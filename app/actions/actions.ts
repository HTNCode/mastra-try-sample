"use server";

import { getWeather } from "@/mastra/tools/weather-tool";
import type { WeatherToolOutput } from "@/mastra/tools/types";

/* 天気情報を取得するアクション
 *
 * @param _prev - 前の状態（未使用）
 * @param formData - フォームデータ。ロケーションを想定。
 * @returns 天気情報または null
 */
export async function fetchWeatherAction(
  _prev: WeatherToolOutput | null,
  formData: FormData
): Promise<WeatherToolOutput | null> {
  const location = (formData.get("location") as string | null)?.trim() || "";
  if (!location) return null;

  const data = await getWeather(location);
  return data;
}
