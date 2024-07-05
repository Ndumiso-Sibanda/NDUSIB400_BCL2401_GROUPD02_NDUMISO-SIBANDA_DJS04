
class bookPreview extends HTMLElement { //This is a declaration of a class that creates an object. Extending makes it a subclass of the HTML file.
  static get observedAttributes() {//This fetches values when a property is accessed.
    return ["author", "image", "id", "title"];//This array is the scope that will be observed for changes
  }

  constructor() { //initializes an object created with a class.
    super(); //Calls the constructor of the parent class HTMLElement
    this.attachShadow({ mode: "open" }); //creates an open shadow DOM, providing encapsulation and scoped styling for the element's internal content
  }

  connectedCallback() { //Ensures BookPreview is rendered when it is added to the DOM.
    this.render();
  }
// If the new value is different from the old value, it calls the render method to update the element's content.
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }
//This ensures that the displayed content is always in sync with the element's state
  render() {
    const author = this.getAttribute("author");
    const image = this.getAttribute("image");
    const id = this.getAttribute("id");
    const title = this.getAttribute("title");

//Thsi block Initializes a new <template> element, specifies the HTML and CSS for the component and ensures the component's shadow DOM is updated with the latest content.
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


import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js"; //Fetches data from the data file.

let page = 1; //This variable keeps track of the page number.
let matches = books; //To store the filtered book list.

//Function that makes the books available so the element below can display them.
function renderBooks(books) {
  const fragment = document.createDocumentFragment();
  books.forEach((book) => {
    //Loops through the book list and creates a book element for each book
    const element = createBookElement(book);
    fragment.appendChild(element);
  });
  document.querySelector("[data-list-items]").appendChild(fragment);
  showMore(); //Calls this function to update the "Show more" button.
}

//Web Component class call. It ensures that whenever <book-preview> elements are used in the HTML, instances of the BookPreview class will be created to manage those elements.
customElements.define("book-preview", bookPreview);

//Creates element to display the books on screen as a button with and image, title and author.
//The purpose of this function is to create a new book-preview custom element and configure it with the provided attributes.
function createBookElement({ author, id, image, title }) {
  const element = document.createElement("book-preview");
  element.setAttribute("author", author);
  element.setAttribute("id", id);
  element.setAttribute("image", image);
  element.setAttribute("title", title);


  return element; //Return to provide the created element back to the caller for flexible use
}

//Gives out the list of Genres

function renderGenres() {
  const genreHtml = document.createDocumentFragment();
  const firstGenreElement = createOptionElement("All Genre", "any");
  genreHtml.appendChild(firstGenreElement);

  for (const [id, name] of Object.entries(genres)) {
    const element = createOptionElement(name, id);
    genreHtml.appendChild(element);
  }

  document.querySelector("[data-search-genres]").appendChild(genreHtml);
}

//Provides the list of Autors
function renderAuthors() {
  const authorsHtml = document.createDocumentFragment();
  const firstAuthorElement = createOptionElement("All authors", "any");
  authorsHtml.appendChild(firstAuthorElement);

  for (const [id, name] of Object.entries(authors)) {
    const element = createOptionElement(name, id);
    authorsHtml.appendChild(element);
  }

  document.querySelector("[data-search-authors]").appendChild(authorsHtml);
}
//Dropdown options whe the search button is opened
function createOptionElement(text, value) {
  const element = document.createElement("option");
  element.value = value;
  element.innerText = text;
  return element;
}
createOptionElement();

//Theme setting simplified into ternery operators

function applyTheme(theme) {
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

//Filters that group the books according to title, genre and author to enable to user the search them respectively.

function filterBooks(books, filters) {
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

//Show more button function

function showMore() {
  document.querySelector("[data-list-button]").disabled =
    matches.length - page * BOOKS_PER_PAGE < 1;//Enables or disables the "Show more" button based on whether there are more books to display.

//Updates the inner HTML of the "Show more" button to display the number of remaining books.
  document.querySelector("[data-list-button]").innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${
          matches.length - page * BOOKS_PER_PAGE > 0
            ? matches.length - page * BOOKS_PER_PAGE
            : 0
        })</span>`;
}



//Event handlers

// Listens out for a "click" on the search cancel button and hides the search overlay
document.querySelector("[data-search-cancel]").addEventListener("click", () => {
  document.querySelector("[data-search-overlay]").open = false;
});
// Listens out for a "click" on the settings cancel button and hides the settings overlay
document
  .querySelector("[data-settings-cancel]")
  .addEventListener("click", () => {
    document.querySelector("[data-settings-overlay]").open = false;
  });
// Listens out for a "click" on the search button in the header then shows the search overlay and sets the focus to the search input field
document.querySelector("[data-header-search]").addEventListener("click", () => {
  document.querySelector("[data-search-overlay]").open = true;
  document.querySelector("[data-search-title]").focus();
});
// Listens out for a "click" on the settings button in the header and shows the settings overlay
document
  .querySelector("[data-header-settings]")
  .addEventListener("click", () => {
    document.querySelector("[data-settings-overlay]").open = true;
  });
// Listens out for a "click" on the close button in the list and then hides the active list
document.querySelector("[data-list-close]").addEventListener("click", () => {
  document.querySelector("[data-list-active]").open = false;
});

//Theme function application: 
document
  .querySelector("[data-settings-form]")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);
    applyTheme(theme);
    document.querySelector("[data-settings-overlay]").open = false; 
  });



//Search submission

document
  .querySelector("[data-search-form]")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    const result = filterBooks(books, filters);

    page = 1;
    matches = result;

    if (result.length < 1) {
      document
        .querySelector("[data-list-message]")
        .classList.add("list__message_show");
    } else {
      document
        .querySelector("[data-list-message]")
        .classList.remove("list__message_show");
    }

    document.querySelector("[data-list-items]").innerHTML = "";
    renderBooks(matches.slice(0, BOOKS_PER_PAGE));

    window.scrollTo({ top: 0, behavior: "smooth" });
    document.querySelector("[data-search-overlay]").open = false;
  });

//Show more button per page

document.querySelector("[data-list-button]").addEventListener("click", () => {
  const fragment = document.createDocumentFragment();
  renderBooks(
    matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE)
  );
  document.querySelector("[data-list-items]").appendChild(fragment);
  page += 1;
  showMore();
});

document
  .querySelector("[data-list-items]")
  .addEventListener("click", (event) => {
    const pathArray = Array.from(event.path || event.composedPath());
    let active = null;

    for (const node of pathArray) {
      if (active) break;

      if (node?.dataset?.preview) {
        let result = null;

        for (const singleBook of books) {
          if (result) break;
          if (singleBook.id === node?.dataset?.preview) result = singleBook;
        }

        active = result;
      }
    }

    if (active) {
      document.querySelector("[data-list-active]").open = true;
      document.querySelector("[data-list-blur]").src = active.image;
      document.querySelector("[data-list-image]").src = active.image;
      document.querySelector("[data-list-title]").innerText = active.title;
      document.querySelector("[data-list-subtitle]").innerText = `${
        authors[active.author]
      } (${new Date(active.published).getFullYear()})`;
      document.querySelector("[data-list-description]").innerText =
        active.description;
    }
  });

//Function calls
renderBooks(matches.slice(0, BOOKS_PER_PAGE));
renderGenres();
renderAuthors();

//User prefered theme according to device settings.
if (
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
) {
  applyTheme("night");
} else {
  applyTheme("day");
}
