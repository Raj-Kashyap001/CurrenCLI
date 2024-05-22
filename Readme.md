# Currency Converter CLI

A command-line interface (CLI) tool for converting amounts between different currencies using the ExchangeRate-API.

## Features

- Convert an amount from one currency to another
- List current exchange rates for a specified currency
- Save favorite currency pairs for quick access

## Installation

Ensure you have Node.js installed on your system.

Install the CLI tool globally using npm:

```bash
npm install -g currency-converter-cli
```

Usage
Getting Started

To get started, you'll need to obtain an API key from ExchangeRate-API. Follow these steps:

- Sign up on the ExchangeRate-API website to get your API key.

- Once you have your API key, proceed with the following steps.

If you haven't saved your API key yet, the CLI tool will prompt you to enter it. Once entered, the API key will be saved locally for future use.

## Usage

```bash
what-currency convert
```

Follow the prompts to enter the amount, source currency, and target currency. The CLI will then convert the amount to the target currency using the latest exchange rates.
Listing Exchange Rates

```bash
what-currency list
```

Follow the prompt to enter the base currency. The CLI will then list the current exchange rates for the specified base currency.
Saving Favorite Currency Pair

bash

currency-converter save

Follow the prompts to enter the source and target currencies. The CLI will save the pair for quick access in the future.
Showing Favorite Currency Pairs

bash

currency-converter favorites

Displays the saved favorite currency pairs.
API Key

This tool uses the ExchangeRate-API. You need to sign up on the ExchangeRate-API website to get an API key. You'll be prompted to enter your API key when you first run the tool.
License

This project is licensed under the MIT License - see the LICENSE file for details.

© 2024 Raj Kashyap. All Rights Reserved.
