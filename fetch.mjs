import puppeteer from 'puppeteer';

import { config } from "./config.mjs";

import Diff from 'fast-diff';
import { diff as htmlDiff } from 'diffblazer';

const sites = config.sites;

const computedStyle = (selector) => {
  let el = document.querySelector(selector);
  let cs = getComputedStyle(el);
  let result = Object.getOwnPropertyNames(cs)
           .map( (k) => cs[k] )
           .reduce((acc,k) => { 
                                acc[k] = cs[k];
                                return acc;
                              },
                            {});
  result.sourceHTML= el.innerHTML;
  return result;
};

async function extractComputedStyle(browser, site) {
    let page = await browser.newPage();
    console.log("Fetching", site);
    await page.goto(site, { waitUntil: 'networkidle0'} );
    await page.addScriptTag({ content: `const computedStyle = ${computedStyle}` });

    console.log("Evaluating computed style for", config.element);
    return await page.evaluate((compareSelector) => {
	    return computedStyle(compareSelector);
    }, config.element);
};

// diffblazer and other HTML diff libraries
// will return a relatively unaltered versio of 
// the original HTML if their algorithm
// does *NOT* detect a difference; so we look in the output
// of the diffing function for telltale signs to detect whethere there was
// a difference detected
const computeHtmlDiff = (first, second) => {
 	let theDiff = htmlDiff(first, second);
	if ( theDiff.match(/diff(?:ins|del)/) ) {
		return [true, theDiff];
	}
	return [false, ""];
};

const diffStyleObjects = (first, second) => {
    if ( first === second ) {
	return { failed: "objects are identical" }
    }
    const diff = {}
    for( var prop of Object.getOwnPropertyNames(first) ) {
        let fp = first[prop];
        let sp = second[prop];
	if ( prop == 'sourceHTML' ) {
		const [hasDiff, diffResult] = computeHtmlDiff(fp,sp);
		if ( hasDiff ) {
			diff[prop] = [fp, sp, diffResult];
		}
	} else if ( fp !== sp ) {
            diff[prop] = [fp, sp, Diff(fp,sp)]
        }
    }
    return diff;
};

const browser = await puppeteer.launch({ args: ['--no-sandbox'] });

async function fetchComputedStyles(site) {
    return await extractComputedStyle(browser, site);
}

const styleObjects = [];
for( let site of config.sites ) {
	styleObjects.push(await fetchComputedStyles(site));
}


await browser.close();
let styleDiff = diffStyleObjects(...styleObjects);
if ( Object.keys(styleDiff).length > 0 ) {
	console.log("Found differences in computed styles");
	if ( Object.keys(styleDiff).length == 1 && 'sourceHTML' in styleDiff ) {
		console.log("HTML Difference: ", styleDiff.sourceHTML[2]);
	} else {
		console.log(styleDiff);
	}
} else {
	console.log("No difference in computed styles detected");
}


