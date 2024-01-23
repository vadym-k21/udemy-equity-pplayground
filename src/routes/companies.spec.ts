import chai from "chai";
import sinon from "sinon";
import chaiHttp from "chai-http";
import express from "express";
import { Request, Response } from "express";
import Company from "../models/company";
import router from "./companies";

const app = express();
app.use(express.json());
app.use("/api/companies", router);

chai.use(chaiHttp);
const expect = chai.expect;

describe("GET /api/companies", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should return all companies", async () => {
    const mockCompanies = [
      { name: "Company 1", capitalisation: 100, shares: 1000 },
      { name: "Company 2", capitalisation: 200, shares: 2000 },
    ];

    sinon.stub(Company, "find").resolves(mockCompanies);

    const response = await chai.request(app).get("/api/companies");

    expect(response).to.have.status(200);
    expect(response.body).to.deep.equal(mockCompanies);
  });

  it("should return an error if failed to retrieve companies", async () => {
    sinon.stub(Company, "find").rejects(new Error("Database error"));

    const response = await chai.request(app).get("/api/companies");

    expect(response).to.have.status(500);
    expect(response.body).to.deep.equal({
      message: "Failed to retrieve companies",
    });
  });
});

describe("GET /api/companies/:id", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should return a company by ID", async () => {
    const mockCompany = {
      name: "Company 1",
      capitalisation: 100,
      shares: 1000,
    };

    sinon.stub(Company, "findById").resolves(mockCompany);

    const response = await chai.request(app).get("/api/companies/1");

    expect(response).to.have.status(200);
    expect(response.body).to.deep.equal(mockCompany);
  });

  it("should return an error if company not found", async () => {
    sinon.stub(Company, "findById").resolves(null);

    const response = await chai.request(app).get("/api/companies/1");

    expect(response).to.have.status(404);
    expect(response.body).to.deep.equal({ message: "Company not found" });
  });

  it("should return an error if failed to retrieve company", async () => {
    sinon.stub(Company, "findById").rejects(new Error("Database error"));

    const response = await chai.request(app).get("/api/companies/1");

    expect(response).to.have.status(500);
    expect(response.body).to.deep.equal({
      message: "Failed to retrieve company",
    });
  });
});

// ... write tests for other routes (POST, PUT, DELETE) in a similar manner
