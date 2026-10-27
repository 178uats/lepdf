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

// Elementos de pestañas Local vs Drive
const tabLocal = document.getElementById('tabLocal');
const tabDrive = document.getElementById('tabDrive');
const sectionLocal = document.getElementById('sectionLocal');
const sectionDrive = document.getElementById('sectionDrive');
const driveMangaList = document.getElementById('driveMangaList');

let books = [];
let activeBookId = null;

// Manejo de pestañas
tabLocal.addEventListener('click', () => {
  tabLocal.style.background = 'var(--green)';
  tabDrive.style.background = '#858980';
  sectionLocal.hidden = false;
  sectionDrive.hidden = true;
  libraryList.hidden = false;
});

tabDrive.addEventListener('click', () => {
  tabDrive.style.background = 'var(--green)';
  tabLocal.style.background = '#858980';
  sectionDrive.hidden = false;
  sectionLocal.hidden = true;
  libraryList.hidden = true;
  loadDriveMangas();
});

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

// Abrir PDF de Google Drive
function openDriveBook(title, driveId) {
  const embedUrl = `https://drive.google.com/file/d/${driveId}/preview`;
  
  pdfViewer.src = embedUrl;
  pdfViewer.hidden = false;
  emptyState.hidden = true;
  documentName.textContent = title;
  
  downloadLink.href = `https://drive.google.com/uc?export=download&id=${driveId}`;
  downloadLink.download = `${title}.pdf`;
  downloadLink.hidden = false;
}

// Cargar catálogo automáticamente desde Google Apps Script con carpetas colapsables
async function loadDriveMangas() {
  if (driveMangaList.dataset.loaded) return;
  
  try {
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzv_DC-MM15Euu8z09MhA3ij_eoxwnNQa_I8goB0xsI1JrpayEZOAnde9nC4S1Q3Giq/exec';

    const response = await fetch(WEB_APP_URL);
    const mangas = await response.json();
    
    driveMangaList.innerHTML = '';
    
    if (mangas.length === 0) {
      driveMangaList.innerHTML = '<p class="library-empty">No se encontraron mangas en la carpeta.</p>';
      return;
    }
    
    mangas.forEach(manga => {
      const mangaContainer = document.createElement('div');
      mangaContainer.className = 'manga-group';
      mangaContainer.style.marginBottom = '10px';
      
      // Título del Manga (Clickeable para minimizar/expandir)
      const mangaTitle = document.createElement('div');
      mangaTitle.className = 'folder-toggle';
      mangaTitle.innerHTML = `▼ <strong>${manga.titulo}</strong>`;
      mangaTitle.style.cssText = 'cursor: pointer; padding: 6px 8px; font-size: 12px; color: var(--green); background: #f0f3ec; border-radius: 6px; user-select: none;';
      
      // Contenedor de las secciones del manga
      const mangaContent = document.createElement('div');
      mangaContent.className = 'folder-content';
      mangaContent.style.cssText = 'margin-top: 6px; padding-left: 8px; display: none;'; // Por defecto minimizado

      mangaTitle.addEventListener('click', () => {
        const isHidden = mangaContent.style.display === 'none';
        mangaContent.style.display = isHidden ? 'block' : 'none';
        mangaTitle.innerHTML = `${isHidden ? '▼' : '▶'} <strong>${manga.titulo}</strong>`;
      });

      manga.secciones.forEach(seccion => {
        const secContainer = document.createElement('div');
        secContainer.style.marginBottom = '6px';

        // Título de la sección (Tomos Extra, Tomos 1 al 12, Capítulos) Clickeable
        const secLabel = document.createElement('div');
        secLabel.className = 'folder-toggle';
        secLabel.innerHTML = `📁 ▶ ${seccion.tipo}`;
        secLabel.style.cssText = 'cursor: pointer; padding: 4px 6px; font-size: 11px; font-weight: bold; color: var(--muted); user-select: none;';
        
        const secContent = document.createElement('div');
        secContent.style.cssText = 'padding-left: 10px; display: none; margin-top: 4px;'; // Por defecto minimizado

        secLabel.addEventListener('click', () => {
          const isHidden = secContent.style.display === 'none';
          secContent.style.display = isHidden ? 'block' : 'none';
          secLabel.innerHTML = `📁 ${isHidden ? '▼' : '▶'} ${seccion.tipo}`;
        });

        seccion.elementos.forEach(item => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'book-item';
          btn.style.width = '100%';
          btn.style.marginBottom = '4px';
          
          const icon = document.createElement('span');
          icon.className = 'book-item-icon';
          icon.textContent = 'PDF';

          const name = document.createElement('span');
          name.className = 'book-item-name';
          name.textContent = item.nombre;

          btn.append(icon, name);
          btn.addEventListener('click', () => openDriveBook(`${manga.titulo} - ${item.nombre}`, item.driveId));
          secContent.appendChild(btn);
        });

        secContainer.appendChild(secLabel);
        secContainer.appendChild(secContent);
        mangaContent.appendChild(secContainer);
      });

      mangaContainer.appendChild(mangaTitle);
      mangaContainer.appendChild(mangaContent);
      driveMangaList.appendChild(mangaContainer);
    });
    
    driveMangaList.dataset.loaded = 'true';
  } catch (error) {
    driveMangaList.innerHTML = '<p class="library-empty">Error al conectar con Google Drive. Verifica la URL o los permisos.</p>';
    console.error('Error cargando desde Apps Script', error);
  }
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