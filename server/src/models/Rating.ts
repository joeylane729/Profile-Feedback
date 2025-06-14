import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../utils/db';
import { Test } from './Test';
import { User } from './User';

export interface IRating {
  id: number;
  test_id: number;
  rater_id: number;
  item_type: 'photo' | 'prompt' | 'bio';
  item_id: number;
  rating: number;
  feedback?: string;
  is_anonymous: boolean;
  created_at: Date;
}

// These are the fields that can be passed to create
export type RatingCreationAttributes = Optional<IRating, 'id' | 'created_at'>;

class Rating extends Model<IRating, RatingCreationAttributes> implements IRating {
  public id!: number;
  public test_id!: number;
  public rater_id!: number;
  public item_type!: 'photo' | 'prompt' | 'bio';
  public item_id!: number;
  public rating!: number;
  public feedback?: string;
  public is_anonymous!: boolean;
  public created_at!: Date;
}

Rating.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    test_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tests',
        key: 'id',
      },
    },
    rater_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    item_type: {
      type: DataTypes.ENUM('photo', 'prompt', 'bio'),
      allowNull: false,
    },
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_anonymous: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Rating',
    tableName: 'ratings',
    timestamps: false,
    underscored: true,
  }
);

// Define associations
Rating.belongsTo(Test, { foreignKey: 'test_id' });
Test.hasMany(Rating, { foreignKey: 'test_id' });

Rating.belongsTo(User, { foreignKey: 'rater_id', as: 'rater' });
User.hasMany(Rating, { foreignKey: 'rater_id' });

export { Rating }; 