import mongoose, { Schema, Document } from 'mongoose';

// User Model
export interface IUser extends Document {
  supabaseId: string;
  email: string;
  tier: 'free' | 'pro' | 'enterprise';
  usageCount: number;
  usageResetAt: Date;
  preferences: {
    personality: 'professional' | 'creative' | 'academic' | 'casual' | 'technical';
    model: string;
    theme: 'light' | 'dark' | 'auto';
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    supabaseId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    tier: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    usageCount: { type: Number, default: 0 },
    usageResetAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
    preferences: {
      personality: { type: String, enum: ['professional', 'creative', 'academic', 'casual', 'technical'], default: 'professional' },
      model: { type: String, default: 'lexa-balanced' },
      theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);

// Message Model
export interface IMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens?: number;
  toolCalls?: Array<{
    toolName: string;
    toolInput: Record<string, unknown>;
    toolResult?: string;
  }>;
  timestamp: Date;
}

// Conversation Model
export interface IConversation {
  _id: any;
  userId: string;
  title: string;
  messages: IMessage[];
  totalTokens: number;
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema(
  {
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    tokens: { type: Number },
    toolCalls: [
      {
        toolName: String,
        toolInput: Schema.Types.Mixed,
        toolResult: String,
      },
    ],
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const conversationSchema = new Schema<IConversation>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    messages: [messageSchema],
    totalTokens: { type: Number, default: 0 },
    model: { type: String, default: 'lexa-balanced' },
  },
  { timestamps: true }
);

// Compound index for efficient user conversation queries
conversationSchema.index({ userId: 1, createdAt: -1 });

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);

// Memory Model (for user knowledge retention)
export interface IMemory extends Document {
  userId: string;
  content: string;
  embedding?: number[];
  category: string;
  importance: number; // 1-5
  createdAt: Date;
}

const memorySchema = new Schema<IMemory>(
  {
    userId: { type: String, required: true, index: true },
    content: { type: String, required: true },
    embedding: [Number], // Vector embedding for semantic search
    category: { type: String, default: 'general' },
    importance: { type: Number, min: 1, max: 5, default: 3 },
  },
  { timestamps: true }
);

// Index for efficient semantic search
memorySchema.index({ userId: 1, importance: -1, createdAt: -1 });

export const Memory = mongoose.model<IMemory>('Memory', memorySchema);
