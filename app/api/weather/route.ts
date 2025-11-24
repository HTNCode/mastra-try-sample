import { NextResponse } from "next/server";
import { getWeather } from "@/mastra/tools/weather-tool";
import type { WeatherToolOutput } from "@/mastra/tools/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const location = searchParams.get("location") ?? "Tokyo";

    const data: WeatherToolOutput = await getWeather(location);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
