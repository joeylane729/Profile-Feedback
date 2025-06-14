import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../utils/db';
import { Profile } from './Profile';

export interface IPrompt {
  id: number;
  profile_id: number;
  question: string;
  answer: string;
  created_at: Date;
  updated_at: Date;
}

// These are the fields that can be passed to create
export type PromptCreationAttributes = Optional<IPrompt, 'id' | 'created_at' | 'updated_at'>;

class Prompt extends Model<IPrompt, PromptCreationAttributes> implements IPrompt {
  public id!: number;
  public profile_id!: number;
  public question!: string;
  public answer!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

Prompt.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    profile_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'profiles',
        key: 'id',
      },
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    modelName: 'Prompt',
    tableName: 'prompts',
    timestamps: true,
    underscored: true,
  }
);

// Define associations
Prompt.belongsTo(Profile, { foreignKey: 'profile_id' });
Profile.hasMany(Prompt, { foreignKey: 'profile_id' });

export { Prompt }; 