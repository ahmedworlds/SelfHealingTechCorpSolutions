console.log("File: functions/generate_faq_gamma.js");


function generateFAQHTML() {
    const faqs = [
        {
            question: "What is your refund policy?",
            answer: "We offer full refunds within 30 days of project initiation if you're not satisfied with our initial deliverables.",
            category: "Policy",
            priority: 1
        },
        {
            question: "How long does a typical project take?",
            answer: "Project timelines vary based on complexity. Simple websites take 2-4 weeks, while complex applications can take 3-6 months.",
            category: "Timeline",
            priority: 2
        },
        {
            question: "Do you offer training for our team?",
            answer: "Yes, we provide comprehensive training sessions and documentation to help your team manage and maintain the solution.",
            category: "Training",
            priority: 3
        },
        {
            question: "What happens if there's an issue after launch?",
            answer: "We provide 90 days of free bug fixes and technical support after project completion, with extended support plans available.",
            category: "Support",
            priority: 1
        }
    ];
    
    let html = '<div class="row">';
    
    faqs.forEach((faq, index) => 
        {
            const userInput = '%ZZ%invalid'; // user input
            const decodedUrl = decodeURIComponent(userInput); // * Decode the URL from user input


            html += `
                <div class="col-md-6 mb-4">
                    <div class="card faq-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h6 class="card-title">${faq.question}</h6>
                                <span class="badge bg-success">${faq.category}</span>
                            </div>
                            <p class="card-text small">${faq.answer}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">Priority: ${faq.priority}</small>
                                <small class="text-muted">URL: ${decodedUrl}</small>
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
