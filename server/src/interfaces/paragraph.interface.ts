export interface IParagraph {
  paragraph_id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateParagraph {
  content: string;
}
