// Define the BookPreview class
class BookPreview extends HTMLElement {
  static get observedAttributes() {
   return ["author", "id", "image", "title"];
  }
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
   }
  
   connectedCallback() {
    this.render();
   }
  
   attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
     this.render();
    }
   }
   render() {
    const author = this.getAttribute("author");
    const id = this.getAttribute("id");
    const image = this.getAttribute("image");
    const title = this.getAttribute("title");
  
    const template = document.createElement("template");
    template.innerHTML = `
          <style>
              .preview {
                  border-width: 0;
                  width: 100%;
                  font-family: Roboto, sans-serif;
                  padding: 0.5rem 1rem;
                  display: flex;
                  align-items: center;
                  cursor: pointer;
                  text-align: left;
                  border-radius: 8px;
                  border: 1px solid rgba(var(--color-dark), 0.15);
                  background: rgba(var(--color-light), 1);
              }
              @media (min-width: 60rem) {
                .preview {
                    padding: 1rem;
                }
            }
        
            .preview_hidden {
              dispaly :none;
            }
           .preview:hover {
            background:rgba(var(--color-blue),o,05);
           }
           .preview__image {
             width: 48px;
             height:70px;
             object-fit:cover;
             background:grey;
             boarder-radius:2px;
             box-shadow:0px 2px 1px -1px rgba(0,0,0,0.2)
             0px 1px 1px 0px rgba(0, 0, 0, 0.1), 
             0px 1px 3px 0px rgba(0, 0, 0, 0.1);
           }
           .preview__info {
            padding: 1rem;
        }
      
        .preview__tittle{
         margin:0 0 0.5rem;
         font-weight: bold
         display: -webkit-box;
         -webkit-line-clamp: 2;
         -webkit-box-orient: vertical;
         overflow: hidden;
         color:rgba(var(--color-dark), 0.8);
        }



        }
  
  
  import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";

// Initialize global variables

let page = 1;
let matches = books;

//Utility function to create an element with innerHTML

function createBookElement(book) {
 const { author, id, image, title } = book;
 const element = document.createElement("button");
 element.classList = "preview";
 element.setAttribute("data-preview", id);

 element.innerHTML = `
        <img class="preview__image" src="${image}" />
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `;
 return element;
}
//function that populates Genres

function populateGenres() {
 const genreSelect = document.querySelector("[data-search-genres]");
 genreSelect.innerHTML = `<option value="any">All Genres</option>`;
 for (const [id, name] of Object.entries(genres)) {
  const option = document.createElement("option");
  option.value = id;
  option.innerText = name;
  genreSelect.appendChild(option);
 }
}
//function that populates Authors

function populateAuthors() {
 const authorSelect = document.querySelector("[data-search-authors]");
 authorSelect.innerHTML = `<option value="any">All Authors</option>`;
 for (const [id, name] of Object.entries(authors)) {
  const option = document.createElement("option");
  option.value = id;
  option.innerText = name;
  authorSelect.appendChild(option);
 }
}
// Function to handle theme settings

const themeValue =
 window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
  ? "night"
  : "day";
function updateTheme(theme) {
 const isNight = theme === "night";
 document.documentElement.style.setProperty(
  "--color-dark",
  isNight ? "255, 255, 255" : "10, 10, 20"
 );
 document.documentElement.style.setProperty(
  "--color-light",
  isNight ? "10, 10, 20" : "255, 255, 255"
 );
}
// Function to initialize the page with default values

function updateListButton() {
 const remaining = Math.max(matches.length - page * BOOKS_PER_PAGE, 0);
 const button = document.querySelector("[data-list-button]");
 button.innerText = `Show more (${remaining})`;
 button.disabled = remaining <= 0;
}
//function that renders books

function renderBooks() {
 const fragment = document.createDocumentFragment();
 const startIndex = (page - 1) * BOOKS_PER_PAGE;
 const endIndex = page * BOOKS_PER_PAGE;
 document.querySelector("[data-list-items]").innerHTML = "";
 for (let i = startIndex; i < endIndex && i < matches.length; i++) {
  const book = matches[i];
  const element = createBookElement(book);
  fragment.appendChild(element);
 }

 document.querySelector("[data-list-items]").appendChild(fragment);
}
//function that handles show more button

function handleShowMore() {
 page += 1;
 updateListButton();
 renderBooks();
}

function handleBookClick(event) {
 const target = event.target;
 const previewId = target.closest(".preview")?.getAttribute("data-preview");
 if (!previewId) return;
 const activeBook = books.find((book) => book.id === previewId);
 if (!activeBook) return;
 document.querySelector("[data-list-active]").open = true;

 document.querySelector("[data-list-blur]").src = activeBook.image;
 document.querySelector("[data-list-image]").src = activeBook.image;
 document.querySelector("[data-list-title]").innerText = activeBook.title;
 document.querySelector("[data-list-subtitle]").innerText = `${
  authors[activeBook.author]
 } (${new Date(activeBook.published).getFullYear()})`;
 document.querySelector("[data-list-description]").innerText =
  activeBook.description;
}
//event listeners setup

document.querySelector("[data-search-cancel]").addEventListener("click", () => {
 document.querySelector("[data-search-overlay]").open = false;
});

document
 .querySelector("[data-settings-cancel]")
 .addEventListener("click", () => {
  document.querySelector("[data-settings-overlay]").open = false;
 });

document.querySelector("[data-header-search]").addEventListener("click", () => {
 document.querySelector("[data-search-overlay]").open = true;
 document.querySelector("[data-search-title]").focus();
});

document
 .querySelector("[data-header-settings]")
 .addEventListener("click", () => {
  document.querySelector("[data-settings-overlay]").open = true;
 });

document.querySelector("[data-list-close]").addEventListener("click", () => {
 document.querySelector("[data-list-active]").open = false;
});

document
 .querySelector("[data-settings-form]")
 .addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const { theme } = Object.fromEntries(formData);
  updateTheme(theme);
  document.querySelector("[data-settings-theme]").value = theme;
 });

// Function to filter books based on search critiria

document
 .querySelector("[data-search-form]")
 .addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const filters = Object.fromEntries(formData);
  matches = books.filter(
   (book) =>
    (filters.title.trim() === "" ||
     book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
    (filters.author === "any" || book.author === filters.author) &&
    (filters.genre === "any" || book.genres.includes(filters.genre))
  );
  page = 1;
  renderBooks();
  updateListButton();
  document.querySelector("[data-search-overlay]").open = false;
 });

document
 .querySelector("[data-list-button]")
 .addEventListener("click", handleShowMore);
document
 .querySelector("[data-list-items]")
 .addEventListener("click", handleBookClick);

populateGenres();
populateAuthors();
updateTheme();
renderBooks();
updateListButton();
