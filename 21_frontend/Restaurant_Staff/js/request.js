// Simple script to handle the "Notify Me" button interactions
document.getElementById('notify-btn').addEventListener('click', function() {
    showToast('Notifications enabled! We will alert you when approved.');
    
    // Change button appearance to show it's active
    this.innerHTML = '<i class="fa-solid fa-check"></i> Notifications Enabled';
    this.style.background = '#4b5563';
    this.disabled = true;
});

// Toast helper function
function showToast(message) {
    // Remove existing toast if any
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    toast.innerHTML = `
        <i class="fa-solid fa-circle-check"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);

    // Inject styles
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast {
                position: fixed;
                bottom: 28px;
                left: 50%;
                transform: translateX(-50%) translateY(20px);
                background: #1f2937;
                color: #fff;
                padding: 12px 22px;
                border-radius: 10px;
                font-size: 0.88rem;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 9999;
                box-shadow: 0 8px 24px rgba(0,0,0,0.18);
                animation: slideUp 0.3s ease forwards;
            }
            .toast-success i { color: #22C55E; }
            @keyframes slideUp {
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => {
        toast.style.transition = 'opacity 0.3s';
        toast.style.opacity    = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
