import OpenAI from "openai";
import express from 'express'
import winston from "winston"
import { LoggingWinston } from '@google-cloud/logging-winston';
const loggingWinston = new LoggingWinston({
    projectId: process.env.projectId,  // Replace with your Google Cloud Project ID
});

const app = express()
const openai = new OpenAI({
    apiKey: process.env.apiKey, // Ensure you provide your API key here
});
const port = process.env.PORT || 3000; 

const logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console(), 
        loggingWinston,
    ],
});  

const generateMetaData = async (firstName, lastName, title, profession, state, education, biography, procedures) => await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
        {
            role: "system",
            content: "You are an SEO expert who helps users create meta tags for dental websites.",
        },
        {
            role: "user",
            content: `I have a dental profile for Dr. ${firstName} ${lastName}. Here is the information:          
                Profession: ${profession}
                First Name: ${firstName}
                Last Name: ${lastName}
                Procedures: ${procedures}
                Title: ${title}
                State: ${state}
                Education: ${education}
                Biography: ${biography}
  
                Please generate the following meta tags without any additional text or explanations:
                - meta title
                - meta description
                - meta keywords
                - og title
                - og description
            `,
        },
    ],
});

app.get('/dentist/meta', async (req, res) => {
    const { firstName, lastName, title, profession, state, education, biography, procedures } = req.query
    logger.info(`Generating Meta for ${firstName}, ${lastName}`)
    const content = await generateMetaData(firstName, lastName, title, profession, state, education, biography, procedures)    
    res.status(200).json({
        status: 'success',
        type: "Dentist Meta Generation",
        length: content.choices[0].message.content.length,
        requestedAt: req.requestTime,
        data: content.choices[0].message.content
    })
})

app.listen(port, () => {
    logger.info(`Initiating Barnet Dental OpenAI`)
});