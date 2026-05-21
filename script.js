let processedRows = []; // Global variable to store data for download

// --- 1. Helper: Parse DD-MM-YYYY to Date Object ---
function parseStrictDMY(str) {
    if (!str || typeof str !== 'string') return null;
    const datePart = str.split(' ')[0]; // Ignore time
    const parts = datePart.replace(/\//g, '-').split('-');

    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const dateObj = new Date(year, month, day);
        return isNaN(dateObj.getTime()) ? null : dateObj;
    }
    return null;
}

// --- 2. Helper: Clean "DD-MM-YYYY HH:mm" to just "DD-MM-YYYY" ---
function getOnlyDate(str) {
    if (!str || str.trim() === "") return "";
    return str.split(' ')[0]; // Returns the part before the first space
}

// --- 3. Main Processing Logic ---
function processData(rawData) {
    const headers = rawData[0].map(h => h.toLowerCase().trim());
    const rows = rawData.slice(1);

    const fNameIdx = headers.indexOf('first name');
    const lNameIdx = headers.indexOf('last name');
    const emailIdx = headers.indexOf('email');
    const visitedIdx = headers.findIndex(h => h.includes('visited'));
    const loginIdx = headers.findIndex(h => h.includes('last login'));
    const lessonIdx = headers.findIndex(h => h.includes('lesson'));
    const progIdx = headers.findIndex(h => h.includes('progress'));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const trackerHeaders = ["Student Name", "Email", "Last Visited", "Last Login", "Days Since Last Visited", "Current Lesson", "Progress %"];
    processedRows = []; 

    rows.forEach(row => {
        const name = `${row[fNameIdx] || ""} ${row[lNameIdx] || ""}`.trim();
        const rawVisited = visitedIdx !== -1 ? row[visitedIdx] : "";
        const rawLogin = loginIdx !== -1 ? row[loginIdx] : "";
        
        // Calculate Days using priority: Visited, then Login
        let targetDate = parseStrictDMY(rawVisited) || parseStrictDMY(rawLogin);
        let daysSince = "N/A";
        
        if (targetDate) {
            const diff = today.getTime() - targetDate.getTime();
            daysSince = Math.floor(diff / (1000 * 60 * 60 * 24));
            if (daysSince < 0) daysSince = 0;
        }

        // Push "Clean" data to our storage
        processedRows.push({
            name: name,
            email: emailIdx !== -1 ? row[emailIdx] : "",
            visited: getOnlyDate(rawVisited), // Cleaned for Excel
            login: getOnlyDate(rawLogin),     // Cleaned for Excel
            days: daysSince,
            lesson: lessonIdx !== -1 ? row[lessonIdx] : "",
            progress: (progIdx !== -1 && row[progIdx] !== "") ? `${row[progIdx]}%` : row[progIdx]
        });
    });

    displayResults(trackerHeaders, processedRows);
}

// --- 4. Render Table to Webpage ---
function displayResults(headers, data) {
    const headerRow = document.getElementById('tableHeader');
    const body = document.getElementById('tableBody');
    headerRow.innerHTML = '';
    body.innerHTML = '';

    headers.forEach(h => headerRow.innerHTML += `<th>${h}</th>`);

    data.forEach(item => {
        const isInactive = (item.days !== "N/A" && item.days > 10);
        const rowClass = isInactive ? 'class="inactive"' : '';
        
        body.innerHTML += `
            <tr ${rowClass}>
                <td>${item.name}</td>
                <td>${item.email}</td>
                <td>${item.visited}</td>
                <td>${item.login}</td>
                <td>${item.days}</td>
                <td>${item.lesson} days</td>
                <td>${item.progress}</td>
            </tr>`;
    });

    document.getElementById('resultArea').style.display = 'block';
}

// --- 5. Event Listeners ---
document.getElementById('processBtn').addEventListener('click', () => {
    const fileInput = document.getElementById('csvFile');
    if (!fileInput.files[0]) {
        alert("Please select a CSV file first!");
        return;
    }
    Papa.parse(fileInput.files[0], {
        skipEmptyLines: true,
        complete: function(results) {
            processData(results.data);
        }
    });
});

document.getElementById('downloadBtn').addEventListener('click', () => {
    if (processedRows.length === 0) return;

    // Convert object array to array of arrays for clean CSV export
    const csvHeaders = ["Student Name", "Email", "Last Visited", "Last Login", "Days Since Last Visited", "Current Lesson", "Progress %"];
    const exportData = processedRows.map(r => [r.name, r.email, r.visited, r.login, r.days, r.lesson, r.progress]);
    exportData.unshift(csvHeaders);

    const csvString = Papa.unparse(exportData);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Clean_Student_Report.csv";
    link.click();
    URL.revokeObjectURL(url);
});