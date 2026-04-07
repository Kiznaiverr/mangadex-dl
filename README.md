# MangaDex CLI Downloader

A Node.js command-line tool to search and download manga from MangaDex with an interactive interface.

## Features

- Interactive search for manga on MangaDex
- Browse and select specific chapters to download
- Range selection for downloading multiple chapters at once
- Automatic compression of downloaded chapters into ZIP files
- Configurable output directory and language preferences
- Retry mechanism with customizable attempts and delays
- Progress tracking for downloads

## Requirements

- Node.js 14.0 or higher
- npm or yarn

## Installation

1. Clone this repository:

```bash
git clone https://github.com/Kiznaiverr/mangadex-dl.git
cd mangadex-dl
```

2. Install dependencies:

```bash
npm install
```

## Configuration

Edit the `config.json` file to customize settings:

```json
{
  "outputDir": "path/to/manga/directory",
  "language": "en",
  "retryAttempts": 3,
  "retryDelay": 1000,
  "rateLimitDelay": 200
}
```

- `outputDir`: Directory where downloaded manga will be saved
- `language`: Language code for manga (e.g., "en", "id")
- `retryAttempts`: Number of retry attempts for failed requests
- `retryDelay`: Delay in milliseconds between retries
- `rateLimitDelay`: Delay in milliseconds between API requests

## Usage

### Start the application:

```bash
npm start
```

### Development mode (with auto-reload):

```bash
npm run dev
```

## How it works

1. Search for a manga title
2. Select the manga from search results
3. View manga details and available chapters
4. Select the chapters you want to download
5. Chapters will be downloaded and automatically compressed into a ZIP file

## Project Structure

```
.
├── index.js                 # Entry point
├── config.json              # Configuration file
├── package.json             # Project dependencies
├── src/
│   ├── api/
│   │   └── mangadex.js      # MangaDex API integration
│   ├── cli/
│   │   └── index.js         # CLI user interface
│   ├── downloader/
│   │   ├── downloader.js    # Chapter downloader logic
│   │   └── zipper.js        # ZIP compression functionality
│   └── utils/
│       ├── logger.js        # Logging utility
│       └── retry.js         # Retry mechanism
```

## Dependencies

- **inquirer**: Interactive command-line prompts
- **archiver**: ZIP file compression
- **chalk**: Terminal string styling
- **ora**: Elegant terminal spinners
- **cli-progress**: Terminal progress bars

## License

MIT

## Disclaimer

This tool is for personal use only. Respect copyright laws and the MangaDex terms of service when using this tool.
