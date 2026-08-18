// Simple welcome message
console.log("Cyber Security Website Loaded Successfully!");

// Highlight navigation when scrolling
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav a");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.clientHeight;

        if (scrollY >= sectionTop &&
            scrollY < sectionTop + sectionHeight) {

            current = section.getAttribute("id");
        }
    });

    navLinks.forEach(link => {

        link.style.color = "white";

        if (link.getAttribute("href") === "#" + current) {
            link.style.color = "#00d4ff";
        }
    });
});