function runAnalysis() {
    const query = document.getElementById("queryInput").value.trim();
    const resultBox = document.getElementById("result");

    if (!query) {
        resultBox.innerHTML = "<p>Please enter a query.</p>";
        return;
    }

    resultBox.innerHTML = `<div class="spinner"></div>`;

    setTimeout(() => {
        const result = analyzeQuery(query);
        renderResult(result);
    }, 600);
}

function analyzeQuery(query) {

    let risks = [];
    let performanceScore = 0;
    let scalabilityScore = 0;
    let maintainabilityScore = 0;

    const joins = (query.match(/join/gi) || []).length;
    const selectStar = /select\s+\*/i.test(query);
    const where = /where/i.test(query);
    const limit = /limit/i.test(query);
    const orderBy = /order\s+by/i.test(query);
    const subqueries = (query.match(/\(\s*select/gi) || []).length;
    const groupBy = /group\s+by/i.test(query);

    // Performance checks
    if (selectStar) {
        risks.push(makeRisk("Performance", "SELECT * detected", "Specify only required columns."));
        performanceScore += 15;
    }

    if (!where && !limit) {
        risks.push(makeRisk("Performance", "No WHERE or LIMIT clause", "May cause full table scan."));
        performanceScore += 25;
    }

    if (orderBy && !limit) {
        risks.push(makeRisk("Performance", "ORDER BY without LIMIT", "Sorting large dataset can be expensive."));
        performanceScore += 15;
    }

    if (joins > 3) {
        risks.push(makeRisk("Scalability", "Too many JOIN operations", "Consider indexing join columns."));
        scalabilityScore += 20;
    }

    if (subqueries > 2) {
        risks.push(makeRisk("Maintainability", "Multiple nested subqueries", "Simplify logic using JOIN or CTE."));
        maintainabilityScore += 10;
    }

    if (groupBy && joins > 2) {
        risks.push(makeRisk("Scalability", "GROUP BY with multiple JOINs", "Aggregation may be expensive."));
        scalabilityScore += 15;
    }

    const totalScore = performanceScore + scalabilityScore + maintainabilityScore;

    const grade = calculateGrade(totalScore);

    return {
        totalScore,
        grade,
        breakdown: {
            performanceScore,
            scalabilityScore,
            maintainabilityScore
        },
        risks
    };
}

function makeRisk(type, message, suggestion) {
    return { type, message, suggestion };
}

function calculateGrade(score) {
    if (score < 20) return "A";
    if (score < 40) return "B";
    if (score < 60) return "C";
    if (score < 80) return "D";
    return "F";
}


function renderResult(result) {

    let html = `
        <div class="score-overview">
            <div class="grade-box grade-${result.grade}">
                ${result.grade}
            </div>

            <div class="score-details">
                <p><strong>Total Risk Score:</strong> ${result.totalScore}</p>
                <p>Performance: ${result.breakdown.performanceScore}</p>
                <p>Scalability: ${result.breakdown.scalabilityScore}</p>
                <p>Maintainability: ${result.breakdown.maintainabilityScore}</p>
            </div>
        </div>
    `;

    html += `<div class="risk-section">`;

    result.risks.forEach(r => {
        html += `
            <div class="risk-card">
                <strong>${r.type}</strong>
                <p>${r.message}</p>
                <small>${r.suggestion}</small>
            </div>
        `;
    });

    html += `</div>`;

    document.getElementById("result").innerHTML = html;
}

function runInlineAnalysis() {
    const query = document.getElementById("inlineQuery").value;
    const result = analyzeQuery(query);

    document.getElementById("inlineResult").innerHTML =
        `<p><strong>Grade:</strong> ${result.grade}</p>
         <p>Score: ${result.totalScore}</p>`;
}