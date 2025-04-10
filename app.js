function openMenu() {
  const body = document.body;

  console.log(body);

  body.classList.add("open");
}

function closeMenu() {
  const body = document.body;

  console.log(body);

  body.classList.remove("open");
}

//template_qfldt3q
// service_k7h02th
// 9JmTc-GfRoLgQ2oyI

async function sendEmail(event) {
  event.preventDefault();
  const body = document.body;
  const loading = document.querySelector(".contact__form__loading");
  const form = document.querySelector(".contact__form");

  try {
    //   Loading state
    loading.classList.remove("hidden");
    console.log("loading");

    // Sending email
    await emailjs.sendForm("service_k7h02th", "template_qfldt3q", event.target);

    //   Success state
    form.reset();
    loading.classList.add("hidden");
    body.classList.add("success-open");
    setTimeout(() => {
      body.classList.remove("success-open");
    }, 5000);
    console.log("hey the email has been sent");
  } catch {
    loading.classList.add("hidden");
    alert(
      "An error has occured. Please try again later or contact me at me@rosafi.io"
    );
  }
}
