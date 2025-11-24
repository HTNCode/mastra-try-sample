"use client";

import React, { useActionState, useEffect } from "react";
import type { WeatherToolOutput } from "@/mastra/tools/types";
import { TEXTS, BUILD_NARRATION } from "@/app/constants/texts";
import { NextPage } from "next";
import { fetchWeatherAction } from "@/app/actions/actions";

/* 天気情報コンポーネント */
const Weather: NextPage = () => {
  const [weatherResponse, formAction, isPending] = useActionState<
    WeatherToolOutput | null,
    FormData
  >(fetchWeatherAction, null);

  useEffect(() => {
    if (!weatherResponse) return;
    const narration = BUILD_NARRATION(weatherResponse);
    // ここはMastraのTTSではなく、ブラウザ組み込みのSpeechSynthesisを使って取得した天気情報を再生してるだけです
    // 参考：https://developer.mozilla.org/ja/docs/Web/API/SpeechSynthesisUtterance
    const utter = new SpeechSynthesisUtterance(narration);
    utter.lang = "ja-JP";
    try {
      window.speechSynthesis.cancel();
    } catch {}
    window.speechSynthesis.speak(utter);
  }, [weatherResponse]);

  return (
    <>
      <h1 className="font-bold text-5xl">{TEXTS.TITLE}</h1>
      <form
        action={formAction}
        className="p-[1rem_0.5rem_1rem_0] gap-2 flex items-start"
      >
        <input
          type="text"
          name="location"
          placeholder={TEXTS.INPUT_PLACEHOLDER}
          className="p-2 border border-gray-600 rounded"
          disabled={isPending}
        />
        <button
          type="submit"
          disabled={isPending}
          className="p-2 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? TEXTS.LOADING_TEXT : TEXTS.BUTTON_TEXT}
        </button>
      </form>
      {!weatherResponse ? null : (
        <div className="pt-4 space-y-1">
          <h2 className="font-semibold text-xl mb-2">
            {TEXTS.RESPONSE_HEADER}
          </h2>
          <p>
            {TEXTS.PLACE}: {weatherResponse.location}
          </p>
          <p>
            {TEXTS.WEATHER}: {weatherResponse.conditions}
          </p>
          <p>
            {TEXTS.TEMPERATURE}: {weatherResponse.temperature}℃
          </p>
          <p>
            {TEXTS.FEELS_LIKE}: {weatherResponse.feelsLike}℃
          </p>
          <p>
            {TEXTS.HUMIDITY}: {weatherResponse.humidity}%
          </p>
          <p>
            {TEXTS.WIND_SPEED}: {weatherResponse.windSpeed}
          </p>
          <p>
            {TEXTS.WIND_GUST}: {weatherResponse.windGust}
          </p>
        </div>
      )}
    </>
  );
};

export default Weather;
