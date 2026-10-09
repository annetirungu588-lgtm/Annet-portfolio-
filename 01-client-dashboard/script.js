/* ==========================================================================
   01-client-dashboard/script.js
   ========================================================================== */

const API_URL = "http://127.0.0.1:5000/api/messages";

document.addEventListener("DOMContentLoaded", () => {
  const taskList = document.getElementById("taskList");
  const navLinks = document.querySelectorAll(".nav-link");
  const userProfileBtn = document.getElementById("userProfileBtn");

  const sections = {
    tasks: document.getElementById("tasksSection"),
    schedules: document.getElementById("schedulesSection"),
    clients: document.getElementById("clientsSection")
  };

  const initialTasks = [
    { id: 1, title: "Review Q3 Client Proposal", priority: "High", completed: false },
    { id: 2, title: "Schedule Onboarding Call", priority: "Medium", completed: false },
    { id: 3, title: "Update CRM Client Records", priority: "Low", completed: true }
  ];

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      navLinks.forEach((navLink) => navLink.classList.remove("active"));
      link.classList.add("active");

      const filter = link.dataset.filter;

      Object.keys(sections).forEach((key) => {
        if (!sections[key]) return;

        sections[key].style.display =
          filter === "all" || filter === key ? "block" : "none";
      });
    });
  });

  if (userProfileBtn) {
    userProfileBtn.addEventListener("click", () => {
      alert(
        "Manager Overview:\n\n• Active Projects: 3\n• Pending Reviews: 1\n• System Status: Operational"
      );
    });
  }

  function getPriorityClass(priority) {
    switch (priority.toLowerCase()) {
      case "high":
        return "high-priority";
      case "medium":
      case "med":
        return "med-priority";
      default:
        return "low-priority";
    }
  }

  function escapeHTML(str) {
    return String(str).replace(
      /[&<>'"]/g,
      (tag) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;"
        }[tag])
    );
  }

  function renderTasks(tasksToRender) {
    if (!taskList) return;

    taskList.innerHTML = "";

    tasksToRender.forEach((task) => {
      const taskLi = document.createElement("li");

      taskLi.className = `task-item ${getPriorityClass(task.priority)} ${
        task.completed ? "completed" : ""
      }`;

      taskLi.innerHTML = `
        <div class="task-content">
          <input
            type="checkbox"
            class="task-checkbox"
            ${task.completed ? "checked" : ""}
          />
          <span class="task-title">${escapeHTML(task.title)}</span>
        </div>
        <span class="badge">${escapeHTML(task.priority)}</span>
      `;

      taskList.appendChild(taskLi);
    });
  }

  if (taskList) {
    taskList.addEventListener("change", (event) => {
      if (event.target.classList.contains("task-checkbox")) {
        const taskItem = event.target.closest(".task-item");

        if (taskItem) {
          taskItem.classList.toggle("completed", event.target.checked);
        }
      }
    });
  }

  const UPCOMING_API_URL = "http://127.0.0.1:5000/api/upcoming";

async function getUpcomingSchedules() {
  const container = document.getElementById("upcoming-container");

  try {
    const response = await fetch(UPCOMING_API_URL);

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error("Could not load upcoming schedules.");
    }

    if (result.data.length === 0) {
      container.innerHTML = "<p>No upcoming schedules.</p>";
      return;
    }

    container.innerHTML = result.data
      .map((schedule) => {
        const date = new Date(schedule.schedule_date);

        return `
          <article class="upcoming-item">
            <h3>${schedule.title}</h3>
            <p><strong>Client:</strong> ${schedule.client_name || "Not provided"}</p>
            <p><strong>Date:</strong> ${date.toLocaleString()}</p>
            <p><strong>Status:</strong> ${schedule.status}</p>
          </article>
        `;
      })
      .join("");
  } catch (error) {
    console.error(error);
    container.innerHTML = "<p>Could not load upcoming schedules.</p>";
  }
}

  async function getClientMessages() {
    const clientsContainer = document.getElementById("clients-container");
    const latestClientContainer = document.getElementById("latest-client-record");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !Array.isArray(result.data)) {
        throw new Error("The API could not load messages.");
      }

      const messages = result.data;
      const latestMessage = messages[0];

      if (clientsContainer) {
        clientsContainer.innerHTML = `
          <p class="message-count">Total messages: ${result.count}</p>

          ${messages
            .map(
              (message) => `
                <article class="client-card">
                  <h3>${escapeHTML(message.name)}</h3>
                  <p><strong>Email:</strong> ${escapeHTML(message.email)}</p>
                  <p><strong>Subject:</strong> ${escapeHTML(
                    message.subject || "No Subject"
                  )}</p>
                  <p><strong>Message:</strong> ${escapeHTML(message.message)}</p>
                  <small>
                    Received: ${new Date(message.created_at).toLocaleString()}
                  </small>
                </article>
              `
            )
            .join("")}
        `;
      }

      if (latestClientContainer && latestMessage) {
        latestClientContainer.innerHTML = `
          <h3>${escapeHTML(latestMessage.name)}</h3>
          <p><strong>Email:</strong> ${escapeHTML(latestMessage.email)}</p>
          <p><strong>Subject:</strong> ${escapeHTML(
            latestMessage.subject || "No Subject"
          )}</p>
          <p>${escapeHTML(latestMessage.message)}</p>
          <small>
            Received: ${new Date(latestMessage.created_at).toLocaleString()}
          </small>
        `;
      }
    } catch (error) {
      console.error("Could not load messages:", error);

      if (clientsContainer) {
        clientsContainer.innerHTML = `
          <p class="error-message">
            Could not load client messages. Please try again.
          </p>
        `;
      }

      if (latestClientContainer) {
        latestClientContainer.innerHTML = `
          <p class="error-message">
            Could not load the latest client record.
          </p>
        `;
      }
    }
  }

  renderTasks(initialTasks);
  getClientMessages();
});