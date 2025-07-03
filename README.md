# Gym Stats Calculator

A client-side React + Tailwind CSS web app to simulate Torn happy-jump training gains across gyms.

## Features

- **Merit Bonuses**: Input your gym merit bonuses as percentages (e.g., 15% for 15% bonus gain)
- **Faction Bonuses**: Configure Steadfast gym gains up to 20% per stat
- **Gym Comparison**: Compare all gyms to find the optimal training location
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and mobile devices

## Requirements

- Node.js ≥16
- npm

## Installation

```bash
npm install
npm run dev
```

## Usage

1. Enter your current stats (STR, DEF, SPD, DEX)
2. Set your happy and total energy values
3. Configure your merit bonuses as percentages
4. Adjust faction bonuses if applicable
5. Click "Compute Maximum Gains" to see results

## Merit Bonuses

The merit bonuses section now accepts percentage values instead of raw multipliers. For example:
- Enter "15" for a 15% bonus (1.15x multiplier)
- Enter "25" for a 25% bonus (1.25x multiplier)

## Faction Bonuses

Steadfast bonuses can be configured from 0% to 20% per stat. These represent additional multiplicative bonuses from faction upgrades.