import { Handler, HandlerContext, HandlerEvent } from "@netlify/functions";
import axios, {AxiosError} from "axios";
import {CheerioAPI, load} from "cheerio";

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
    const duoHtml = await fetchPage("https://duo.nl/particulier/payment-dates.jsp")

    if(!duoHtml) {
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": process.env.DEPLOY_URL
            }
        };
    }

    const currentYear = new Date().getFullYear();
    const $ = load(duoHtml);
    const currentYearData = getDates($, currentYear);

    if(!currentYearData){
        console.error(`Could not parse data for year ${currentYear}`);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": process.env.DEPLOY_URL
            }
        };
    }

    let response: Date[] = currentYearData;
    const nextYearData = getDates($, currentYear + 1);

    if(nextYearData){
        response = response.concat(nextYearData);
    }

    response = response.sort((a, b) => a.getTime() - b.getTime());

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": process.env.DEPLOY_URL
        },
        body: JSON.stringify(response)
    };
};

export { handler };


function fetchPage(url: string): Promise<string | undefined> {
    const HTMLData = axios
        .get(url)
        .then(res => res.data)
        .catch((error: AxiosError) => {
            console.error(`There was an error with ${error.config.url}.`);
            console.error(error.toJSON());
        });

    return HTMLData;
}

function getDates($: CheerioAPI, yearToFind: number): Date[] | null {
    const currentYearSelector = `#payment-dates-${yearToFind}`;
    const currentYearList = $(currentYearSelector).next('ul');

    if(!currentYearList){
        return null;
    }

    const dates: Date[] = [];
    const listItems = currentYearList.children();

    listItems.each((_, element) => {
        const listItemText = $(element).text();

        if(!listItemText){
            return true;
        }

        const dateAndMonth = listItemText.split(' ');
        const day = parseInt(dateAndMonth[0]);
        const month = getMonthNumber(dateAndMonth[1]);
        const listItemDate = new Date(yearToFind, month, day);

        if(!listItemDate){
            console.error(`Failed to parse date '${listItemText} ${yearToFind}'`);
            return false;
        }

        dates.push(listItemDate);
    });

    return dates;
}

function getMonthNumber(month: string): number {
    switch (month) {
        case 'January':
            return 0;
        case 'February':
            return 1;
        case 'March':
            return 2;
        case 'April':
            return 3;
        case 'May':
            return 4;
        case 'June':
            return 5;
        case 'July':
            return 6;
        case 'August':
            return 7;
        case 'September':
            return 8;
        case 'October':
            return 9;
        case 'November':
            return 10;
        case 'December':
            return 11;
    
        default:
            throw `Value '${month}' is out of index`;
    }
}