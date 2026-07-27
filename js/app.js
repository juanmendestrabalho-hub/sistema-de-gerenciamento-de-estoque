let products = JSON.parse(localStorage.getItem("products")) || [];

const table = document.getElementById("table");

// DASHBOARD
const totalProducts = document.getElementById("totalProducts");
const totalStock = document.getElementById("totalStock");
const lowStock = document.getElementById("lowStock");

const LOW_LIMIT = 5;

// ================= ADD =================
function addProduct() {
    const name = document.getElementById("name").value;
    const qty = parseInt(document.getElementById("qty").value);
    const price = parseFloat(document.getElementById("price").value);

    if (!name || isNaN(qty) || isNaN(price)) {
        alert("Preencha corretamente");
        return;
    }

    products.push({
        id: Date.now(),
        name,
        qty,
        price
    });

    save();
    render();
}

// ================= SAVE =================
function save() {
    localStorage.setItem("products", JSON.stringify(products));
}

// ================= DELETE =================
function deleteProduct(id) {
    products = products.filter(p => p.id !== id);
    save();
    render();
}

// ================= UPDATE =================
function changeQty(id, amount) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    product.qty += amount;
    if (product.qty < 0) product.qty = 0;

    save();
    render();
}

// ================= RENDER =================
function render(list = products) {
    table.innerHTML = "";

    let totalQty = 0;
    let low = 0;

    list.forEach(p => {
        totalQty += p.qty;

        const isLow = p.qty <= LOW_LIMIT;
        if (isLow) low++;

        table.innerHTML += `
            <tr>
                <td>${p.name}</td>
                <td>${p.qty}</td>
                <td>R$ ${p.price.toFixed(2)}</td>
                <td class="${isLow ? 'low' : ''}">
                    ${isLow ? 'Baixo' : 'OK'}
                </td>
                <td>
                    <button onclick="changeQty(${p.id}, 1)">+ Entrada</button>
                    <button onclick="changeQty(${p.id}, -1)">- Saída</button>
                    <button onclick="deleteProduct(${p.id})">Excluir</button>
                </td>
            </tr>
        `;
    });

    totalProducts.innerText = products.length;
    totalStock.innerText = totalQty;
    lowStock.innerText = low;
}

// ================= SEARCH =================
document.getElementById("search").addEventListener("input", function(e) {
    const text = e.target.value.toLowerCase();

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(text)
    );

    render(filtered);
});

// ================= IMPORT EXCEL =================
function importExcel() {
    const file = document.getElementById("uploadExcel").files[0];

    if (!file) {
        alert("Selecione um arquivo");
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        json.forEach(item => {
            products.push({
                id: Date.now() + Math.random(),
                name: item.Nome || item.nome,
                qty: parseInt(item.Qtd || item.qtd || 0),
                price: parseFloat(item.Preco || item.preco || 0)
            });
        });

        save();
        render();

        alert("Importação concluída!");
    };

    reader.readAsArrayBuffer(file);
}

// ================= EXPORT EXCEL =================
function exportExcel() {
    if (products.length === 0) {
        alert("Sem dados");
        return;
    }

    const data = products.map(p => ({
        Produto: p.name,
        Quantidade: p.qty,
        Preco: p.price
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Estoque");

    XLSX.writeFile(wb, "estoque.xlsx");
}

// ================= INIT =================
render();
