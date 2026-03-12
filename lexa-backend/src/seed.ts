import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI!;
const client = new MongoClient(uri);

async function seedDatabase() {
  try {
    await client.connect();
    console.log("🟢 Connected to MongoDB");

    const db = client.db("lexa_ai");

    // ===== ALL COLLECTION NAMES (DITTO AS IMAGE) =====
    const collections = [
      "analytics_events",
      "artifacts",
      "conversation_shares",
      "conversations",
      "custom_instructions",
      "image_generations",
      "knowledge_documents",
      "learning_profiles",
      "messages",
      "productivity_scores",
      "profiles",
      "rate_limits",
      "scheduled_tasks",
      "smart_templates",
      "usage_statistics",
      "user_goals",
      "user_memories",
      "user_preferences",
      "video_generations",
      "workspace_invites",
      "workspace_members",
      "workspaces"
    ];

    // ===== CREATE EMPTY COLLECTIONS =====
    for (const name of collections) {
      const exists = await db.listCollections({ name }).hasNext();
      if (!exists) {
        await db.createCollection(name);
        console.log(`✅ Created collection: ${name}`);
      }
    }

    // ===== INSERT STARTER DATA =====

    await db.collection("profiles").insertOne({
      user_id: "user_001",
      name: "Parag",
      email: "parag@example.com",
      created_at: new Date()
    });

    await db.collection("conversations").insertOne({
      conversation_id: "conv_001",
      user_id: "user_001",
      title: "Lexa Conversation",
      created_at: new Date()
    });

    await db.collection("messages").insertMany([
      {
        conversation_id: "conv_001",
        role: "user",
        content: "Hello Lexa",
        created_at: new Date()
      },
      {
        conversation_id: "conv_001",
        role: "assistant",
        content: "Hi! I am Lexa.",
        created_at: new Date()
      }
    ]);

    await db.collection("user_memories").insertOne({
      user_id: "user_001",
      memory: "User prefers concise answers."
    });

    await db.collection("user_preferences").insertOne({
      user_id: "user_001",
      theme: "dark",
      language: "en"
    });

    await db.collection("learning_profiles").insertOne({
      user_id: "user_001",
      learning_style: "adaptive"
    });

    await db.collection("smart_templates").insertOne({
      name: "Default Lexa Prompt",
      content: "You are Lexa, a helpful AI assistant."
    });

    await db.collection("rate_limits").insertOne({
      scope: "user",
      limit: 100,
      window_seconds: 3600
    });

    console.log("🎉 DATABASE SEEDED SUCCESSFULLY");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seedDatabase();
