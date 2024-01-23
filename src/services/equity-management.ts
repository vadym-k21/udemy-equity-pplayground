import Company from "../models/company";
import Shareholder from "../models/shareholder";

/**
 * Updates the capitalisation of a company based on the provided payload.
 * Throws an error if the company is not found or if the provided capitalisation is smaller than the current capitalisation.
 *
 * @param {ICapitalisationEventPayload} payload - The payload containing the capitalisation and company ID.
 * @returns {Promise<void>} - A promise that resolves when the capitalisation is updated successfully.
 */
export const capitalisationEvent = async ({
  capitalisation,
  company_id,
}: ICapitalisationEventPayload) => {
  // find a company by id uysing company_id prop
  // check if company exists
  // if not, throw an error
  // if capitalisation is bigger than company.capitalisation save it otherwise error
  try {
    const company = await Company.findById(company_id);
    if (!company) {
      throw new Error("Company not found");
    }
    if (capitalisation > company.capitalisation) {
      company.capitalisation = capitalisation;
      await company.save();
    } else {
      throw new Error("Capitalisation is smaller than current");
    }
  } catch (error) {
    console.error(error);
  }
};

export const sharesReleaseEvent = async ({
  company_id,
  shares,
}: ISharesReleaseEventPayload) => {
  // find a company by id uysing company_id prop
  // check if company exists
  // if not, throw an error
  // if shares is bigger than company.shares save it otherwise error
  try {
    const company = await Company.findById(company_id);
    if (!company) {
      throw new Error("Company not found");
    }
    company.shares += shares;
    await company.save();
  } catch (error) {
    console.error(error);
  }
};

export const sharesSplitEvent = async (payload: ISharesSplitEventPayload) => {
  // find a company by id uysing company_id prop
  // check if company exists
  // if not, throw an error
  // if split_factor is bigger than 1 save it otherwise error
  try {
    const company = await Company.findById(payload.company_id);
    if (!company) {
      throw new Error("Company not found");
    }
    if (payload.split_factor > 1) {
      company.shares *= payload.split_factor;
      await company.save();

      await Company.populate(company, {
        path: "shareholders",
        model: Shareholder,
      });
      company.shareholders.forEach(async (shareholder) => {
        if (shareholder instanceof Shareholder) {
          shareholder.companies_owned.forEach((company_owned) => {
            if (String(company_owned.company_id) === String(company._id)) {
              company_owned.shares *= payload.split_factor;
            }
          });
          await shareholder.save();
        }
      });
    } else {
      throw new Error("Split factor is smaller than 1");
    }
  } catch (error) {
    console.error(error);
  }
};

export const sharesPurchaseEvent = async (
  payload: ISharesPurchaseEventPayload
) => {
  // find a company by id uysing company_id prop
  // check if company exists
  // if not, throw an error
  // find a shareholder by id uysing shareholder_id prop
  // check if shareholder exists
  // if not, throw an error
  // if shares is bigger than company.shares save it otherwise error
  // if shares is bigger than shareholder.shares save it otherwise error
  try {
    const company = await Company.findById(payload.company_id);
    if (!company) {
      throw new Error("Company not found");
    }
    const shareholder = await Shareholder.findById(payload.shareholder_id);
    if (!shareholder) {
      throw new Error("Shareholder not found");
    }

    shareholder.companies_owned.forEach((company_owned) => {
      if (String(company_owned.company_id) === String(company._id)) {
        company_owned.shares += payload.shares;
      }
    });

    await shareholder.save();
  } catch (error) {
    console.error(error);
  }
};

export interface IEventPayload {
  id: string;
  date: Date;
}
export enum EquityEventTypes {
  CAPITALISATION = "capitalisation",
  SHARES_RELEASE = "sharesRelease",
  SHARES_SPLIT = "sharesSplit",
  SHARES_PURCHASE = "sharesPurchase",
}

export interface ICapitalisationEventPayload extends IEventPayload {
  type: EquityEventTypes.CAPITALISATION;
  capitalisation: number;
  company_id: string;
}

export interface ISharesReleaseEventPayload extends IEventPayload {
  type: EquityEventTypes.SHARES_RELEASE;
  shares: number;
  company_id: string;
}

export interface ISharesSplitEventPayload extends IEventPayload {
  type: EquityEventTypes.SHARES_SPLIT;
  split_factor: number;
  company_id: string;
}

export interface ISharesPurchaseEventPayload extends IEventPayload {
  type: EquityEventTypes.SHARES_PURCHASE;
  shares: number;
  company_id: string;
  shareholder_id: string;
}

export type EquityEventsPayload =
  | ICapitalisationEventPayload
  | ISharesReleaseEventPayload
  | ISharesSplitEventPayload
  | ISharesPurchaseEventPayload;
