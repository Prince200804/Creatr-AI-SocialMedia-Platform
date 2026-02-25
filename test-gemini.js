const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModels() {
  const modelNames = [
    "gemini-pro",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest",
    "models/gemini-pro",
    "models/gemini-1.5-pro",
    "models/gemini-1.5-flash"
  ];

  console.log("Testing model names...\n");

  for (const modelName of modelNames) {
    try {
      console.log(`Testing: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello");
      console.log(`✓ ${modelName} WORKS!\n`);
      break; // Stop at first working model
    } catch (error) {
      console.log(`✗ ${modelName} - ${error.message}\n`);
    }
  }
}

testModels();
