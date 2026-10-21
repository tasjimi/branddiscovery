# Wallflower · Brand Discovery Journey

A one-question-per-page brand discovery questionnaire for founders. Each person's answers are sent, as they go, to a Google Sheet (one row per person, updated in place).

## Files

- `index.html` — the whole questionnaire (styles and script included).
- `config.js` — the Google Apps Script web app URL that receives answers.
- `img/` — the two black-and-white photographs used on the opening pages.
- `apps-script/Code.gs` — the script that lives in the Google Sheet (Extensions → Apps Script) and writes each answer row. It is kept here for reference; the copy that runs is the one in the sheet.

## Hosting

Published with GitHub Pages from the `main` branch, root folder.

## Changing where answers go

Deploy `apps-script/Code.gs` as a web app from another Google Sheet (Execute as: Me, Who has access: Anyone), then replace the URL in `config.js`.
