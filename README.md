# Student Report

A simple browser-based tool for processing student activity data from Cypher reports.

## Live Demo

Try it live: https://cimarko.github.io/student_report/

## What it does

This project lets you upload a CSV file exported from Cypher Raw Data and generate a clean student activity report in your browser. It highlights students who have not been active for more than 10 days and lets you download the processed report as a CSV.

## How to use

1. Open the app in your browser by visiting the live link above or opening `index.html` locally.
2. Export your Cypher Raw Data as a `.csv` file.
3. Click the **Choose File** button and select the exported CSV.
4. Click **Run report**.
5. Review the generated report on the page.
6. Click **Download CSV** to save the cleaned report.

## What to expect

- The app reads your CSV file in the browser.
- It extracts student name, email, last visited date, last login date, lesson progress, and inactivity.
- Students inactive for more than 10 days are highlighted for quick review.

## Files in this project

- `index.html` — main webpage and user interface
- `style.css` — page styling and layout
- `script.js` — CSV parsing, report generation, and download logic

## Notes

- No installation is required. It runs entirely in your browser.
- Use the live demo link for the fastest experience.
- Your data is processed locally and is not uploaded to any server.
