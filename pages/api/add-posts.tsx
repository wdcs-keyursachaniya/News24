import Joi from 'joi';
import papaparse from 'papaparse';
import { createClient } from 'next-sanity';
import { SanityClient } from '@sanity/client';
import { sanityConfig } from '../../lib/config';
import { mapDataToDefinedSchema } from '../../services/add-posts';
import { sendAddPostaReportMail } from '../../services/email.service';
import { ReqBody, ErrorDetails} from '../../types';

// Validation schema
const userSchema = Joi.object({
  Body: Joi.string().trim().required(),
  Meta: Joi.string().trim().required(),
  Title: Joi.string().trim().required(),
  Author: Joi.string().trim().required(),
  Language: Joi.string().trim().required(),
  Category: Joi.string().trim().required(),
  'URL Slug': Joi.string().trim().max(96).required(),
  'Image - Assets': Joi.string().trim().required(),
});

/**
 * Function to handle post creation
 * @param {Object} reqBody Array of object containing parsed CSV data
 */
const handlePostCreation = async (reqBody: ReqBody) => {
  const authorDetails: Record<string, string> = {};
  const languageDetails: Record<string, string> = {};
  const categoryDetails: Record<string, string> = {};
  const imageDetails: Record<string, string> = {};
  const errorDetailsObj: ErrorDetails[] = [];

  const { data, dataset } = reqBody;

  // Creating sanity client according to the dataset used for CSV upload
  const sanityClient = createClient({
    ...sanityConfig,
    dataset: dataset || process.env.NEXT_PUBLIC_SANITY_DATASET,
    token: process.env.SANITY_API_WRITE_TOKEN,
  });

  for (const item of data) {
    const { 'URL Slug': slug } = item;
    try {
      // Validating CSV data
      const { error } = userSchema.validate(item);

      // If any error then saving that error for that slug and moving to the next iteration
      if (error?.details[0]?.message) {
        errorDetailsObj.push({ slug, errorDescription: `Validation Error - ${error.details[0].message}` });
        continue;
      }

      // Mapping CSV data according to the predefined post schema
      const postDetailsObj = await mapDataToDefinedSchema(item, sanityClient, { authorDetails, languageDetails, categoryDetails, imageDetails });

      // Creating post in sanity
      await sanityClient.create(postDetailsObj);
    } catch (error: any) {
      errorDetailsObj.push({ slug, errorDescription: `${error.message || error || 'Something went wrong while adding post'}` });
      continue;
    }
  }

  let csvString = '';

  // If any error found then sending the error report attachment via email
  if (errorDetailsObj.length) {
    csvString = Buffer.from(papaparse.unparse(errorDetailsObj)).toString('base64');
  }

  // Sending the report via email
  sendAddPostaReportMail(csvString);

  // Completion time log
  console.log(`(Log) Completed - Add posts via CSV upload - ${new Date()}`);
};

export default function handler(req: any, res: any) {
  return new Promise(async (resolve, reject) => {
    const data = req.body;
    try {
      // Starting time log
      console.log(`(Log) Started - Add posts via CSV upload - ${new Date()}`);
      await handlePostCreation(data as ReqBody);
      res.status(200).json({ message: 'Success' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  });
}