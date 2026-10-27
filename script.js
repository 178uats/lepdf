const pdfInput = document.getElementById('pdfInput');
const dropZone = document.getElementById('dropZone');
const chooseButton = document.getElementById('chooseButton');
const emptyState = document.getElementById('emptyState');
const pdfViewer = document.getElementById('pdfViewer');
const documentName = document.getElementById('documentName');
const downloadLink = document.getElementById('downloadLink');
const libraryList = document.getElementById('libraryList');
const libraryEmpty = document.getElementById('libraryEmpty');
const bookCount = document.getElementById('bookCount');
const reader = document.getElementById('reader');
const fullscreenButton = document.getElementById('fullscreenButton');

let books = [];
let activeBookId = null;

function openBook(file) {
  if (!file || (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf'))) return;

  const existingBook = books.find((book) => book.name === file.name && book.file === file);
  const book = existingBook || {
    id: `${Date.now()}-${Math.random()}`,
    name: file.name,
    file,
    url: URL.createObjectURL(file)
  };

  if (!existingBook) books.unshift(book);
  activeBookId = book.id;
  pdfViewer.src = `${book.url}#toolbar=1&navpanes=0&view=FitH`;
  pdfViewer.hidden = false;
  emptyState.hidden = true;
  documentName.textContent = book.name;
  downloadLink.href = book.url;
  downloadLink.download = book.name;
  downloadLink.hidden = false;
  renderLibrary();
}

function renderLibrary() {
  libraryList.querySelectorAll('.book-item').forEach((item) => item.remove());
  libraryEmpty.hidden = books.length > 0;
  bookCount.textContent = books.length;

  books.forEach((book) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `book-item${book.id === activeBookId ? ' active' : ''}`;
    button.title = book.name;
    button.setAttribute('aria-label', `Abrir ${book.name}`);

    const icon = document.createElement('span');
    icon.className = 'book-item-icon';
    icon.textContent = 'PDF';
    icon.setAttribute('aria-hidden', 'true');

    const name = document.createElement('span');
    name.className = 'book-item-name';
    name.textContent = book.name;

    button.append(icon, name);
    button.addEventListener('click', () => openBook(book.file));
    libraryList.appendChild(button);
  });
}

pdfInput.addEventListener('change', (event) => {
  openBook(event.target.files[0]);
  event.target.value = '';
});

chooseButton.addEventListener('click', () => pdfInput.click());

dropZone.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropZone.classList.add('drag-active');
});

dropZone.addEventListener('dragleave', (event) => {
  if (!dropZone.contains(event.relatedTarget)) dropZone.classList.remove('drag-active');
});

dropZone.addEventListener('drop', (event) => {
  event.preventDefault();
  dropZone.classList.remove('drag-active');
  openBook(event.dataTransfer.files[0]);
});

document.addEventListener('dragover', (event) => event.preventDefault());
document.addEventListener('drop', (event) => event.preventDefault());

fullscreenButton.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    reader.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
});
