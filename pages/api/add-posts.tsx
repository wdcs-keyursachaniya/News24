import sanityClient from '@sanity/client';
import Joi from 'joi';
import { createClient } from 'next-sanity';
import papaparse from 'papaparse';

import { sanityConfig } from '../../lib/config';
import { mapDataToDefinedSchema } from '../../services/add-posts';
import { sendAddPostaReportMail } from '../../services/email.service';
import { ErrorDetails,ReqBody} from '../../types';


const createSanityClient = (dataset: string) => {
  return sanityClient({
    dataset: dataset || process.env.NEXT_PUBLIC_SANITY_DATASET,
    token: process.env.SANITY_API_WRITE_TOKEN,
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    useCdn: true,
    // useCdn == true gives fast, cheap responses using a globally distributed cache.
    // When in production the Sanity API is only queried on build-time, and on-demand when responding to webhooks.
    // Thus the data need to be fresh and API response time is less important.
    // When in development/working locally, it's more important to keep costs down as hot reloading can incurr a lot of API calls
    // And every page load calls getStaticProps.
    // To get the lowest latency, lowest cost, and latest data, use the Instant Preview mode
    apiVersion: '2022-03-13',
    // see https://www.sanity.io/docs/api-versioning for how versioning works
  })
}

// import '../../services/webcrypto-polyfill';

// Validation schema
const userSchema = Joi.object({
  'Body (Markdown)': Joi.string().allow(null, ''),
  'Body (Plaintext)': Joi.string().allow(null, ''),
  'CTA': Joi.string().allow(null, ''),
  'Edited?': Joi.boolean().allow(null, ''),
  'Format': Joi.string().allow(null, ''),
  'Headings': Joi.string().allow(null, ''),
  'Image - Colour Scheme': Joi.string().allow(null, ''),
  'Image - Number': Joi.number().optional(),
  'Keyword': Joi.string().allow(null, ''),
  'Length - Target': Joi.number().optional(),
  'List Items': Joi.string().allow(null, ''),
  'Mode': Joi.string().allow(null, ''),
  'Project': Joi.string().allow(null, ''),
  'Prompts': Joi.string().allow(null, ''),
  'Regenerated': Joi.boolean().optional(),
  'Social - Facebook/IG': Joi.string().allow(null, ''),
  'Social - LinkedIn': Joi.string().allow(null, ''),
  'Table of Contents': Joi.string().allow(null, ''),
  'Tone of Voice': Joi.string().allow(null, ''),
  'Social - Twitter': Joi.string().allow(null, ''),
  'Undetectable': Joi.boolean().optional(),
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

  for (const item of data) {
    const { 'URL Slug': slug } = item;
    try {
      // Validating CSV data
      const { error } = userSchema.validate(item);

      // If any error then saving that error for that slug and moving to the next iteration
      if (error?.details[0]?.message) {
        console.log("🚀 ~ handlePostCreation ~ error?.details[0]?.message:", error?.details[0]?.message)
        errorDetailsObj.push({ slug, errorDescription: `Validation Error - ${error.details[0].message}` });
        continue;
      }

      // Mapping CSV data according to the predefined post schema
      const postDetailsObj = await mapDataToDefinedSchema(item, dataset, { authorDetails, languageDetails, categoryDetails, imageDetails });
      console.log("🚀 ~ handlePostCreation ~ postDetailsObj:")

      // Creating post in sanity
      const res = await createSanityClient(dataset).create(postDetailsObj);
      console.log("🚀 ~ handlePostCreation ~ res:", res)
    } catch (error: any) {
      console.log("🚀 ~ handlePostCreation ~ error:", error)
      errorDetailsObj.push({ slug, errorDescription: `${error.message || error || 'Something went wrong while adding post'}` });
      continue;
    }
  }

  let csvString = '';
  console.log("🚀 ~ handlePostCreation ~ errorDetailsObj:", errorDetailsObj)

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