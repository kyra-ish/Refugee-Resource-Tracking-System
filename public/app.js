// Theme Toggle
const themeBtn = document.getElementById('themeToggle');
themeBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
});

// Tab Switching
function showTab(tab) {
    ['survivors', 'inventory', 'camps'].forEach(t => {
        document.getElementById(`tab-${t}`).style.display = t === tab ? 'block' : 'none';
    });
    document.querySelectorAll('.tab-btn').forEach((btn, idx) => {
        btn.classList.toggle('active', ['survivors', 'inventory', 'camps'][idx] === tab);
    });
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// Fetch and Refresh Data
async function loadData() {
    // 1. Stats
    const statsRes = await fetch('/api/stats');
    const stats = await statsRes.json();
    document.getElementById('statSurvivors').innerText = stats.totalSurvivors;
    document.getElementById('statCamps').innerText = stats.totalCamps;
    document.getElementById('statWater').innerText = `${stats.totalWater.toLocaleString()} L`;
    document.getElementById('statCritical').innerText = stats.criticalCases;

    // 2. Survivors
    const survRes = await fetch('/api/survivors');
    const survivors = await survRes.json();
    document.getElementById('survivorTable').innerHTML = survivors.map(s => {
        const badge = ['Critical', 'Infant'].includes(s.vulnerability_status) ? 'badge-danger' : 
                      ['Pregnant', 'Elderly'].includes(s.vulnerability_status) ? 'badge-warning' : 'badge-success';
        return `
            <tr>
                <td>#${s.survivor_id}</td>
                <td><strong>${s.full_name}</strong></td>
                <td>${s.age} / ${s.gender}</td>
                <td>${s.camp_name} (${s.district})</td>
                <td>${s.origin_village}</td>
                <td><span class="badge ${badge}">${s.vulnerability_status}</span></td>
                <td>${s.medical_need}</td>
            </tr>
        `;
    }).join('');

    // 3. Inventory
    const invRes = await fetch('/api/inventory');
    const inventory = await invRes.json();
    document.getElementById('inventoryTable').innerHTML = inventory.map(i => {
        const status = i.quantity < 100 ? 'badge-danger' : 'badge-success';
        const label = i.quantity < 100 ? 'Low Stock' : 'Sufficient';
        return `
            <tr>
                <td>${i.camp_name}</td>
                <td><strong>${i.item_name}</strong></td>
                <td>${i.category}</td>
                <td>${i.quantity.toLocaleString()} ${i.unit}</td>
                <td><span class="badge ${status}">${label}</span></td>
                <td>
                    <button class="btn-action" style="padding:0.25rem 0.6rem; font-size:0.8rem; background:var(--danger);" onclick="deleteInventory(${i.inventory_id})">Delete</button>
                </td>
            </tr>
        `;
    }).join('');

    // 4. Camps
    const campsRes = await fetch('/api/camps');
    const camps = await campsRes.json();
    document.getElementById('campTable').innerHTML = camps.map(c => `
        <tr>
            <td><strong>${c.camp_name}</strong></td>
            <td>${c.district}</td>
            <td>${c.capacity}</td>
            <td>${c.current_occupancy}</td>
            <td>${c.contact_officer}</td>
            <td>
                <button class="btn-action" style="padding:0.25rem 0.6rem; font-size:0.8rem; margin-right:4px;" onclick='openCampModal(${JSON.stringify(c)})'>Edit</button>
                <button class="btn-action" style="padding:0.25rem 0.6rem; font-size:0.8rem; background:var(--danger);" onclick="deleteCamp(${c.camp_id})">Delete</button>
            </td>
        </tr>
    `).join('');

    // Populate camp selects
    const campOptions = camps.map(c => `<option value="${c.camp_id}">${c.camp_name} (${c.district})</option>`).join('');
    document.getElementById('sCamp').innerHTML = campOptions;
    document.getElementById('invCampSelect').innerHTML = campOptions;
}

// Survivor Form Submit
document.getElementById('survivorForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        camp_id: parseInt(document.getElementById('sCamp').value),
        full_name: document.getElementById('sName').value,
        age: parseInt(document.getElementById('sAge').value),
        gender: document.getElementById('sGender').value,
        origin_village: document.getElementById('sVillage').value,
        vulnerability_status: document.getElementById('sVuln').value,
        medical_need: document.getElementById('sMed').value
    };

    await fetch('/api/survivors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    closeModal('survivorModal');
    document.getElementById('survivorForm').reset();
    loadData();
});

// Inventory Add Form Submit
document.getElementById('inventoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        camp_id: parseInt(document.getElementById('invCampSelect').value),
        item_name: document.getElementById('invItemName').value,
        category: document.getElementById('invCategory').value,
        quantity: parseInt(document.getElementById('invQuantity').value),
        unit: document.getElementById('invUnit').value
    };

    await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    closeModal('inventoryModal');
    document.getElementById('inventoryForm').reset();
    loadData();
});

// Delete Inventory Item
async function deleteInventory(id) {
    if (confirm('Are you sure you want to delete this resource item?')) {
        await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
        loadData();
    }
}

// Camp Modal Management (Add / Edit)
function openCampModal(camp = null) {
    const form = document.getElementById('campForm');
    form.reset();
    if (camp) {
        document.getElementById('campModalTitle').innerText = 'Edit Relief Camp';
        document.getElementById('campEditId').value = camp.camp_id;
        document.getElementById('cName').value = camp.camp_name;
        document.getElementById('cDistrict').value = camp.district;
        document.getElementById('cCapacity').value = camp.capacity;
        document.getElementById('cOccupancy').value = camp.current_occupancy;
        document.getElementById('cOfficer').value = camp.contact_officer;
        document.getElementById('occupancyFieldGroup').style.display = 'block';
    } else {
        document.getElementById('campModalTitle').innerText = 'Add Relief Camp';
        document.getElementById('campEditId').value = '';
        document.getElementById('occupancyFieldGroup').style.display = 'none';
    }
    openModal('campModal');
}

// Camp Form Submit (Create or Update)
document.getElementById('campForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const editId = document.getElementById('campEditId').value;
    const payload = {
        camp_name: document.getElementById('cName').value,
        district: document.getElementById('cDistrict').value,
        capacity: parseInt(document.getElementById('cCapacity').value),
        contact_officer: document.getElementById('cOfficer').value
    };

    if (editId) {
        payload.current_occupancy = parseInt(document.getElementById('cOccupancy').value) || 0;
        await fetch(`/api/camps/${editId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } else {
        await fetch('/api/camps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    }

    closeModal('campModal');
    loadData();
});

// Delete Camp
async function deleteCamp(id) {
    if (confirm('Deleting this camp will affect survivors assigned to it. Proceed?')) {
        await fetch(`/api/camps/${id}`, { method: 'DELETE' });
        loadData();
    }
}

// Initial Load
loadData();