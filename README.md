# Destiny Journal

A comprehensive activity tracking and analysis tool for Destiny 1 & 2 players. View detailed statistics, activity history, and performance metrics across both games in one unified interface.

## Features

- Combined activity tracking for Destiny 1 & 2
- Detailed activity statistics and analytics
- Enhanced visualization options
- Player performance metrics
- Activity filtering and search
- Responsive material design interface

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Angular CLI
- Bungie.net API Key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Splashbear/Destiny-Journal.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment configuration (see Environment Setup below)

4. Start the development server:
   ```bash
   npm start
   ```

### Environment Setup

1. Create a Bungie Application:

   - Go to [Bungie Developer Portal](https://www.bungie.net/en/Application)
   - Create a new application
   - Set OAuth Client Type to "Confidential"
   - Add `https://destiny-journal.com/auth` to OAuth Redirect URIs
   - Save and note your API Key and OAuth Client ID/Secret

2. Create environment files:

   Create `src/environments/environment.ts` for development:

   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:4200/api',
     bungieApiKey: 'YOUR_API_KEY',
     features: {
       analytics: false,
       errorReporting: false,
     },
     bungie: {
       apiKey: 'YOUR_API_KEY',
       authUrl: 'https://www.bungie.net/en/OAuth/Authorize',
       clientId: 'YOUR_CLIENT_ID',
       clientSecret: 'YOUR_CLIENT_SECRET',
       redirect: 'http://localhost:4200/auth',
     },
   }
   ```

   Create `src/environments/environment.prod.ts` for production:

   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://api.destiny-journal.com',
     bungieApiKey: '${BUNGIE_API_KEY}',
     features: {
       analytics: true,
       errorReporting: true,
     },
     bungie: {
       apiKey: 'YOUR_API_KEY',
       authUrl: 'https://www.bungie.net/en/OAuth/Authorize',
       clientId: 'YOUR_CLIENT_ID',
       clientSecret: 'YOUR_CLIENT_SECRET',
       redirect: 'https://destiny-journal.com/auth',
     },
   }
   ```

   Note: Never commit your actual API keys. Replace 'YOUR_API_KEY', 'YOUR_CLIENT_ID', and 'YOUR_CLIENT_SECRET' with your actual values locally.

## Built With

- Angular
- Angular Material
- Bungie API
- TypeScript

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
