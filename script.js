document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initContactForm();
});

/* ==============================
   Navigation
============================== */

function initNavigation() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a");

  if (!sections.length || !navLinks.length) return;

  function updateActiveLink() {
    const scrollPosition = window.scrollY + 160;
    let currentSection = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionBottom
      ) {
        currentSection = section.id;
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === `#${currentSection}`
      );
    });
  }

  window.addEventListener("scroll", updateActiveLink);
  updateActiveLink();

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || !targetId.startsWith("#")) return;

      const target = document.querySelector(targetId);

      if (target) {
        event.preventDefault();
        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });
}

/* ==============================
   Contact Form
============================== */

function initContactForm() {
  const form = document.getElementById("portfolio-contact-form");
  const submitButton = document.getElementById("submit-btn");
  const statusMessage = document.getElementById("form-response-status");

  if (!form || !submitButton || !statusMessage) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      subject: document.getElementById("subject").value.trim(),
      message: document.getElementById("message").value.trim()
    };

    if (!formData.name || !formData.email || !formData.message) {
      showStatus(
        "Please complete all required fields.",
        "error"
      );
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
    showStatus("Sending your message...", "info");

    try {
      const response = await fetch("https://annet-irungu-portfolio.netlify.app/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showStatus(
          "Message sent successfully. I will get back to you soon.",
          "success"
        );
        form.reset();
      } else {
        showStatus(
          result.message ||
          result.error ||
          "Unable to send your message.",
          "error"
        );
      }
    } catch (error) {
      console.error("Contact form error:", error);

      showStatus(
        "Unable to connect to the server. Please email me directly.",
        "error"
      );
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Send Message";
    }
  });

  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
  }
}
/* ==========================================================================
   Project Card Links Interaction
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const projectLinks = document.querySelectorAll('.project-links a');

  projectLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');

      // Ensure local subfolder links open smoothly in new tab if target isn't already set
      if (href && href.startsWith('./')) {
        if (!link.hasAttribute('target')) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      }
    });
  });
});