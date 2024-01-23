import express from "express";
import { Request, Response } from "express";
import Company from "../models/company";
import {
  EquityEventTypes,
  capitalisationEvent,
  sharesReleaseEvent,
  sharesSplitEvent,
} from "../services/equity-management";
import { randomUUID } from "crypto";

const router = express.Router();
const BASE_URL = "/";

// GET /api/companies
router.get(BASE_URL, async (req: Request, res: Response) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve companies" });
  }
});

// GET /api/companies/:id
router.get(`${BASE_URL}:id`, async (req, res) => {
  try {
    const companyId = req.params.id;
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve company" });
  }
});

// POST /api/companies
router.post(BASE_URL, async (req, res) => {
  try {
    const { name, capitalisation = 0, shares = 0 } = req.body;
    const company = new Company({ name, capitalisation, shares });
    const savedCompany = await company.save();
    res.status(201).json(savedCompany);
  } catch (error) {
    res.status(500).json({ message: "Failed to create company" });
  }
});

// PUT /api/companies/:id
router.put(`${BASE_URL}:id`, async (req, res) => {
  try {
    const companyId = req.params.id;
    const { name, capitalisation, shares, split_factor } = req.body;

    const updatedCompany = await Company.findById(companyId);

    if (!updatedCompany) {
      return res.status(404).json({ message: "Company not found" });
    } else {
      if (shares > updatedCompany.shares) {
        await sharesReleaseEvent({
          type: EquityEventTypes.SHARES_RELEASE,
          id: randomUUID(),
          date: new Date(),
          company_id: companyId,
          shares,
        });
      }

      if (capitalisation > updatedCompany.capitalisation) {
        await capitalisationEvent({
          type: EquityEventTypes.CAPITALISATION,
          id: randomUUID(),
          date: new Date(),
          company_id: companyId,
          capitalisation,
        });
      }

      if (split_factor > 1) {
        await sharesSplitEvent({
          type: EquityEventTypes.SHARES_SPLIT,
          id: randomUUID(),
          date: new Date(),
          company_id: companyId,
          split_factor,
        });
      }
    }

    res.status(201).json({ message: "Company updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update company" });
  }
});

// DELETE /api/companies/:id
router.delete(`${BASE_URL}:id`, async (req, res) => {
  try {
    const companyId = req.params.id;
    const deletedCompany = await Company.findByIdAndDelete(companyId);

    if (!deletedCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete company" });
  }
});

export default router;
