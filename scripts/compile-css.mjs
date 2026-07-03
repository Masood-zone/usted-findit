import { readFileSync, writeFileSync } from "node:fs";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";

const input = "global.css";
const css = readFileSync(input, "utf8");

const result = await postcss([tailwindcss]).process(css, { from: input });

writeFileSync(input, result.css);
console.log("global.css compiled successfully");
