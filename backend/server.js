#!/usr/bin/env node
/**
 * Outfit Scraper API using Puppeteer + Cheerio + Express
 * --------------------------------------------------------
 * Exposes /api/amazon, /api/flipkart, and /api/combined endpoints.
 * Usage:
 * 1. npm install express puppeteer cheerio chalk cors 👈 ADDED 'cors'
 * 2. node server.js
 * 3. Access via browser or tool (e.g., Postman):
 * - http://localhost:3000/api/combined?query=mens+outfit
 */

import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import chalk from "chalk";
import express from "express"; 
import cors from "cors"; // 👈 NEW: Import CORS middleware

const PLATFORMS = {
  amazon: {
    baseUrl: "https://www.amazon.in/s?k=",
    name: "Amazon",
  },
  flipkart: {
    baseUrl: "https://www.flipkart.com/search?q=",
    name: "Flipkart",
  },
};

/* -------------------------------------------------------------------------- */
/* 🧩 Create Headless Browser                         */
/* -------------------------------------------------------------------------- */
async function createBrowser() {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-extensions",
      "--disable-background-networking",
      "--window-size=1920,1080",
      "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127 Safari/537.36",
    ],
  });
  return browser;
}

/* -------------------------------------------------------------------------- */
/* AMAZON SCRAPER                               */
/* -------------------------------------------------------------------------- */
async function scrapeAmazon(query) {
  console.log(chalk.blueBright(`[Amazon] 🔍 Fetching results for "${query}"`));

  const url = `${PLATFORMS.amazon.baseUrl}${encodeURIComponent(query)}`;
  const browser = await createBrowser();
  const page = await browser.newPage();
  const results = [];

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForSelector("div[role='listitem']", { timeout: 15000 });

    const html = await page.content();
    const $ = cheerio.load(html);

    $("div[role='listitem']").each((i, el) => {
      if (results.length >= 10) return false;

      const name = $(el)
        .find("h2.a-size-base-plus.a-spacing-none.a-color-base.a-text-normal span")
        .text()
        .trim();
      
      let image = $(el).find("img.s-image").attr("src");
      // Image URL modification: replace thumbnail size with higher resolution
      if (image) {
          image = image.replace("._AC_UL320_", "._SY879_");
      }
      
      const priceElement = $(el).find("span.a-price-whole").first();
      const priceText = priceElement.length
        ? priceElement.text()
        : $(el).find("span.a-offscreen").first().text();
      const price = priceText.replace(/[^\d]/g, "");

      const brand = $(el)
        .find("h2.a-size-mini.s-line-clamp-1 span.a-size-base-plus.a-color-base")
        .text()
        .trim();
      const relativeUrl = $(el)
        .find("a.a-link-normal.s-no-outline")
        .attr("href");
      const redirectUrl = relativeUrl
        ? new URL(relativeUrl, "https://www.amazon.in").href
        : null;

      if (name && image && redirectUrl) {
        results.push({
          id: `amazon-${i}`,
          name,
          image,
          price: price ? parseInt(price) : null,
          brand: brand || "Unknown",
          redirectUrl,
          platform: "Amazon",
        });
      }
    });

    console.log(chalk.green(`[Amazon] ✅ Found ${results.length} products`));
  } catch (err) {
    console.error(chalk.red(`[Amazon] ❌ Error scraping: ${err.message}`));
    throw new Error(`Amazon scraping failed: ${err.message}`);
  } finally {
    await browser.close();
  }

  return results;
}

/* -------------------------------------------------------------------------- */
/* FLIPKART SCRAPER                              */
/* -------------------------------------------------------------------------- */
async function scrapeFlipkart(query) {
  console.log(chalk.blueBright(`[Flipkart] 🔍 Fetching results for "${query}"`));

  const url = `${PLATFORMS.flipkart.baseUrl}${encodeURIComponent(query)}`;
  const browser = await createBrowser();
  const page = await browser.newPage();
  const results = [];

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForSelector("div._75nlfW", { timeout: 15000 });

    const html = await page.content();
    const $ = cheerio.load(html);

    $("div._75nlfW").each((i, el) => {
      if (results.length >= 10) return false;

      const name = $(el).find("a.WKTcLC").text().trim();
      const image = $(el).find("img._53J4C-").attr("src");
      const price = $(el).find("div.Nx9bqj").first().text().replace(/[^\d]/g, "");
      const brand = $(el).find("div.syl9yP").text().trim();
      const relativeUrl = $(el).find("a.WKTcLC").attr("href");
      const redirectUrl = relativeUrl
        ? new URL(relativeUrl, "https://www.flipkart.com").href
        : null;

      if (name && image && redirectUrl) {
        results.push({
          id: `flipkart-${i}`,
          name,
          image,
          price: price ? parseInt(price) : null,
          brand: brand || "Unknown",
          redirectUrl,
          platform: "Flipkart",
        });
      }
    });

    console.log(chalk.green(`[Flipkart] ✅ Found ${results.length} products`));
  } catch (err) {
    console.error(chalk.red(`[Flipkart] ❌ Error scraping: ${err.message}`));
    throw new Error(`Flipkart scraping failed: ${err.message}`);
  } finally {
    await browser.close();
  }

  return results;
}

/* -------------------------------------------------------------------------- */
/* COMBINED & SHUFFLED DATA HELPER              */
/* -------------------------------------------------------------------------- */

// Fisher-Yates (Knuth) Shuffle algorithm
function shuffleArray(array) {
  let currentIndex = array.length, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

async function getShuffledCombinedData(query) {
    // Run both scrapers concurrently
    const [amazonResults, flipkartResults] = await Promise.all([
        scrapeAmazon(query).catch(err => {
            console.warn(chalk.yellow(`[Combined] Amazon failed, using empty array: ${err.message.split(': ')[1]}`));
            return [];
        }),
        scrapeFlipkart(query).catch(err => {
            console.warn(chalk.yellow(`[Combined] Flipkart failed, using empty array: ${err.message.split(': ')[1]}`));
            return [];
        })
    ]);

    const combinedResults = [...amazonResults, ...flipkartResults];
    const shuffledResults = shuffleArray(combinedResults);

    console.log(chalk.cyan(`[Combined] Total products: ${combinedResults.length}, Shuffled: Yes`));
    
    return shuffledResults;
}


/* -------------------------------------------------------------------------- */
/* EXPRESS SERVER                              */
/* -------------------------------------------------------------------------- */
const app = express();
const PORT = process.env.PORT || 3000;

// 💡 CORS FIX: Enable all CORS requests for local development
app.use(cors());

// Middleware to log requests
app.use((req, res, next) => {
  console.log(chalk.yellow(`\n[Request] ${req.method} ${req.originalUrl}`));
  next();
});

// Root endpoint for status check
app.get("/", (req, res) => {
  res.json({
    status: "Outfit Scraper API is running",
    endpoints: {
      amazon: "/api/amazon?query=example",
      flipkart: "/api/flipkart?query=example",
      combined_shuffled: "/api/combined?query=example",
    },
  });
});

/**
 * Endpoint for Amazon Scraper
 */
app.get("/api/amazon", async (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).json({
      error: "Missing search query. Please use /api/amazon?query=your+search+term",
    });
  }

  try {
    const results = await scrapeAmazon(query);
    res.json({
      query,
      platform: "Amazon",
      count: results.length,
      products: results,
    });
  } catch (error) {
    console.error(chalk.red(`Server error on /api/amazon: ${error.message}`));
    res.status(500).json({
      error: "Failed to scrape Amazon data",
      details: error.message,
    });
  }
});

/**
 * Endpoint for Flipkart Scraper
 */
app.get("/api/flipkart", async (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).json({
      error: "Missing search query. Please use /api/flipkart?query=your+search+term",
    });
  }

  try {
    const results = await scrapeFlipkart(query);
    res.json({
      query,
      platform: "Flipkart",
      count: results.length,
      products: results,
    });
  } catch (error) {
    console.error(chalk.red(`Server error on /api/flipkart: ${error.message}`));
    res.status(500).json({
      error: "Failed to scrape Flipkart data",
      details: error.message,
    });
  }
});

/**
 * Endpoint for Combined and Shuffled Data
 * GET /api/combined?query=search+term
 */
app.get("/api/combined", async (req, res) => {
    const query = req.query.query;

    if (!query) {
        return res.status(400).json({
            error: "Missing search query. Please use /api/combined?query=your+search+term",
        });
    }

    try {
        const results = await getShuffledCombinedData(query);
        res.json({
            query,
            platforms: ["Amazon", "Flipkart"],
            count: results.length,
            is_shuffled: true,
            products: results,
        });
    } catch (error) {
        console.error(chalk.red(`Server error on /api/combined: ${error.message}`));
        res.status(500).json({
            error: "Failed to scrape combined data",
            details: error.message,
        });
    }
});


// Start the server
app.listen(PORT, () => {
  console.log(chalk.yellow.bold("----------------------------------------"));
  console.log(chalk.yellow.bold(" 🧥 Outfit Scraper API (Puppeteer Edition)"));
  console.log(chalk.yellow.bold(` 🌐 Server running at http://localhost:${PORT}`));
  console.log(chalk.yellow.bold("----------------------------------------"));
});