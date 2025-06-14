import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../utils/db';
import { User } from './User';

export interface IProfile {
  id: number;
  user_id: number;
  bio?: string;
  status: 'not_tested' | 'testing' | 'complete';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// These are the fields that can be passed to create
export type ProfileCreationAttributes = Optional<IProfile, 'id' | 'created_at' | 'updated_at'>;

class Profile extends Model<IProfile, ProfileCreationAttributes> implements IProfile {
  public id!: number;
  public user_id!: number;
  public bio?: string;
  public status!: 'not_tested' | 'testing' | 'complete';
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
}

Profile.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('not_tested', 'testing', 'complete'),
      allowNull: false,
      defaultValue: 'not_tested',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Profile',
    tableName: 'profiles',
    timestamps: true,
    underscored: true,
  }
);

// Define associations
Profile.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(Profile, { foreignKey: 'user_id' });

export { Profile }; 