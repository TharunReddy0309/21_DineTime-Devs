document.addEventListener('DOMContentLoaded', () => {
    // ---- Toast Helper ----
    const toastContainer = document.getElementById('toast-container');
    window.showToast = function(message, type = 'success') {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        let iconClass = type === 'success' ? 'ph-check-circle' : 'ph-info';
        if (type === 'error') iconClass = 'ph-trash';
        toast.innerHTML = `<i class="ph ${iconClass} toast-icon"></i><span class="toast-message">${message}</span>`;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('hiding');
            toast.addEventListener('animationend', () => toast.remove());
        }, 3000);
    };

    // ---- State ----
    let allReviews = [];
    let currentFilter = 'all';
    let currentSort = 'recent'; 

    // ---- DOM Elements ----
    const feedContainer = document.getElementById('reviews-feed');
    const overviewRating = document.getElementById('metric-avg-rating');
    const overviewTotal = document.getElementById('metric-total-reviews');
    const progressContainer = document.getElementById('progress-bars-container');
    const filterPills = document.querySelectorAll('.filter-pill');
    const sortSelect = document.querySelector('.sort-select');

    // ---- Initialization ----
    function init() {
        allReviews = StorageManager.getReviews();
        renderOverview();
        renderFeed();
        bindFilters();
    }

    // ---- Renderers ----
    function renderOverview() {
        if(allReviews.length === 0) return;
        
        let sum = 0;
        let counts = { 5:0, 4:0, 3:0, 2:0, 1:0 };
        
        allReviews.forEach(r => {
            sum += r.rating;
            counts[r.rating] = (counts[r.rating] || 0) + 1;
        });
        
        const avg = (sum / allReviews.length).toFixed(1);
        overviewRating.innerHTML = `${avg} <i class="ph-fill ph-star"></i>`;
        overviewTotal.innerText = allReviews.length;
        
        // Render Bars (5 down to 1)
        let html = '';
        for(let i = 5; i >= 1; i--) {
            const pct = Math.round((counts[i] / allReviews.length) * 100);
            html += `
                <div class="progress-row">
                    <span>${i} <i class="ph-fill ph-star"></i></span>
                    <div class="progress-track">
                        <div class="progress-fill" style="width: ${pct}%"></div>
                    </div>
                    <span class="progress-pct">${pct}%</span>
                </div>
            `;
        }
        progressContainer.innerHTML = html;
    }

    function renderFeed() {
        let filtered = [...allReviews];
        
        // Filter
        if(currentFilter !== 'all') {
            const starTarget = parseInt(currentFilter);
            filtered = filtered.filter(r => r.rating === starTarget);
        }
        
        // Sort (Basic mockup simulation)
        if(currentSort === 'highest') {
            filtered.sort((a,b) => b.rating - a.rating);
        } else if (currentSort === 'lowest') {
            filtered.sort((a,b) => a.rating - b.rating);
        }

        let html = '';
        
        if (filtered.length === 0) {
            feedContainer.innerHTML = `
                <div style="padding: 48px 24px; text-align: center; color: var(--text-muted); background: white; border-radius: 12px; border: 2px dashed #E2E8F0;">
                    <i class="ph ph-star" style="font-size: 32px; color: #CBD5E1; margin-bottom: 8px;"></i>
                    <p style="font-size: 15px;">No reviews found matching your selected filters.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(r => {
            // Star gen
            let starsHtml = '';
            for(let i=0; i<5; i++) {
                if(i < r.rating) starsHtml += `<i class="ph-fill ph-star"></i>`;
                else starsHtml += `<i class="ph-fill ph-star empty"></i>`;
            }

            // Badge gen
            let badgeHtml = '';
            if(r.verified) badgeHtml += `<span class="badge badge-verified"><i class="ph-fill ph-check-circle"></i> Verified</span>`;
            
            if(r.status === 'Responded') {
                badgeHtml += `<span class="badge badge-responded"><i class="ph ph-chat-text"></i> Responded</span>`;
            } else {
                badgeHtml += `<span class="badge badge-pending">Pending Response</span>`;
            }

            // Dynamics box
            let responseBlock = '';
            if(r.reply) {
                responseBlock = `
                    <div class="manager-response-box" id="resp-box-${r.id}">
                        <h6>Manager Response</h6>
                        <p>${r.reply}</p>
                        <div class="response-actions">
                            <button class="action-link edit" data-id="${r.id}" data-text="${r.reply}">Edit</button>
                            <button class="action-link delete" data-id="${r.id}">Delete</button>
                        </div>
                    </div>
                `;
            } else {
                responseBlock = `
                    <div style="margin-top: 16px;" id="reply-action-${r.id}">
                        <button class="btn-reply" data-id="${r.id}">Reply</button>
                    </div>
                `;
            }

            html += `
                <div class="review-card">
                    <div class="review-header">
                        <div class="reviewer-info">
                            <div class="avatar-initials">${r.initials}</div>
                            <div class="reviewer-details">
                                <h5>${r.author}</h5>
                                <span><i class="ph ph-calendar-blank"></i> ${r.date}</span>
                            </div>
                        </div>
                        <div class="badges">
                            ${badgeHtml}
                        </div>
                    </div>
                    <div class="review-stars">
                        ${starsHtml}
                    </div>
                    <p class="review-text">${r.comment}</p>
                    
                    ${responseBlock}
                    <!-- Hidden Editor Slot -->
                    <div class="reply-editor-container" id="editor-${r.id}" style="display:none;"></div>
                </div>
            `;
        });
        
        feedContainer.innerHTML = html;
        bindDynamicCardEvents();
    }

    // ---- Event Bindings ----
    function bindFilters() {
        filterPills.forEach(pill => {
            pill.addEventListener('click', (e) => {
                filterPills.forEach(p => p.classList.remove('active'));
                e.target.classList.add('active');
                currentFilter = e.target.getAttribute('data-filter');
                renderFeed();
            });
        });

        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderFeed();
        });
    }

    function bindDynamicCardEvents() {
        // Reply
        document.querySelectorAll('.btn-reply').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                // Hide the reply button container
                document.getElementById(`reply-action-${id}`).style.display = 'none';
                openEditor(id, '');
            });
        });

        // Edit
        document.querySelectorAll('.action-link.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const text = e.currentTarget.getAttribute('data-text');
                // Hide the static response box
                document.getElementById(`resp-box-${id}`).style.display = 'none';
                openEditor(id, text);
            });
        });

        // Delete
        document.querySelectorAll('.action-link.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                if(window.showConfirm) {
                    window.showConfirm("Are you sure you want to delete your response? This cannot be undone.", () => {
                        StorageManager.deleteReviewReply(id);
                        allReviews = StorageManager.getReviews(); // soft reload data
                        renderOverview(); // update stats if needed
                        renderFeed(); // repaint
                        showToast("Manager response deleted.", "error");
                    }, "Delete Response"); // uses red theme implicitly because "Delete"
                }
            });
        });
    }

    function openEditor(id, existingText) {
        // We allow multiple editors open technically, but it's cleaner
        const container = document.getElementById(`editor-${id}`);
        if(!container) return;
        
        container.style.display = 'block';
        container.innerHTML = `
            <div class="inline-reply-editor">
                <textarea id="textarea-${id}" placeholder="Type your response here...">${existingText}</textarea>
                <div style="display: flex; justify-content: flex-end; gap: 8px;">
                    <button class="btn btn-outline cancel-reply" data-id="${id}">Cancel</button>
                    <button class="btn btn-primary-green save-reply" data-id="${id}">Submit Response</button>
                </div>
            </div>
        `;
        document.getElementById(`textarea-${id}`).focus();
        
        // Bind inner actions
        container.querySelector('.cancel-reply').addEventListener('click', () => {
            renderFeed(); // easiest way to reset the card state natively
        });

        container.querySelector('.save-reply').addEventListener('click', () => {
            const text = document.getElementById(`textarea-${id}`).value.trim();
            if(!text) {
                showToast("Response cannot be empty.", "warning");
                return;
            }
            StorageManager.saveReviewReply(id, text);
            allReviews = StorageManager.getReviews(); 
            renderFeed();
            showToast("Response saved successfully!");
        });
    }

    // Run
    init();
});
