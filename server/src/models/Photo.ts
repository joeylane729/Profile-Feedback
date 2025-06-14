import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../utils/db';
import { Profile } from './Profile';

export interface IPhoto {
  id: number;
  profile_id: number;
  url: string;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

// These are the fields that can be passed to create
export type PhotoCreationAttributes = Optional<IPhoto, 'id' | 'created_at' | 'updated_at'>;

class Photo extends Model<IPhoto, PhotoCreationAttributes> implements IPhoto {
  public id!: number;
  public profile_id!: number;
  public url!: string;
  public order_index!: number;
  public created_at!: Date;
  public updated_at!: Date;
}

Photo.init(
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
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    order_index: {
      type: DataTypes.INTEGER,
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
    modelName: 'Photo',
    tableName: 'photos',
    timestamps: true,
    underscored: true,
  }
);

// Define associations
Photo.belongsTo(Profile, { foreignKey: 'profile_id' });
Profile.hasMany(Photo, { foreignKey: 'profile_id' });

export { Photo }; 