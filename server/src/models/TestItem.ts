import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../utils/db';
import { Test } from './Test';

export interface ITestItem {
  id: number;
  test_id: number;
  item_type: 'photo' | 'prompt';
  item_id: number;
  original_item_id: number;
  created_at: Date;
}

// These are the fields that can be passed to create
export type TestItemCreationAttributes = Optional<ITestItem, 'id' | 'created_at'>;

class TestItem extends Model<ITestItem, TestItemCreationAttributes> implements ITestItem {
  public id!: number;
  public test_id!: number;
  public item_type!: 'photo' | 'prompt';
  public item_id!: number;
  public original_item_id!: number;
  public created_at!: Date;
}

TestItem.init(
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
    item_type: {
      type: DataTypes.ENUM('photo', 'prompt'),
      allowNull: false,
    },
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    original_item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'TestItem',
    tableName: 'test_items',
    timestamps: false,
    underscored: true,
  }
);

// Define associations
TestItem.belongsTo(Test, { foreignKey: 'test_id' });
Test.hasMany(TestItem, { foreignKey: 'test_id' });

export { TestItem }; 