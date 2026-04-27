// Import our custom CSS
import "../scss/styles.scss";
import Swiper from "swiper";
// Import all of Bootstrap's JS
import * as bootstrap from "bootstrap";
import { Autoplay, Navigation, Pagination, Scrollbar } from "swiper/modules";
import ApexCharts from "apexcharts";
import Typewriter from "typewriter-effect/dist/core";

const navIcon = document.querySelector(".nav-icon");
const nav = document.querySelector(".navigation");

navIcon &&
  navIcon.addEventListener("click", () => {
    navIcon.classList.toggle("open");
    nav.classList.toggle("opened");
  });

const navOverlay = document.querySelector(".nav-overlay");
navOverlay &&
  navOverlay.addEventListener("click", () => {
    nav.classList.remove("opened");
    navIcon.classList.remove("open");
  });

// color switcher

document.querySelector(".color-switcher-btn").addEventListener("click", () => {
  document.querySelector(".color-switcher").classList.toggle("opened");
});

// change color
const colorBtns = document.querySelectorAll(".color-btn");
colorBtns &&
  colorBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      let color = btn.getAttribute("data-color");
      document.documentElement.style.setProperty("--primary", color);
      localStorage.setItem("bg", color);
    }),
  );

// rtl
const ltrBtn = document.querySelector(".ltr");
const rtlBtn = document.querySelector(".rtl");

rtlBtn.addEventListener("click", () => {
  document.documentElement.dir = "rtl";
  localStorage.setItem("dir", "rtl");
  rtlBtn.classList.add("active");
  ltrBtn.classList.remove("active");
});

ltrBtn.addEventListener("click", () => {
  document.documentElement.dir = "ltr";
  localStorage.setItem("dir", "ltr");
  ltrBtn.classList.add("active");
  rtlBtn.classList.remove("active");
});

// grainded bg
const grain = document.getElementById("grain");
const grainToggleCheckbox = document.querySelector(".grained-checkbox");

grainToggleCheckbox.addEventListener("change", (e) => {
  if (e.target.checked) {
    grain.classList.add("grain");
  } else {
    grain.classList.remove("grain");
  }
});

const savedColor = localStorage.getItem("bg");
const savedDir = localStorage.getItem("dir");
if (savedColor) {
  console.log(savedColor);
  document.documentElement.style.setProperty("--primary", savedColor);
}
if (savedDir) {
  document.documentElement.dir = savedDir;
  if (savedDir == "rtl") {
    rtlBtn.classList.add("active");
    ltrBtn.classList.remove("active");
  } else {
    ltrBtn.classList.add("active");
    rtlBtn.classList.remove("active");
  }
}

// typewritter effect on hero
if (document.getElementById("typewriter")) {
  new Typewriter("#typewriter", {
    strings: ["Developer", "Designer"],
    autoStart: true,
    loop: true,
    delay: 200,
  });
}

// service swiper
const serviceSwiper = new Swiper(".service-swiper", {
  slidesPerView: 1,
  spaceBetween: 24,
  loop: true,
  autoplay: {
    delay: 5000,
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  modules: [Pagination, Autoplay],
  breakpoints: {
    768: {
      slidesPerView: 2,
      spaceBetween: 24,
    },
    1550: {
      slidesPerView: 3,
      spaceBetween: 24,
    },
  },
});

// testimonial swiper
const testiSwiper = new Swiper(".testimonial-swiper", {
  slidesPerView: 1,
  spaceBetween: 24,
  loop: true,
  autoplay: {
    delay: 5000,
  },
  scrollbar: {
    el: ".s-scrollbar",
    clickable: true,
    dragSize: "auto",
  },
  navigation: {
    nextEl: ".testi-next",
    prevEl: ".testi-prev",
  },
  modules: [Navigation, Autoplay, Scrollbar],
  breakpoints: {
    1024: {
      slidesPerView: 1.4,
      spaceBetween: 24,
    },
  },
});

document.addEventListener("DOMContentLoaded", () => {
  const designCharts = document.querySelectorAll(".design-chart");

  if (designCharts.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;

            const chart = new ApexCharts(el, {
              chart: {
                type: "radialBar",
                width: 250,
                height: 250,
                sparkline: {
                  enabled: false,
                },
                animations: {
                  enabled: true,
                  easing: "easeinout",
                  speed: 2000,
                  animateGradually: {
                    enabled: true,
                    delay: 150,
                  },
                  dynamicAnimation: {
                    enabled: true,
                    speed: 350,
                  },
                },
              },
              series: ["85"],
              legend: {
                show: false,
              },
              stroke: {
                lineCap: "butt",
              },
              colors: ["#000000"],
              plotOptions: {
                radialBar: {
                  dataLabels: {
                    value: {
                      show: false,
                    },
                    name: {
                      offsetY: 15,
                      fontSize: "44px",
                    },
                  },
                  hollow: {
                    size: "80%",
                  },
                },
              },
              labels: ["85%"],
              grid: {
                padding: {
                  top: -16,
                  bottom: -20,
                },
              },
            });

            chart.render();

            // Stop observing this element after rendering
            observer.unobserve(el);
          }
        });
      },
      {
        threshold: 0.7, // Trigger when at least 10% of the chart is visible
      },
    );

    designCharts.forEach((el) => {
      observer.observe(el);
    });
  }

  //   branding charts
  const brandingCharts = document.querySelectorAll(".branding-chart");

  if (brandingCharts.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;

            const chart = new ApexCharts(el, {
              chart: {
                type: "radialBar",
                width: 250,
                height: 250,
                sparkline: {
                  enabled: false,
                },
                animations: {
                  enabled: true,
                  easing: "easeinout",
                  speed: 2000,
                  animateGradually: {
                    enabled: true,
                    delay: 150,
                  },
                  dynamicAnimation: {
                    enabled: true,
                    speed: 350,
                  },
                },
              },
              series: ["85"],
              legend: {
                show: false,
              },
              stroke: {
                lineCap: "butt",
              },
              colors: ["#000000"],
              plotOptions: {
                radialBar: {
                  dataLabels: {
                    value: {
                      show: false,
                    },
                    name: {
                      offsetY: 15,
                      fontSize: "44px",
                    },
                  },
                  hollow: {
                    size: "80%",
                  },
                },
              },
              labels: ["85%"],
              grid: {
                padding: {
                  top: -16,
                  bottom: -20,
                },
              },
            });

            chart.render();

            // Stop observing this element after rendering
            observer.unobserve(el);
          }
        });
      },
      {
        threshold: 0.7, // Trigger when at least 10% of the chart is visible
      },
    );

    brandingCharts.forEach((el) => {
      observer.observe(el);
    });
  }

  // ecommerce charts
  const ecommerceCharts = document.querySelectorAll(".ecommerce-chart");

  if (ecommerceCharts.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;

            const chart = new ApexCharts(el, {
              chart: {
                type: "radialBar",
                width: 250,
                height: 250,
                sparkline: {
                  enabled: false,
                },
                animations: {
                  enabled: true,
                  easing: "easeinout",
                  speed: 2000,
                  animateGradually: {
                    enabled: true,
                    delay: 150,
                  },
                  dynamicAnimation: {
                    enabled: true,
                    speed: 350,
                  },
                },
              },
              series: ["80"],
              legend: {
                show: false,
              },
              stroke: {
                lineCap: "butt",
              },
              colors: ["#000000"],
              plotOptions: {
                radialBar: {
                  dataLabels: {
                    value: {
                      show: false,
                    },
                    name: {
                      offsetY: 15,
                      fontSize: "44px",
                    },
                  },
                  hollow: {
                    size: "80%",
                  },
                },
              },
              labels: ["80%"],
              grid: {
                padding: {
                  top: -16,
                  bottom: -20,
                },
              },
            });

            chart.render();

            // Stop observing this element after rendering
            observer.unobserve(el);
          }
        });
      },
      {
        threshold: 0.7, // Trigger when at least 10% of the chart is visible
      },
    );

    ecommerceCharts.forEach((el) => {
      observer.observe(el);
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const skills = document.querySelectorAll(".skill");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const progressBar = entry.target.querySelector(".progress-bar");
          const width = progressBar.getAttribute("data-width");
          progressBar.style.width = width;
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.5, // Trigger when at least 50% of the element is visible
    },
  );

  skills.forEach((skill) => {
    observer.observe(skill);
  });
});

import shuffleLetters from "shuffle-letters";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

function handleClassChange(mutationsList, observer) {
  mutationsList.forEach((mutation) => {
    if (mutation.type === "attributes" && mutation.attributeName === "class") {
      const target = mutation.target;
      if (target.classList.contains("active")) {
        const textElement = target.querySelector(".text");
        if (textElement) {
          // shuffleLetters(textElement, { iterations: 5 });
        }
      }
    }
  });
}

// Select all the <a> elements you want to observe
const links = document.querySelectorAll(".navigation ul li a");

// Create a MutationObserver instance
const observer = new MutationObserver(handleClassChange);

// Configuration for the observer (observe changes to attributes)
const config = { attributes: true };

// Observe each link for attribute changes
links.forEach((link) => {
  observer.observe(link, config);
});

// close menu on link click
links.forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("opened");
    navIcon.classList.remove("open");
  });
});

// // shuffle on hover
// links.forEach((link) => {
//   link.addEventListener("mouseover", () => {
//     link.classList.add("active");
//   });
//   link.addEventListener("mouseout", () => {
//     link.classList.remove("active");
//   });
// });

// animations

gsap.registerPlugin(ScrollTrigger);

if (document.getElementById("about_me")) {
  // gsap.from(".hero-content", { x: -400, duration: 2, scale: 0, opacity: 0 });
  if (savedDir == "rtl") {
    gsap.from(".nav-link", { duration: 0.8, delay: 0.5, opacity: 0, scale: 0, stagger: 0.15 });
  } else {
    gsap.from(".nav-link", { duration: 0.8, delay: 0.5, opacity: 0, scale: 0, stagger: 0.1 });
  }
  gsap.from(".img-wrapper", { duration: 1.5, scale: 1.5, ease: "back", delay: 0.3, opacity: 0 });
  gsap.from(".work-btn", { duration: 1.2, scale: 0, opacity: 0, ease: "bounce" });
  gsap.from(".contact-btn", { duration: 1.2, scale: 0, opacity: 0, ease: "bounce" });

  if (savedDir != "rtl") {
    const freelancer = new SplitType(".freelancer").chars;
    const desc = new SplitType(".description").chars;
    gsap.from(freelancer, { duration: 1.5, rotateX: 180, opacity: 0, ease: "bounce", stagger: 0.05 });
    gsap.from(desc, { duration: 1, rotateY: 180, stagger: 0.05 });
  } else {
    gsap.from(".freelancer", { duration: 0.8, y: 200, scale: 0 });
    gsap.from(".description", { duration: 0.8, y: 200, scale: 0 });
  }

  gsap.to(".navigation", { "--height": "100%", duration: 1, ease: "power1.inOut" });

  // about section
  gsap.from(".about-desc", {
    opacity: 0,
    duration: 0.8,
    ease: "back",
    scrollTrigger: {
      trigger: ".about-desc",
    },
  });

  gsap.from(".experience-card", {
    opacity: 0,
    scale: 0,
    ease: "elastic",
    duration: 1,
    scrollTrigger: {
      trigger: ".experience-card",
      // scrub: true,
      start: "top 50%",
    },
  });

  // services section
  gsap.from(".service-card", {
    y: 500,
    stagger: 0.2,
    scale: 0,
    duration: 1.5,
    scrollTrigger: {
      trigger: ".services",
      start: "top 60%",
      end: "top 20%",
    },
  });

  gsap.from(".developer-row", {
    opacity: 0,
    scale: 0,
    duration: 1.5,
    scrollTrigger: {
      trigger: ".design-row",
      start: "top 60%",
      end: "top 20%",
    },
  });

  // fun fact
  gsap.from(".fun-fact", {
    scale: 0,
    duration: 1,
    stagger: 0.2,
    scrollTrigger: {
      trigger: ".fun-fact",
    },
  });

  // experience
  gsap.from(".experience-item", {
    opacity: 0,
    duration: 1,
    stagger: 0.5,
    scale: 0,
    scrollTrigger: {
      trigger: ".experience-item",
    },
  });

  gsap.utils.toArray(".experience-item").forEach((item) => {
    gsap.to(item, {
      "--item-height": "100%",
      stagger: 0.5,
      delay: 0.5,
      scrollTrigger: {
        trigger: item,
        start: "top 80%",
        end: "top 20%",
      },
    });
  });

  gsap.to(".experience-wrapper", {
    duration: 2,
    ease: "back",
    delay: 0.5,
    "--height": "100%",
    scrollTrigger: {
      trigger: ".experience-wrapper",
    },
  });

  // services section
  gsap.from(".single-project", {
    opacity: 0,
    stagger: 0.2,
    scale: 0,
    scrollTrigger: {
      trigger: ".project-list",
      start: "top 60%",
      end: "top 20%",
    },
  });

  // how i work
  gsap.from(".process", {
    stagger: 0.15,
    scale: 0,
    duration: 2.8,
    ease: "elastic",
    scrollTrigger: {
      trigger: ".process-list",
      start: "top 60%",
      end: "top 20%",
    },
  });

  // testimonials
  gsap.from(".testimonial-card", {
    opacity: 0,
    scale: 0,
    duration: 1.2,
    stagger: 0.2,
    scrollTrigger: {
      trigger: ".testimonial-card",
    },
  });

  // contacct
  gsap.from(".contact-item", {
    scale: 0,
    duration: 0.8,
    ease: "back",
    scrollTrigger: {
      trigger: ".contact-items",
    },
  });

  gsap.from(".more-info", {
    scale: 0,
    duration: 1.2,
    ease: "elastic",
    delay: 0.5,
    scrollTrigger: {
      trigger: ".more-info",
    },
  });
  gsap.from(".download-cv", {
    scale: 0,
    duration: 2,
    ease: "elastic",
    delay: 0.3,
    scrollTrigger: {
      trigger: ".download-cv",
    },
  });

  // title overlay
  document.querySelectorAll(".section").forEach((section) => {
    let text = section.querySelector(".section-title-overlay-text");

    gsap.fromTo(
      text,
      { y: "50%" },
      {
        y: "-50%",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  });

  gsap.utils.toArray(".section-title").forEach((title) => {
    gsap.to(title, {
      "--height": "100%",
      delay: 0.5,
      scrollTrigger: {
        trigger: title,
        start: "top 80%",
        // end: "top 30%",
        // scrub: true,
        // toggleActions: "play none none reverse",
      },
    });
  });

  // section titles
  gsap.utils.toArray(".section-title").forEach((title) => {
    gsap.from(title, {
      opacity: 0,
      scale: 0,
      scrollTrigger: {
        trigger: title,
      },
    });
  });
}

// year
document.getElementById("year").innerHTML = new Date().getFullYear();

import emailjs from "@emailjs/browser";
import GLightbox from "glightbox";


document.addEventListener("mousemove", function (event) {
  const numberOutlineOne = document.querySelectorAll(".number-outline-one");
  const numberOutlineTwo = document.querySelectorAll(".number-outline-two");
  const offsetX = (event.clientX - window.innerWidth / 2) * 0.01;
  const offsetY = (event.clientY - window.innerHeight / 2) * 0.01;

  numberOutlineOne.forEach((element) => {
    element.style.transform = `translate(${offsetX / 2}px, ${offsetY / 2}px)`;
  });

  numberOutlineTwo.forEach((element) => {
    element.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  });
});

// show project details
const projects = document.querySelectorAll(".single-project");
if (projects.length) {
  projects.forEach((project) => {
    project.addEventListener("click", function () {
      const img = project.getAttribute("data-img");
      const title = project.getAttribute("data-title");
      const ImgTag = document.querySelector(".project-details-img");
      const TitleTag = document.getElementById("project-title");
      ImgTag.src = `./assets/images/${img}.png`;
      TitleTag.innerText = title;
    });
  });
}

// show blogs
const topics = document.querySelectorAll(".blog-topic");
if (topics.length) {
  topics.forEach((topic) => {
    topic.addEventListener("click", function () {
      if (this.classList.contains("active")) {
        // If clicking an active topic, just remove its active class
        this.classList.remove("active");
      } else {
        // Otherwise, remove active from all and add to this one
        topics.forEach((t) => t.classList.remove("active"));
        this.classList.add("active");
      }
    });
  });
}

// show year in footer
const year = document.getElementById("year");
if (year) {
  year.innerText = new Date().getFullYear();
}

// youtube video popup

if (document.querySelector(".youtube")) {
  GLightbox({ selector: ".youtube" });
}


// contact form
(function () {

  // add public key here
  const PUBLIC_KEY=''
  // https://dashboard.emailjs.com/admin/account  
  emailjs.init(PUBLIC_KEY);
})();
const submitBtn = document.getElementById("submit-btn");
window.onload = function () {
  const contactForm = document.getElementById("contact-form");
  contactForm &&
    contactForm.addEventListener("submit", function (event) {
    
      event.preventDefault();

      // add template id and service id here

      const SERVICE_ID=""
      const TEMPLATE_ID=""
      if(!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY){
        alert("Please add your service id and template id");
        return;
      }
      submitBtn.innerText = "Sending...";
      emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, this).then(
        function () {
          console.log("SUCCESS!");
          contactForm.reset();
          submitBtn.innerText = "Success";
          setTimeout(function () {
            submitBtn.innerHTML = `Submit`;
          }, 3000);
        },
        function (error) {
          console.log("FAILED...", error);
        },
      );
    });
};