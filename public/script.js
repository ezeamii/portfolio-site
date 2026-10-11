const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const progressBar = document.getElementById("progressBar");
const year = document.getElementById("year");

year.textContent = new Date().getFullYear();

menuToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});

navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

window.addEventListener("scroll", () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progressBar.style.width = `${Math.min(100, progress)}%`;
}, { passive: true });

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));


const contactForm = document.getElementById("contactForm");
const sendButton = document.getElementById("sendButton");
const sendButtonText = document.getElementById("sendButtonText");
const formStatus = document.getElementById("formStatus");

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  sendButton.disabled = true;
  sendButtonText.textContent = "Sending...";
  formStatus.textContent = "";
  formStatus.className = "form-status";

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      body: new FormData(contactForm),
      headers: {
        Accept: "application/json"
      }
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result.errors
        ? result.errors.map(error => error.message).join(" ")
        : "Unable to send your message. Please try again.";

      throw new Error(errorMessage);
    }

    formStatus.textContent =
      "Message sent successfully! Thank you for reaching out.";
    formStatus.classList.add("success");
    contactForm.reset();

  } catch (error) {
    formStatus.textContent =
      error.message || "Something went wrong. Please try again.";
    formStatus.classList.add("error");

  } finally {
    sendButton.disabled = false;
    sendButtonText.textContent = "Send message";
  }
});
