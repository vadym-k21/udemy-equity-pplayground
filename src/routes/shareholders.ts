import { Router, Request, Response } from "express";
import Shareholder from "../models/shareholder";
import Company from "../models/company";
import { ObjectId } from "mongoose";
import { randomUUID } from "crypto";

const router = Router();

const BASE_URL_SHAREHOLDERS = "/";

router.get(`${BASE_URL_SHAREHOLDERS}`, async (req: Request, res: Response) => {
  try {
    const shareholders = await Shareholder.find();

    res.send(shareholders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Shareholders get all internal server error" });
  }
});
// GET shareholder by _id
router.get(
  `${BASE_URL_SHAREHOLDERS}:id`,
  async (req: Request, res: Response) => {
    try {
      const shareholder = await Shareholder.findById(req.params.id);
      res.json(shareholder);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Shareholders get by id internal server error" });
    }
  }
);

router.put(
  `${BASE_URL_SHAREHOLDERS}:id`,
  async (req: Request, res: Response) => {
    try {
      const shareholder_id = req.params.id;
      const shareholder = await Shareholder.findByIdAndUpdate(shareholder_id);

      res.json(shareholder);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Shareholders put internal server error" });
    }
  }
);

router.put(
  `${BASE_URL_SHAREHOLDERS}:id/shares`,
  async (req: Request, res: Response) => {
    try {
      const shareholder_id = req.params.id;
      const company_id = req.body.company_id;
      const shares = req.body.shares;

      const shareholder = await Shareholder.findById(shareholder_id);

      if (shareholder) {
        // await sharesUpdateEvent({
        //   type: EquityEventTypes.SHARES_UPDATE,
        //   id: randomUUID(),
        //   date: new Date(),
        //   shares,
        //   company_id,
        //   shareholder_id,
        // });

        res.json("OK");
      } else {
        res.status(404).json({ message: "Shareholder not found" });
      }
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  }
);

router.post(`${BASE_URL_SHAREHOLDERS}`, async (req: Request, res: Response) => {
  try {
    const shareholder = await Shareholder.create(req.body);
    res.json(shareholder);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Shareholders create internal server error" });
  }
});

router.delete(
  `${BASE_URL_SHAREHOLDERS}:id`,
  async (req: Request, res: Response) => {
    try {
      const shareholder = await Shareholder.findById(req.params.id);
      shareholder?.companies_owned.forEach(async (company_owned) => {
        const company = await Company.findById(company_owned.company_id);
        if (company) {
          (company.shareholders as any) = company.shareholders.filter(
            (id) => id === shareholder?._id
          );
        }
      });

      await Company.bulkSave(shareholder?.companies_owned as any);

      shareholder?.deleteOne();

      res.send({
        message: "Shareholder deleted successfully",
        id: req.params.id,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Shareholders delete internal server error" });
    }
  }
);

export default router;
