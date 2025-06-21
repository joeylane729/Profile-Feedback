import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../utils/db';
import { User } from './User';

export interface ICredits {
  id: number;
  user_id: number;
  balance: number;
  created_at: Date;
  updated_at: Date;
}

// These are the fields that can be passed to create
export type CreditsCreationAttributes = Optional<ICredits, 'id' | 'created_at' | 'updated_at'>;

class Credits extends Model<ICredits, CreditsCreationAttributes> implements ICredits {
  public id!: number;
  public user_id!: number;
  public balance!: number;
  public created_at!: Date;
  public updated_at!: Date;
}

Credits.init(
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
    balance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    modelName: 'Credits',
    tableName: 'credits',
    timestamps: true,
    underscored: true,
  }
);

// Define associations
Credits.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(Credits, { foreignKey: 'user_id' });

export { Credits }; 