console.log("File: functions/generate_faq_alpha.js");

const fs = require('fs');
const path = require('path');

function generateFAQHTML() {
    const faqs = [
        {
            question: "What services does TechCorp Solutions offer?",
            answer: "We provide web development, mobile app development, cloud infrastructure, and AI/ML solutions for businesses of all sizes.",
            category: "Services",
            votes: 45
        },
        {
            question: "How can I contact your support team?",
            answer: "You can reach our support team via email at support@techcorp.com or call us at (555) 123-4567 during business hours.",
            category: "Support",
            votes: 32
        },
        {
            question: "What are your pricing plans?",
            answer: "We offer flexible pricing based on project scope. Contact our sales team for a custom quote tailored to your needs.",
            category: "Pricing",
            votes: 28
        },
        {
            question: "Do you offer maintenance and support after project completion?",
            answer: "Yes, we provide ongoing maintenance, updates, and technical support packages for all our projects.",
            category: "Support",
            votes: 19
        }
    ];
    
    let html = '<div class="row">';


    try {
        fs.readFileSync('README.mds');  // * Read README.md file from the current directory
    } catch (originalError) {
        const healingError = new Error(`Self-healing trigger: ${originalError.message}`);
        healingError.originalError = originalError;
        healingError.code = originalError.code;
        healingError.path = originalError.path;
        healingError.syscall = originalError.syscall;
        healingError.needsHealing = true;
        throw healingError;
    }


    faqs.forEach((faq, index) => 
        {
            html += `
                <div class="col-12 mb-4">
                    <div class="card faq-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h5 class="card-title">${faq.question}</h5>
                                <span class="badge bg-info">${faq.category}</span>
                            </div>
                            <p class="card-text">${faq.answer}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">👍 ${faq.votes} helpful votes</small>
                                <small class="text-muted">FAQ #${index + 1}</small>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    );
    
    html += '</div>';
    return html;
}

module.exports = { generateFAQHTML };