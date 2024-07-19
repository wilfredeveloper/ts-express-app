import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export type UserRole = 'House-hunter' | 'Landlord/Caretaker' | 'Agent' | 'Super Admin';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    comparePassword(password: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['House-hunter', 'Landlord/Caretaker', 'Agent', 'Super Admin'], default: 'House-hunter' }
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.comparePassword = function(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
