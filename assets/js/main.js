const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const enquiryForm = document.querySelector("#enquiry-form");

if (enquiryForm instanceof HTMLFormElement) {
  const statusMessage = enquiryForm.querySelector(".form-status");
  const submitButton = enquiryForm.querySelector("button[type=\"submit\"]");

  enquiryForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (enquiryForm.dataset.submitting === "true") {
      return;
    }

    enquiryForm.dataset.submitting = "true";
    enquiryForm.setAttribute("aria-busy", "true");

    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
    }

    if (statusMessage instanceof HTMLElement) {
      statusMessage.textContent = "Sending your enquiry...";
    }

    const formData = new FormData(enquiryForm);

    try {
      const response = await fetch(enquiryForm.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        if (statusMessage instanceof HTMLElement) {
          statusMessage.textContent = "Thanks! We\"ll be in touch shortly.";
        }
        enquiryForm.reset();
      } else {
        let errorMessage = "Sorry, something went wrong. Please call or email us.";

        try {
          const data = await response.json();
          if (data && Array.isArray(data.errors) && data.errors.length > 0) {
            errorMessage = data.errors.map((error) => error.message).join(" ");
          }
        } catch (error) {
          // Ignore JSON parse errors and use the default message.
        }

        if (statusMessage instanceof HTMLElement) {
          statusMessage.textContent = errorMessage;
        }
      }
    } catch (error) {
      if (statusMessage instanceof HTMLElement) {
        statusMessage.textContent = "Sorry, something went wrong. Please call or email us.";
      }
    } finally {
      enquiryForm.dataset.submitting = "false";
      enquiryForm.removeAttribute("aria-busy");

      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
      }
    }
  });
}
