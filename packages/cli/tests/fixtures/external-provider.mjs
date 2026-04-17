import { stdin, stdout } from "node:process";

let input = "";
stdin.setEncoding("utf8");
stdin.on("data", (chunk) => {
  input += chunk;
});
stdin.on("end", () => {
  const payload = JSON.parse(input);
  const name = payload.rootDir.split("/").filter(Boolean).at(-1) ?? "project";
  stdout.write(
    JSON.stringify([
      {
        topic: "name",
        recommended: `${name}-external`,
        alternatives: [],
        reasons: ["Provided by external fixture provider."],
        risks: [],
        openQuestions: []
      },
      {
        topic: "profile",
        recommended: "web",
        alternatives: ["infra"],
        reasons: ["Fixture provider chooses web profile."],
        risks: [],
        openQuestions: []
      }
    ])
  );
});
