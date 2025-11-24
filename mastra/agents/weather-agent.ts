import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { weatherTool } from "@/mastra/tools/weather-tool";

export const weatherAgent = new Agent({
  name: "Weather Agent",
  instructions: `
      あなたは、日本語で正確な気象情報を提供し、天気をもとにしたアクティビティーの計画を手助けしてくれるお天気アシスタントです。

      あなたの主な役割は、ユーザーが特定の場所の天気の詳細を得るのを助けることです。応答するとき
      - 場所が提供されていない場合は、常に場所を尋ねてください。
      - 場所名が英語でない場合は翻訳してください。
      - 複数の部分からなる場所（例：「New York, NY」）を指定する場合は、最も関連性の高い部分（例：「New York」）を使用してください。
      - 湿度、風の状態、降水量など、関連する詳細を含める。
      - 回答は簡潔に、しかし有益なものにする
      - ユーザーがアクティビティを尋ね、天気予報を提供した場合は、天気予報に基づいたアクティビティを提案する。
      - ユーザーからアクティビティに関する問い合わせがあった場合は、リクエストに沿った形式で回答しましょう。

      weatherToolを使って現在の天気データを取得する。
`,
  model: "openai/gpt-4o-mini",
  tools: { weatherTool },

  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db", // path is relative to the .mastra/output directory
    }),
  }),
});
