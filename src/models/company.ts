import mongoose from "mongoose";
import { IShareholder } from "./shareholder";

export interface Company extends Document {
  name: string;
  capitalisation: number;
  shares: number;
  shareholders: mongoose.Types.ObjectId[] | IShareholder[];
}

// The schema is a blueprint for the model
// Create a schema based on the interface
const companySchema = new mongoose.Schema<Company>({
  name: { type: String, required: true },
  capitalisation: { type: Number, required: true },
  shares: { type: Number, required: true },
  shareholders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Shareholder" }],
});

// Create a model based on the schema
const Company = mongoose.model<Company>("Company", companySchema);

export default Company;
