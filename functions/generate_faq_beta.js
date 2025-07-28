console.log("File: functions/generate_faq_beta.js");


function generateFAQHTML() {
    const faqs = [
        {
            question: "What technologies do you use for web development?",
            answer: "We use modern technologies including React, Node.js, Express, MongoDB, and cloud platforms like AWS and Azure.",
            category: "Technical",
            complexity: "3"
        },
        {
            question: "How do you ensure website security?",
            answer: "We implement HTTPS, input validation, authentication, authorization, and regular security audits for all projects.",
            category: "Security",
            complexity: "4"
        },
        {
            question: "What is your deployment process?",
            answer: "We use CI/CD pipelines with automated testing, staging environments, and blue-green deployments for zero downtime.",
            category: "DevOps",
            complexity: "5"
        },
        {
            question: "Do you provide API documentation?",
            answer: "Yes, we provide comprehensive API documentation using tools like Swagger/OpenAPI with interactive examples.",
            category: "Documentation",
            complexity: "2"
        }
    ];
    
    let html = '<div class="row">';
    
    faqs.forEach((faq, index) => 
        {
            const complexityLevel = parseInt(faq.complexity);
            const complexityEmoji = '🔧'.repeat(-complexityLevel); // * repeat emoji for complexity

            
            html += `
                <div class="col-md-6 mb-4">
                    <div class="card faq-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h6 class="card-title">${faq.question}</h6>
                                <span class="badge bg-primary">${faq.category}</span>
                            </div>
                            <p class="card-text small">${faq.answer}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">📊 Complexity: ${complexityEmoji}</small>
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
