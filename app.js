const colorfulThemes = [
  {
    '--primary-bg': '#1a1a2e',
    '--secondary-bg': '#16213e',
    '--primary-text': '#e94560',
    '--secondary-text': '#f0e5d8',
    '--accent-color': '#0f3460',
    '--border-color': '#e94560',
    '--nav-link-color': '#f0e5d8',
  },
  {
    '--primary-bg': '#4a4a4a',
    '--secondary-bg': '#3d3d3d',
    '--primary-text': '#ff9a00',
    '--secondary-text': '#f5f5f5',
    '--accent-color': '#ff6d00',
    '--border-color': '#ff9a00',
    '--nav-link-color': '#f5f5f5',
  },
  {
    '--primary-bg': '#004d40',
    '--secondary-bg': '#00796b',
    '--primary-text': '#b2dfdb',
    '--secondary-text': '#e0f2f1',
    '--accent-color': '#80cbc4',
    '--border-color': '#4db6ac',
    '--nav-link-color': '#002d27',
  },
  {
    '--primary-bg': '#3e2723',
    '--secondary-bg': '#4e342e',
    '--primary-text': '#d7ccc8',
    '--secondary-text': '#a1887f',
    '--accent-color': '#8d6e63',
    '--border-color': '#5d4037',
    '--nav-link-color': '#d7ccc8',
  },
];

function setTheme(theme) {
  if (theme === 'colorful') {
    const randomTheme = colorfulThemes[Math.floor(Math.random() * colorfulThemes.length)];
    for (const color in randomTheme) {
      document.body.style.setProperty(color, randomTheme[color]);
    }
    localStorage.setItem('theme', 'colorful');
    localStorage.setItem('colorfulTheme', JSON.stringify(randomTheme));
    document.body.classList.remove('light-theme', 'dark-theme');

  } else {
    document.body.removeAttribute('style');
    document.body.classList.remove('light-theme', 'dark-theme', 'colorful-theme');
    document.body.classList.add(theme + '-theme');
    localStorage.setItem('theme', theme);
    localStorage.removeItem('colorfulTheme');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'colorful') {
    const savedColorfulTheme = JSON.parse(localStorage.getItem('colorfulTheme'));
    if (savedColorfulTheme) {
      for (const color in savedColorfulTheme) {
        document.body.style.setProperty(color, savedColorfulTheme[color]);
      }
    }
  } else {
    setTheme(savedTheme);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  });

  const targets = document.querySelectorAll('.fade-in');
  targets.forEach(target => {
    observer.observe(target);
  });

  const title = document.querySelector('.header__title');
  const subtitle = document.querySelector('.header__subtitle');

  setTimeout(() => {
    typeAnimation(title, "Manuel Rosa", 100);
  }, 500);

  setTimeout(() => {
    typeAnimation(subtitle, "Full Stack Developer", 100);
  }, 2000);
});

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

function filterProjects(category) {
  const projects = document.querySelectorAll('.project');
  const filterButtons = document.querySelectorAll('.project-filter__button');

  // Set active button
  filterButtons.forEach(button => {
    if (button.dataset.filter === category) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });

  // Filter projects
  projects.forEach(project => {
    const projectCategory = project.dataset.category;
    if (category === 'all' || category === projectCategory) {
      project.style.display = 'flex';
    } else {
      project.style.display = 'none';
    }
  });
}

function typeAnimation(element, text, speed) {
  let i = 0;
  element.innerHTML = "";
  element.style.visibility = "visible";

  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }

  type();
}
