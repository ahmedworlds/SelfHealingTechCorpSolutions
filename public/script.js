// File: public/script.js

document.addEventListener('DOMContentLoaded', function() {
    // Show loading spinner for navigation
    const navLinks = document.querySelectorAll('.nav-link, .dropdown-item');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') !== '#' && this.getAttribute('href') !== '/') {
                showLoading();
            }
        });
    });
    
    function showLoading() {
        const spinner = document.querySelector('.loading-spinner');
        if (spinner) {
            spinner.style.display = 'block';
        }
    }
    
    // Simple error reporting (for research purposes)
    window.addEventListener('error', function(e) {
        console.log('Client-side error detected:', e.message);
        // This helps track client-side vs server-side errors
    });
    
    // Add visual feedback for interactive elements
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});
