import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../utils/db';
import { User } from './User';

export interface ITest {
  id: number;
  user_id: number;
  type: 'full_profile' | 'single_photo' | 'single_prompt';
  status: 'pending' | 'in_progress' | 'complete';
  cost: number;
  started_at?: Date;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// These are the fields that can be passed to create
export type TestCreationAttributes = Optional<ITest, 'id' | 'created_at' | 'updated_at'>;

class Test extends Model<ITest, TestCreationAttributes> implements ITest {
  public id!: number;
  public user_id!: number;
  public type!: 'full_profile' | 'single_photo' | 'single_prompt';
  public status!: 'pending' | 'in_progress' | 'complete';
  public cost!: number;
  public started_at?: Date;
  public completed_at?: Date;
  public created_at!: Date;
  public updated_at!: Date;
}

Test.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('full_profile', 'single_photo', 'single_prompt'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'complete'),
      allowNull: false,
      defaultValue: 'pending',
    },
    cost: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
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
    modelName: 'Test',
    tableName: 'tests',
    timestamps: true,
    underscored: true,
  }
);

// Define associations
Test.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Test, { foreignKey: 'user_id' });

export { Test }; 