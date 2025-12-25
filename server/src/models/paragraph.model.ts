import { DataTypes, Model, Sequelize } from "sequelize";
import { ICreateParagraph, IParagraph } from "../interfaces";

export class Paragraph extends Model<IParagraph, ICreateParagraph> implements IParagraph {
  declare paragraph_id: number;
  declare content: string;
  declare createdAt: Date;
  declare updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof Paragraph {
    Paragraph.init(
      {
        paragraph_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: "createdAt",
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: "updatedAt",
        },
      },
      {
        sequelize,
        tableName: "paragraphs",
        timestamps: true,
      },
    );

    return Paragraph;
  }
}
