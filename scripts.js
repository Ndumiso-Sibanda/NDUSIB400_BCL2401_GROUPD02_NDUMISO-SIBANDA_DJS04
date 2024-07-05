class bookPreview extends HTMLElement { 
  // Class declaration for creating a custom HTML element representing a book preview.

  static get observedAttributes() {
    // Returns an array of attributes to be observed for changes.
    return ["author", "image", "id", "title"];
  }

  constructor() {
    // Initializes the custom element.
    super(); // Calls the parent class constructor.
    this.attachShadow({ mode: "open" }); // Creates an open shadow DOM.
  }

  connectedCallback() {
    // Called when the element is added to the DOM.
    this.render(); // Renders the element's content.
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // Called when an observed attribute changes.
    if (oldValue !== newValue) {
      this.render(); // Re-renders the element if the attribute value changes.
    }
  }

  render() {
    // Renders the element's content based on its attributes.
    const author = this.getAttribute("author");
    const image = this.getAttribute("image");
    const id = this.getAttribute("id");
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
          display: none;
        }

        .preview:hover {
          background: rgba(var(--color-blue), 0.05);
        }

        .preview__image {
          width: 48px;
          height: 70px;
          object-fit: cover;
          background: grey;
          border-radius: 2px;
          box-shadow: 
            0px 2px 1px -1px rgba(0, 0, 0, 0.2),
            0px 1px 1px 0px rgba(0, 0, 0, 0.1), 
            0px 1px 3px 0px rgba(0, 0, 0, 0.1);
        }

        .preview__info {
          padding: 1rem;
        }

        .preview__title {
          margin: 0 0 0.5rem;
          font-weight: bold;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;  
          overflow: hidden;
          color: rgba(var(--color-dark), 0.8)
        }

        .preview__author {
          color: rgba(var(--color-dark), 0.4);
        }
      </style>

      <button class="preview" data-preview="${id}">
        <img
            class="preview__image"
            src="${image}"
        />

        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
      </button>
    `;
    this.shadowRoot.innerHTML = "";
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
}

import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js"; // Imports data from an external file.

let page = 1; // Keeps track of the current page number.
let matches = books; // Stores the filtered list of books.

function renderBooks(books) {
  // Renders the list of books.
  const fragment = document.createDocumentFragment();
  books.forEach((book) => {
    const element = createBookElement(book);
    fragment.appendChild(element);
  });
  document.querySelector("[data-list-items]").appendChild(fragment);
  showMore(); // Updates the "Show more" button.
}

customElements.define("book-preview", bookPreview); // Defines the custom element.

function createBookElement({ author, id, image, title }) {
  // Creates a new book-preview element.
  const element = document.createElement("book-preview");
  element.setAttribute("author", author);
  element.setAttribute("id", id);
  element.setAttribute("image", image);
  element.setAttribute("title", title);

  return element; // Returns the created element.
}

function renderGenres() {
  // Renders the list of genres.
  const genreHtml = document.createDocumentFragment();
  const firstGenreElement = createOptionElement("All Genre", "any");
  genreHtml.appendChild(firstGenreElement);

  for (const [id, name] of Object.entries(genres)) {
    const element = createOptionElement(name, id);
    genreHtml.appendChild(element);
  }

  document.querySelector("[data-search-genres]").appendChild(genreHtml);
}

function renderAuthors() {
  // Renders the list of authors.
  const authorsHtml = document.createDocumentFragment();
  const firstAuthorElement = createOptionElement("All authors", "any");
  authorsHtml.appendChild(firstAuthorElement);

  for (const [id, name] of Object.entries(authors)) {
    const element = createOptionElement(name, id);
    authorsHtml.appendChild(element);
  }

  document.querySelector("[data-search-authors]").appendChild(authorsHtml);
}

function createOptionElement(text, value) {
  // Creates an option element for a select input.
  const element = document.createElement("option");
  element.value = value;
  element.innerText = text;
  return element;
}
createOptionElement();

function applyTheme(theme) {
  // Applies the selected theme.
  const isDark = theme === "night";
  document.querySelector("[data-settings-theme]").value = theme;
  document.documentElement.style.setProperty(
    "--color-dark",
    isDark ? "255, 255, 255" : "10, 10, 20"
  );
  document.documentElement.style.setProperty(
    "--color-light",
    isDark ? "10, 10, 20" : "255, 255, 255"
  );
}

function filterBooks(books, filters) {
  // Filters the list of books based on the selected criteria.
  const filteredBooks = books.filter((book) => {
    let genreMatch = filters.genre === "any";

    for (const singleGenre of book.genres) {
      if (genreMatch) break;
      if (singleGenre === filters.genre) {
        genreMatch = true;
      }
    }

    return (
      (filters.title.trim() === "" ||
        book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
      (filters.author === "any" || book.author === filters.author) &&
      genreMatch
    );
  });

  return filteredBooks;
}

function showMore() {
  // Updates the "Show more" button.
  document.querySelector("[data-list-button]").disabled =
    matches.length - page * BOOKS_PER_PAGE < 1;

  document.querySelector("[data-list-button]").innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${
          matches.length - page * BOOKS_PER_PAGE > 0
            ? matches.length - page * BOOKS_PER_PAGE
            : 0
        })</span>`;
}

document.querySelector("[data-search-cancel]").addEventListener("click", () => {
  // Hides the search overlay when the search cancel button is clicked.
  document.querySelector("[data-search-overlay]").open = false;
});

document
  .querySelector("[data-settings-cancel]")
  .addEventListener("click", () => {
    // Hides the settings overlay when the settings cancel button is clicked.
    document.querySelector("[data-settings-overlay]").open = false;
  });

document.querySelector("[data-header-search]").addEventListener("click", () => {
  // Shows the search overlay and focuses the search input when the search button is clicked.
  document.querySelector("[data-search-overlay]").open = true;
  document.querySelector("[data-search-title]").focus();
});

document
  .querySelector("[data-header-settings]")
  .addEventListener("click", () => {
    // Shows the settings overlay when the settings button is clicked.
    document.querySelector("[data-settings-overlay]").open = true;
  });

document.querySelector("[data-list-close]").addEventListener("click", () => {
  // Hides the active list when the close button is clicked.
  document.querySelector("[data-list-active]").open = false;
});

document
  .querySelector("[data-settings-form]")
  .addEventListener("submit", (event) => {
    // Applies the selected theme when the settings form is submitted.
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);
    applyTheme(theme);
    document.querySelector("[data-settings-overlay]").open = false;
  });

document.querySelector("[data-search-form]").addEventListener("submit", (event) => {
  // Filters the books based on the search criteria when the search form is submitted.
  event.preventDefault();
  const formData = new FormData(event.target);
  const filters = Object.fromEntries(formData);
  const result = filterBooks(books, filters);

  page = 1;
  matches = result;

  if (result.length < 1) {
    document.querySelector("[data-list-items]").innerHTML = "";
    document.querySelector(
      "[data-list-message]"
    ).innerText = `No results found for: ${JSON.stringify(filters)}`;
  } else {
    document.querySelector("[data-list-message]").innerText = "";
    document.querySelector("[data-list-items]").innerHTML = "";
    renderBooks(result.slice(0, BOOKS_PER_PAGE));
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
  document.querySelector("[data-search-overlay]").open = false;
});

document.querySelector("[data-list-button]").addEventListener("click", () => {
  // Loads more books when the "Show more" button is clicked.
  const fragment = document.createDocumentFragment();
  const startIndex = page * BOOKS_PER_PAGE;
  const endIndex = (page + 1) * BOOKS_PER_PAGE;

  const extracted = matches.slice(startIndex, endIndex);
  extracted.forEach((book) => {
    const element = createBookElement(book);
    fragment.appendChild(element);
  });

  document.querySelector("[data-list-items]").appendChild(fragment);
  page += 1;
  showMore();
});

renderBooks(books.slice(0, BOOKS_PER_PAGE));
renderGenres();
renderAuthors();
applyTheme("day");

document.querySelector("[data-search-title]").value = "";
document.querySelector("[data-search-genres]").value = "any";
document.querySelector("[data-search-authors]").value = "any";
