import mongoose, { Schema, Document } from 'mongoose';
import type { User } from '../types/user.ts';

// User interface extending Mongoose Document
export interface IUser extends Document, Omit<User, 'id'> {
  _id: mongoose.Types.ObjectId;
}

// User schema definition
const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  name: {
    type: String,
    required: false,
    trim: true,
    minlength: 2,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: {
    transform: function(doc, ret: Record<string, unknown>) {
      ret.id = (ret._id as mongoose.Types.ObjectId).toString();
      delete ret._id;
      delete ret.__v;
      delete ret.password; // Never include password in JSON output
      return ret;
    },
  },
});

// Index for better query performance
userSchema.index({ createdAt: -1 });

// Create and export the model
export const UserModel = mongoose.model<IUser>('User', userSchema);

// User service class for database operations
class UserService {
  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user = new UserModel(userData);
    const savedUser = await user.save();
    
    return {
      id: savedUser._id.toString(),
      email: savedUser.email,
      password: savedUser.password,
      name: savedUser.name,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email: email.toLowerCase() }).lean();
    if (!user) return null;

    return {
      id: user._id.toString(),
      email: user.email,
      password: user.password,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findById(id: string): Promise<User | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    
    const user = await UserModel.findById(id).lean();
    if (!user) return null;

    return {
      id: user._id.toString(),
      email: user.email,
      password: user.password,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async update(id: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    
    const user = await UserModel.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).lean();
    
    if (!user) return null;

    return {
      id: user._id.toString(),
      email: user.email,
      password: user.password,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async delete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }

  async getAll(): Promise<User[]> {
    const users = await UserModel.find({}).lean();
    
    return users.map(user => ({
      id: user._id.toString(),
      email: user.email,
      password: user.password,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }

  async findByIdForAuth(id: string): Promise<User | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    
    const user = await UserModel.findById(id).lean();
    if (!user) return null;

    return {
      id: user._id.toString(),
      email: user.email,
      password: user.password,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

// Export singleton instance
export const userModel = new UserService();
