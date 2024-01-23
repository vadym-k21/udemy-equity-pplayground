import mongoose from "mongoose";

export interface IShareholder extends Document {
  name: string;
  email: string;
  companies_owned: CompanyOwnership[];
}

export interface CompanyOwnership {
  company_id: string;
  shares: number;
}

// create a model and schema based on defined interfaces of Shareholder
const shareholderSchema = new mongoose.Schema<IShareholder>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  companies_owned: [
    {
      company_id: { type: String, required: true },
      shares: { type: Number, required: true },
    },
  ],
});

const Shareholder = mongoose.model<IShareholder>(
  "Shareholder",
  shareholderSchema
);

export default Shareholder;
