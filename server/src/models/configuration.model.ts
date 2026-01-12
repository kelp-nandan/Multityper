import { Column, CreatedAt, DataType, Model, Table, UpdatedAt } from "sequelize-typescript";

@Table({
  tableName: "configurations",
  timestamps: true,
  underscored: true,
})
export class Configuration extends Model<Configuration> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
  })
  declare key: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare value: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare description: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: "created_at",
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: "updated_at",
  })
  declare updatedAt: Date;
}
