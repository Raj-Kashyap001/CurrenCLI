#!/usr/bin/env node

import axios from "axios";
import chalk from "chalk";
import os from "node:os";
import path from "node:path";
import inquirer from "inquirer";
import fs from "fs";
import { Command } from "commander";

const program = new Command();

program
  .version("1.0.0")
  .description("currencli: Currency Converter CLI Tool.")
  .on("--help", () => {
    console.log("");
    console.log("Example:");
    console.log("  $ currencli convert");
    console.log("  $ currencli list");
    console.log("  $ currencli save");
    console.log("  $ currencli favorites");
  });

// Custom help command
program
  .command("help")
  .description("Display help information")
  .action(() => {
    program.outputHelp();
    process.exit(0);
  });

const getExchangeRates = async (apiKey, baseCurrency) => {
  try {
    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${baseCurrency}`
    );
    return response.data.conversion_rates;
  } catch (error) {
    console.error(chalk.red("Error fetching exchange rates:", error.message));
    process.exit(1);
  }
};

const validateApiKey = async (apiKey) => {
  try {
    await axios.get(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
    return true;
  } catch {
    return false;
  }
};

const convertCurrency = async (apiKey, amount, fromCurrency, toCurrency) => {
  fromCurrency = fromCurrency.toUpperCase();
  toCurrency = toCurrency.toUpperCase();

  const rates = await getExchangeRates(apiKey, fromCurrency);
  const rate = rates[toCurrency];
  if (!rate) {
    console.error(
      chalk.red(`Unable to convert from ${fromCurrency} to ${toCurrency}`)
    );
    process.exit(1);
  }
  return amount * rate;
};

const listExchangeRates = async (apiKey, baseCurrency) => {
  baseCurrency = baseCurrency.toUpperCase();

  const rates = await getExchangeRates(apiKey, baseCurrency);
  console.log(chalk.blue(`Exchange rates for ${baseCurrency}:`));
  for (const [currency, rate] of Object.entries(rates)) {
    console.log(`${chalk.yellow(currency)}: ${chalk.green(rate)}`);
  }
};

const saveFavoritePair = (fromCurrency, toCurrency) => {
  fromCurrency = fromCurrency.toUpperCase();
  toCurrency = toCurrency.toUpperCase();

  const favorites = loadFavorites();
  favorites.push({ fromCurrency, toCurrency });
  saveFavorites(favorites);
  console.log(
    chalk.green(`Saved favorite pair: ${fromCurrency} -> ${toCurrency}`)
  );
};

const loadFavorites = () => {
  if (!fs.existsSync("favorites.json")) {
    return [];
  }
  const data = fs.readFileSync("favorites.json");
  return JSON.parse(data);
};

const saveFavorites = (favorites) => {
  fs.writeFileSync("favorites.json", JSON.stringify(favorites, null, 2));
};

const apiName = "exchange-rate-api";

let apiFilePath;
switch (os.platform()) {
  case "win32":
    apiFilePath = path.join(os.homedir(), `.${apiName}.txt`);
    break;
  case "darwin":
  case "linux":
    apiFilePath = path.join(os.homedir(), `.${apiName}.txt`);
    break;
  default:
    console.error("Unsupported operating system");
    process.exit(1);
}

const saveApiKey = (apiKey) => {
  try {
    fs.writeFileSync(apiFilePath, apiKey);
    console.log(chalk.green("API key saved successfully."));
  } catch (error) {
    console.error(chalk.red("Error saving API key:", error.message));
    process.exit(1);
  }
};

const loadApiKey = () => {
  try {
    if (fs.existsSync(apiFilePath)) {
      return fs.readFileSync(apiFilePath, "utf-8").trim();
    }
    return null;
  } catch (error) {
    console.error(chalk.red("Error loading API key:", error.message));
    process.exit(1);
  }
};

const main = async () => {
  let apiKey = loadApiKey();
  if (!apiKey) {
    const { apiKey: newApiKey } = await inquirer.prompt([
      {
        type: "input",
        name: "apiKey",
        message: "Enter your ExchangeRate-API key:",
      },
    ]);
    apiKey = newApiKey;
    saveApiKey(apiKey);
  }

  if (!(await validateApiKey(apiKey))) {
    console.error(chalk.red("Invalid API key. Please try again."));
    process.exit(1);
  }

  program
    .command("convert")
    .description("Convert an amount from one currency to another")
    .action(async () => {
      const { amount, fromCurrency, toCurrency } = await inquirer.prompt([
        { type: "input", name: "amount", message: "Enter amount:" },
        {
          type: "input",
          name: "fromCurrency",
          message: "From currency (e.g., USD):",
        },
        {
          type: "input",
          name: "toCurrency",
          message: "To currency (e.g., EUR):",
        },
      ]);
      const result = await convertCurrency(
        apiKey,
        amount,
        fromCurrency,
        toCurrency
      );
      console.log(
        chalk.blue(`Converted amount: ${chalk.green(result)} ${toCurrency}`)
      );
    });

  program
    .command("list")
    .description("List current exchange rates for a specified currency")
    .action(async () => {
      const { baseCurrency } = await inquirer.prompt([
        {
          type: "input",
          name: "baseCurrency",
          message: "Base currency (e.g., USD):",
        },
      ]);
      await listExchangeRates(apiKey, baseCurrency);
    });

  program
    .command("save")
    .description("Save favorite currency pairs for quick access")
    .action(async () => {
      const { fromCurrency, toCurrency } = await inquirer.prompt([
        {
          type: "input",
          name: "fromCurrency",
          message: "From currency (e.g., USD):",
        },
        {
          type: "input",
          name: "toCurrency",
          message: "To currency (e.g., EUR):",
        },
      ]);
      saveFavoritePair(fromCurrency, toCurrency);
    });

  program
    .command("favorites")
    .description("Show favorite currency pairs")
    .action(() => {
      const favorites = loadFavorites();
      if (favorites.length === 0) {
        console.log(chalk.yellow("No favorite pairs saved."));
      } else {
        console.log(chalk.blue("Favorite currency pairs:"));
        favorites.forEach(({ fromCurrency, toCurrency }) => {
          console.log(
            `${chalk.yellow(fromCurrency)} -> ${chalk.green(toCurrency)}`
          );
        });
      }
    });

  if (!process.argv.slice(2).length) {
    program.outputHelp();
    process.exit(0);
  }

  program.parse(process.argv);
};

main();
