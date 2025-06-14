import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../utils/db';
import { User } from './User';

export interface ICreditTransaction {
  id: number;
  user_id: number;
  amount: number;
  type: 'purchase' | 'test' | 'refund';
  description: string;
  reference_id?: number;
  created_at: Date;
}

// These are the fields that can be passed to create
export type CreditTransactionCreationAttributes = Optional<ICreditTransaction, 'id' | 'created_at'>;

class CreditTransaction extends Model<ICreditTransaction, CreditTransactionCreationAttributes> implements ICreditTransaction {
  public id!: number;
  public user_id!: number;
  public amount!: number;
  public type!: 'purchase' | 'test' | 'refund';
  public description!: string;
  public reference_id?: number;
  public created_at!: Date;
}

CreditTransaction.init(
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
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('purchase', 'test', 'refund'),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reference_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'CreditTransaction',
    tableName: 'credit_transactions',
    timestamps: false,
    underscored: true,
  }
);

// Define associations
CreditTransaction.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(CreditTransaction, { foreignKey: 'user_id' });

export { CreditTransaction }; 