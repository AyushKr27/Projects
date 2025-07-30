import { readFileSync, writeFileSync } from "fs";

const filePath = "firebase-service-account.json";
const outputPath = "encoded.txt";

try {
  const content = readFileSync(filePath, "utf-8");
  const encoded = Buffer.from(content).toString("base64");
  writeFileSync(outputPath, encoded);
  console.log("✅ Base64 written to encoded.txt");
} catch (error) {
  console.error("❌ Error:", error.message);
}
