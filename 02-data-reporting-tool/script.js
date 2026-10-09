/* ==========================================================================
   02-data-reporting-tool/script.js
   Real-time form validation and dynamic submission handling
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reportForm");
  const titleInput = document.getElementById("reportTitle");
  const categorySelect = document.getElementById("reportCategory");
  const valueInput = document.getElementById("metricValue");
  const notesInput = document.getElementById("reportNotes");

  const reportsList = document.getElementById("reportsList");
  const emptyState = document.getElementById("emptyState");
  const reportCount = document.getElementById("reportCount");

  let reports = [];

  // 1. Validation Logic
  function validateField(input, errorElement, message) {
    if (!input.value.trim()) {
      input.classList.add("input-error");
      errorElement.textContent = message;
      errorElement.classList.add("visible");
      return false;
    } else {
      input.classList.remove("input-error");
      errorElement.textContent = "";
      errorElement.classList.remove("visible");
      return true;
    }
  }

  // 2. Real-time Clear Error on Input
  [titleInput, categorySelect, valueInput].forEach((input) => {
    input.addEventListener("input", () => {
      input.classList.remove("input-error");
      const errEl = document.getElementById(input.id + "Error");
      if (errEl) errEl.classList.remove("visible");
    });
  });

  // 3. Form Submit Handler
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const isTitleValid = validateField(titleInput, document.getElementById("titleError"), "Title is required.");
    const isCategoryValid = validateField(categorySelect, document.getElementById("categoryError"), "Please select a category.");
    const isValueValid = validateField(valueInput, document.getElementById("valueError"), "Value is required.");

    if (isTitleValid && isCategoryValid && isValueValid) {
      const newReport = {
        id: Date.now(),
        title: titleInput.value.trim(),
        category: categorySelect.value,
        value: valueInput.value.trim(),
        notes: notesInput.value.trim() || "No additional notes provided."
      };

      reports.unshift(newReport);
      renderReports();
      form.reset();
    }
  });

  // 4. Render Submissions List
  function renderReports() {
    if (reports.length === 0) {
      emptyState.style.display = "block";
      reportCount.textContent = "0 entries";
      return;
    }

    emptyState.style.display = "none";
    reportCount.textContent = `${reports.length} ${reports.length === 1 ? 'entry' : 'entries'}`;

    reportsList.innerHTML = ""; // Clear existing render

    reports.forEach((item) => {
      const reportDiv = document.createElement("div");
      reportDiv.className = "report-item";

      reportDiv.innerHTML = `
        <div class="report-item-header">
          <h4>${escapeHTML(item.title)}</h4>
          <span class="report-cat">${escapeHTML(item.category)}</span>
        </div>
        <div class="report-metric">Metric Output: <strong>${escapeHTML(item.value)}</strong></div>
        <p class="report-notes">${escapeHTML(item.notes)}</p>
      `;

      reportsList.appendChild(reportDiv);
    });
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
});