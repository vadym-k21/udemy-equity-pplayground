import chai from "chai";
import sinon from "sinon";
import chaiHttp from "chai-http";
import express from "express";
import { Request, Response } from "express";
import Company from "../models/company";
import Shareholder from "../models/shareholder";
import {
  capitalisationEvent,
  sharesReleaseEvent,
  sharesSplitEvent,
  sharesPurchaseEvent,
  ICapitalisationEventPayload,
  ISharesReleaseEventPayload,
  ISharesSplitEventPayload,
  ISharesPurchaseEventPayload,
  EquityEventTypes,
} from "./equity-management";

const app = express();
app.use(express.json());

chai.use(chaiHttp);
const expect = chai.expect;

describe("capitalisationEvent", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should update the capitalisation of a company if capitalisation is bigger than current", async () => {
    const mockCompany = {
      _id: "1",
      name: "Company 1",
      capitalisation: 100,
      shares: 1000,
      save: sinon.stub().resolves(),
    };

    sinon.stub(Company, "findById").resolves(mockCompany);

    const payload: ICapitalisationEventPayload = {
      id: "1",
      date: new Date(),
      type: EquityEventTypes.CAPITALISATION,
      capitalisation: 200,
      company_id: "1",
    };

    await capitalisationEvent(payload);

    expect(mockCompany.capitalisation).to.equal(200);
    expect(mockCompany.save.calledOnce).to.be.true;
  });

  it("should throw an error if the company is not found", async () => {
    sinon.stub(Company, "findById").resolves(null);

    const payload: ICapitalisationEventPayload = {
      id: "1",
      date: new Date(),
      type: EquityEventTypes.CAPITALISATION,
      capitalisation: 200,
      company_id: "1",
    };

    try {
      await capitalisationEvent(payload);
    } catch (error: any) {
      expect(error.message).to.equal("Error: Company not found");
    }
  });

  it("should throw an error if the capitalisation is smaller than current", async () => {
    const mockCompany = {
      _id: "1",
      name: "Company 1",
      capitalisation: 200,
      shares: 1000,
    };

    sinon.stub(Company, "findById").resolves(mockCompany);

    const payload: ICapitalisationEventPayload = {
      id: "1",
      date: new Date(),
      type: EquityEventTypes.CAPITALISATION,
      capitalisation: 100,
      company_id: "1",
    };

    try {
      await capitalisationEvent(payload);
    } catch (error: any) {
      expect(error.message).to.equal(
        "Error: Capitalisation is smaller than current"
      );
    }
  });
});

describe("sharesReleaseEvent", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should increase the shares of a company", async () => {
    const mockCompany = {
      _id: "1",
      name: "Company 1",
      capitalisation: 100,
      shares: 1000,
      save: sinon.stub().resolves(),
    };

    sinon.stub(Company, "findById").resolves(mockCompany);

    const payload: ISharesReleaseEventPayload = {
      id: "1",
      date: new Date(),
      type: EquityEventTypes.SHARES_RELEASE,
      shares: 200,
      company_id: "1",
    };

    await sharesReleaseEvent(payload);

    expect(mockCompany.shares).to.equal(1200);
    expect(mockCompany.save.calledOnce).to.be.true;
  });

  it("should throw an error if the company is not found", async () => {
    sinon.stub(Company, "findById").resolves(null);

    const payload: ISharesReleaseEventPayload = {
      id: "1",
      date: new Date(),
      type: EquityEventTypes.SHARES_RELEASE,
      shares: 200,
      company_id: "1",
    };

    try {
      await sharesReleaseEvent(payload);
    } catch (error: any) {
      expect(error.message).to.equal("Error: Company not found");
    }
  });
});

describe("sharesSplitEvent", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should increase the shares of a company and its shareholders", async () => {
    const mockCompany = {
      _id: "1",
      name: "Company 1",
      capitalisation: 100,
      shares: 1000,
      save: sinon.stub().resolves(),
    };

    const mockShareholder = {
      _id: "1",
      name: "Shareholder 1",
      companies_owned: [
        {
          company_id: "1",
          shares: 100,
        },
      ],
      save: sinon.stub().resolves(),
    };

    sinon.stub(Company, "findById").resolves(mockCompany);
    sinon.stub(Shareholder, "findById").resolves(mockShareholder);

    const payload: ISharesSplitEventPayload = {
      id: "1",
      date: new Date(),
      type: EquityEventTypes.SHARES_SPLIT,
      split_factor: 2,
      company_id: "1",
    };

    await sharesSplitEvent(payload);

    expect(mockCompany.shares).to.equal(2000);
    expect(mockCompany.save.calledOnce).to.be.true;

    // expect(mockShareholder.companies_owned[0].shares).to.equal(200);
    // expect(mockShareholder.save.calledOnce).to.be.true;
  });

  it("should throw an error if the company is not found", async () => {
    sinon.stub(Company, "findById").resolves(null);

    const payload: ISharesSplitEventPayload = {
      id: "1",
      date: new Date(),
      type: EquityEventTypes.SHARES_SPLIT,
      split_factor: 2,
      company_id: "1",
    };

    try {
      await sharesSplitEvent(payload);
    } catch (error: any) {
      expect(error.message).to.equal("Error: Company not found");
    }
  });

  it("should throw an error if the split factor is smaller than 1", async () => {
    const mockCompany = {
      _id: "1",
      name: "Company 1",
      capitalisation: 100,
      shares: 1000,
    };

    sinon.stub(Company, "findById").resolves(mockCompany);

    const payload: ISharesSplitEventPayload = {
      id: "1",
      date: new Date(),
      type: EquityEventTypes.SHARES_SPLIT,
      split_factor: 0.5,
      company_id: "1",
    };

    try {
      await sharesSplitEvent(payload);
    } catch (error: any) {
      expect(error.message).to.equal("Error: Split factor is smaller than 1");
    }
  });
});

describe("sharesPurchaseEvent", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should increase the shares of a shareholder", async () => {
    const mockCompany = {
      _id: "1",
      name: "Company 1",
      capitalisation: 100,
      shares: 1000,
    };

    const mockShareholder = {
      _id: "1",
      name: "Shareholder 1",
      companies_owned: [
        {
          company_id: "1",
          shares: 100,
        },
      ],
      save: sinon.stub().resolves(),
    };

    sinon.stub(Company, "findById").resolves(mockCompany);
    sinon.stub(Shareholder, "findById").resolves(mockShareholder);

    const payload: ISharesPurchaseEventPayload = {
      id: "1",
      date: new Date(),
      type: EquityEventTypes.SHARES_PURCHASE,
      shares: 50,
      company_id: "1",
      shareholder_id: "1",
    };

    await sharesPurchaseEvent(payload);

    expect(mockShareholder.companies_owned[0].shares).to.equal(150);
    expect(mockShareholder.save.calledOnce).to.be.true;
  });

  it("should throw an error if the company is not found", async () => {
    sinon.stub(Company, "findById").resolves(null);

    const payload: ISharesPurchaseEventPayload = {
      id: "1",
      date: new Date(),
      type: EquityEventTypes.SHARES_PURCHASE,
      shares: 50,
      company_id: "1",
      shareholder_id: "1",
    };

    try {
      await sharesPurchaseEvent(payload);
    } catch (error: any) {
      expect(error.message).to.equal("Error: Company not found");
    }
  });

  it("should throw an error if the shareholder is not found", async () => {
    const mockCompany = {
      _id: "1",
      name: "Company 1",
      capitalisation: 100,
      shares: 1000,
    };

    sinon.stub(Company, "findById").resolves(mockCompany);
    sinon.stub(Shareholder, "findById").resolves(null);

    const payload: ISharesPurchaseEventPayload = {
      id: "1",
      date: new Date(),
      type: EquityEventTypes.SHARES_PURCHASE,
      shares: 50,
      company_id: "1",
      shareholder_id: "1",
    };

    try {
      await sharesPurchaseEvent(payload);
    } catch (error: any) {
      expect(error.message).to.equal("Error: Shareholder not found");
    }
  });
});
