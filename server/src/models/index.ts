import { User } from './User';
import { Profile } from './Profile';
import { Photo } from './Photo';
import { Prompt } from './Prompt';
import { Test } from './Test';
import { TestItem } from './TestItem';
import { Rating } from './Rating';
import { CreditTransaction } from './CreditTransaction';
import { Credits } from './Credits';

// Define all associations here to avoid circular import issues
Profile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(Profile, { foreignKey: 'user_id' });

Profile.hasMany(Photo, { foreignKey: 'profile_id', as: 'photos' });
Photo.belongsTo(Profile, { foreignKey: 'profile_id', as: 'profile' });

Profile.hasMany(Prompt, { foreignKey: 'profile_id', as: 'prompts' });
Prompt.belongsTo(Profile, { foreignKey: 'profile_id', as: 'profile' });

// Export all models as before
export { User, IUser } from './User';
export { Profile, IProfile } from './Profile';
export { Photo, IPhoto } from './Photo';
export { Prompt, IPrompt } from './Prompt';
export { Test, ITest } from './Test';
export { TestItem, ITestItem } from './TestItem';
export { Rating, IRating } from './Rating';
export { CreditTransaction, ICreditTransaction } from './CreditTransaction';
export { Credits, ICredits } from './Credits'; 