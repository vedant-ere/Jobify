import { request } from "undici";
import dotenv from "dotenv"
dotenv.config();


export const searchJobsTheirStack = async (filters) => {
 const { statusCode, body } = await request('https://api.theirstack.com/v1/jobs/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.THEIRSTACK_API_KEY}`
  },
  body: JSON.stringify(filters)
})

if(statusCode !== 200){
    throw new Error(`TheirStack API failed with status ${statusCode}`) 
}

const responseText = await body.json();
return responseText
};
