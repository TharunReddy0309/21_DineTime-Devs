document.addEventListener('DOMContentLoaded', () => {

    // ---- Toast ----
    const toastContainer = document.getElementById('toast-container');
    window.showToast = function(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = 'toast';
        const icon = type === 'success' ? 'ph-check-circle' : 'ph-info';
        toast.innerHTML = `<i class="ph ${icon} toast-icon"></i><span class="toast-message">${message}</span>`;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('hiding');
            toast.addEventListener('animationend', () => toast.remove());
        }, 3000);
    };

    // ---- Sync header profile name ----
    const profile = StorageManager.getData().profile;
    const headerName = document.getElementById('header-name');
    if (headerName) headerName.textContent = profile.name;

    // ---- Stats ----
    function updateStats(staffList) {
        document.getElementById('stat-pending').textContent  = staffList.filter(s => s.status === 'Pending').length;
        document.getElementById('stat-approved').textContent = staffList.filter(s => s.status === 'Approved').length;
        document.getElementById('stat-rejected').textContent = staffList.filter(s => s.status === 'Rejected').length;
    }

    // ---- Render ----
    function renderStaff(staffList) {
        const grid = document.getElementById('staff-grid');
        document.getElementById('staff-count').textContent = staffList.length;
        updateStats(StorageManager.getStaff());

        if (staffList.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; padding: 48px 24px; text-align: center; color: var(--text-muted); background: white; border-radius: 12px; border: 2px dashed #E2E8F0;">
                    <i class="ph ph-users" style="font-size: 32px; color: #CBD5E1; margin-bottom: 8px;"></i>
                    <p style="font-size: 15px;">No staff records found.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = staffList.map(s => {
            const statusClass = `status-${s.status.toLowerCase()}`;
            let actionsHTML = '';
            if (s.status === 'Pending') {
                actionsHTML = `
                    <button class="btn btn-small btn-approve" data-id="${s.id}" data-action="Approved">Approve</button>
                    <button class="btn btn-small btn-reject"  data-id="${s.id}" data-action="Rejected">Reject</button>`;
            } else if (s.status === 'Approved') {
                actionsHTML = `<div class="staff-approved-note"><i class="ph ph-check-circle"></i> Access Approved</div>
                    <button class="btn btn-small btn-revoke" data-id="${s.id}" data-action="Rejected">Revoke Access</button>`;
            } else {
                actionsHTML = `<div class="staff-rejected-note"><i class="ph ph-x-circle"></i> Request Rejected</div>
                    <button class="btn btn-small btn-approve" data-id="${s.id}" data-action="Approved">Approve</button>`;
            }

            return `
            <div class="staff-card" data-id="${s.id}">
                <div class="staff-card-top">
                    <div class="staff-identity">
                        <div class="staff-avatar">${s.initials}</div>
                        <div>
                            <div class="staff-name">${s.name}</div>
                            <div class="staff-role">${s.role}</div>
                        </div>
                    </div>
                    <span class="staff-status-badge ${statusClass}">${s.status === 'Pending' ? 'Pending Approval' : s.status}</span>
                </div>
                <div class="staff-card-meta">
                    <div class="staff-meta-row"><i class="ph ph-envelope-simple"></i>${s.email}</div>
                    <div class="staff-meta-row"><i class="ph ph-phone"></i>${s.phone}</div>
                    <div class="staff-meta-row"><i class="ph ph-calendar-blank"></i>Requested on ${s.requestedOn}</div>
                </div>
                <div class="staff-card-actions">${actionsHTML}</div>
            </div>`;
        }).join('');

        // Attach action listeners
        grid.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id     = btn.getAttribute('data-id');
                const action = btn.getAttribute('data-action');
                
                let displayAction = action === 'Approved' ? 'Approve' : (action === 'Rejected' ? 'Reject' : action);
                let confirmMsg = `Are you sure you want to ${displayAction.toLowerCase()} this staff member?`;
                if(action === 'Rejected') {
                    confirmMsg = `Are you sure you want to ${btn.classList.contains('btn-revoke') ? 'revoke access for' : 'reject'} this staff member?`;
                }

                if (window.showConfirm) {
                    window.showConfirm(confirmMsg, () => {
                        StorageManager.updateStaffStatus(id, action);
                        applyFilters();
                        showToast(action === 'Approved' ? 'Staff access approved!' : 'Action completed.',
                                  action === 'Approved' ? 'success' : 'info');
                    }, `${displayAction} Staff`, displayAction);
                } else {
                    // Fallback
                    StorageManager.updateStaffStatus(id, action);
                    applyFilters();
                }
            });
        });
    }

    // ---- Filter & Search ----
    function applyFilters() {
        const query  = document.getElementById('staff-search').value.toLowerCase();
        const status = document.getElementById('staff-filter-status').value;
        let list = StorageManager.getStaff();
        if (query)  list = list.filter(s => s.name.toLowerCase().includes(query) || s.email.toLowerCase().includes(query));
        if (status) list = list.filter(s => s.status === status);
        renderStaff(list);
    }

    document.getElementById('staff-search').addEventListener('input', applyFilters);
    document.getElementById('staff-filter-status').addEventListener('change', applyFilters);

    applyFilters();
});
