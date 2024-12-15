const editor = document.getElementById('editor');
const blockMenu = document.getElementById('blockMenu');
const finishListButton = document.getElementById('finishListButton');
const tableOptions = document.getElementById('tableOptions');
const listOptions = document.getElementById('listOptions');
const contextMenu = document.getElementById('contextMenu');
let currentCell = null;
let currentList = null;

function formatText(command) {
    document.execCommand(command, false, null);
}

editor.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !currentList) {
        e.preventDefault(); 
        blockMenu.style.display = 'flex';
    }
});

editor.addEventListener('contextmenu', (e) => {
    e.preventDefault(); // Ngăn chặn menu ngữ cảnh mặc định của trình duyệt
});

function addTag(tag) {
    const newElement = document.createElement(tag);
    newElement.textContent = `This is a <${tag}> tag.`;
    editor.appendChild(newElement);
    blockMenu.style.display = 'none';
}

function startList(tag) {
    currentList = document.createElement(tag);
    const listItem = document.createElement("li");
    listItem.textContent = "List item";
    currentList.appendChild(listItem);
    editor.appendChild(currentList);
    listOptions.style.display = 'block';
    finishListButton.style.display = 'inline-block';
    blockMenu.style.display = 'none';
}

function addListItem() {
    if (currentList) {
        const listItem = document.createElement("li");
        listItem.textContent = "New list item";
        currentList.appendChild(listItem);
    } else {
        alert("Please start a list (ul or ol) first.");
    }
}

function finishList() {
    currentList = null;
    finishListButton.style.display = 'none';
}

function toggleCellTag() {
    if (!currentCell) return;

    const currentTag = currentCell.tagName.toLowerCase();
    const newTag = currentTag === 'td' ? 'th' : 'td';

    const newCell = document.createElement(newTag);
    newCell.innerHTML = currentCell.innerHTML; // Giữ nội dung hiện tại
    newCell.setAttribute('colspan', currentCell.getAttribute('colspan') || 1);
    newCell.setAttribute('rowspan', currentCell.getAttribute('rowspan') || 1);

    newCell.onclick = (e) => selectCell(newCell, e);

    currentCell.parentElement.replaceChild(newCell, currentCell);
    currentCell = newCell; // Cập nhật con trỏ tới ô mới
}

function clearCellContent() {
    if (!currentCell) return;

    currentCell.innerHTML = ''; // Xóa nội dung giữa ô
}

function addTable() {
    const columns = parseInt(prompt("Enter the number of columns:", 2));
    if (isNaN(columns) || columns < 1) return;

    const table = document.createElement('table');
    const tbody = document.createElement('tbody');

    for (let i = 0; i < 2; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < columns; j++) {
            const cell = document.createElement('td');
            cell.textContent = 'Cell';
            cell.onclick = (e) => selectCell(cell, e);
            cell.addEventListener('contextmenu', (e) => showContextMenu(e, cell)); // Thêm sự kiện contextmenu
            row.appendChild(cell);
        }
        tbody.appendChild(row);
    }

    table.appendChild(tbody);
    table.setAttribute('border', '1');
    editor.appendChild(table);
}

function selectCell(cell, event) {
    currentCell = cell;
    tableOptions.style.display = 'flex';

    if (event) {
        event.preventDefault();
        contextMenu.style.display = 'block';
        contextMenu.style.left = `${event.pageX}px`;
        contextMenu.style.top = `${event.pageY}px`;
    }
}

function showContextMenu(event, cell) {
    event.preventDefault();
    currentCell = cell;
    contextMenu.style.display = 'block';
    contextMenu.style.left = `${event.pageX}px`;
    contextMenu.style.top = `${event.pageY}px`;
}

function applyCellOptions() {
    if (!currentCell) return;

    const colspan = parseInt(document.getElementById('colspan').value);
    const rowspan = parseInt(document.getElementById('rowspan').value);

    currentCell.setAttribute('colspan', colspan);
    currentCell.setAttribute('rowspan', rowspan);

    const row = currentCell.parentElement;
    const table = row.parentElement.parentElement;

    adjustTableStructure(table, row, colspan, rowspan);
}

function adjustTableStructure(table, row, colspan, rowspan) {
    const rows = Array.from(table.querySelectorAll('tr'));

    rows.forEach((r, rowIndex) => {
        const cells = Array.from(r.children);
        let expectedCells = cells.reduce((acc, cell) => acc + (parseInt(cell.getAttribute('colspan')) || 1), 0);

        while (expectedCells < rows[0].children.length) {
            const emptyCell = document.createElement('td');
            emptyCell.textContent = 'Cell';
            emptyCell.onclick = (e) => selectCell(emptyCell, e);
            emptyCell.addEventListener('contextmenu', (e) => showContextMenu(e, emptyCell)); // Thêm sự kiện contextmenu
            r.appendChild(emptyCell);
            expectedCells++;
        }

        if (rowIndex >= rows.indexOf(row) && rowspan > 1) {
            for (let i = 1; i < rowspan; i++) {
                if (rows[rowIndex + i]) {
                    const fillerCell = document.createElement('td');
                    fillerCell.textContent = 'Filler Cell';
                    fillerCell.onclick = (e) => selectCell(fillerCell, e);
                    fillerCell.addEventListener('contextmenu', (e) => showContextMenu(e, fillerCell)); // Thêm sự kiện contextmenu
                    rows[rowIndex + i].insertBefore(fillerCell, rows[rowIndex + i].children[row.cellIndex]);
                }
            }
        }
    });
}

function addTableRow() {
    if (!currentCell) return;

    const table = currentCell.closest('table');
    const columns = table.rows[0].children.length;
    const newRow = document.createElement('tr');

    for (let i = 0; i < columns; i++) {
        const newCell = document.createElement('td');
        newCell.textContent = 'New Cell';
        newCell.onclick = (e) => selectCell(newCell, e);
        newCell.addEventListener('contextmenu', (e) => showContextMenu(e, newCell)); 
        newRow.appendChild(newCell);
    }

    table.querySelector('tbody').appendChild(newRow);
}

function addTableColumn() {
    if (!currentCell) return;

    const table = currentCell.closest('table');

    Array.from(table.rows).forEach(row => {
        const newCell = document.createElement('td');
        newCell.textContent = 'New Cell';
        newCell.onclick = (e) => selectCell(newCell, e);
        newCell.addEventListener('contextmenu', (e) => showContextMenu(e, newCell)); 
        row.appendChild(newCell);
    });
}

function deleteCell() {
    if (!currentCell) return;

    const row = currentCell.parentElement;
    row.removeChild(currentCell);
    currentCell = null;
    contextMenu.style.display = 'none';
}

document.addEventListener('click', () => {
    contextMenu.style.display = 'none';
});

function generateHTML() {
    const editor = document.getElementById('editor');
    const elements = editor.children; // Lấy tất cả các thẻ con trực tiếp trong editor
    let htmlContent = '';

    Array.from(elements).forEach(element => {
        const tagName = element.tagName.toLowerCase();
        const innerHTML = element.innerHTML.trim();
        const attributes = Array.from(element.attributes).map(attr => `${attr.name}="${attr.value}"`).join(' ');

        if (tagName === 'table') {
            htmlContent += `<${tagName} ${attributes}>\n${formatTableContent(element.innerHTML)}\n</${tagName}>\n`;
        } else {
            htmlContent += `<${tagName} ${attributes}>${innerHTML}</${tagName}>\n`;
        }
    });

    // Hiển thị HTML đã tạo ra (có thể thay đổi để hiển thị ở nơi khác)
    document.getElementById('htmlOutput').value = htmlContent;
}

function formatTableContent(content) {
    return content.replace(/></g, '>\n<');
}
