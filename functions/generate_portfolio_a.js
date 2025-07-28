console.log("File: functions/generate_portfolio_a.js");

function generatePortfolioHTML() {
    const projects = [
        {
            title: "E-Commerce Platform",
            description: "Modern online shopping solution",
            technology: "React, Node.js, MongoDB",
            status: "Completed"
        },
        {
            title: "Mobile Banking App",
            description: "Secure financial management application",
            technology: "React Native, Express.js",
            status: "In Progress"
        },
        {
            title: "Data Analytics Dashboard",
            description: "Real-time business intelligence tool",
            technology: "Vue.js, Python, PostgreSQL",
            status: "Planning"
        }
    ];
    
    let html = '<div class="row">';
    
    projects.forEach(project => 
        {
            const projectStatus = project.status;  // * Get Project status
            
            html += `
                <div class="col-md-4 mb-4">
                    <div class="card project-card">
                        <div class="card-body">
                            <h5 class="card-title">${project.title}</h5>
                            <p class="card-text">${project.description}</p>
                            <p class="text-muted small">Tech: ${project.technology}</p>
                            <span class="badge bg-primary">${projectStatus}</span>
                        </div>
                    </div>
                </div>
            `;
        }
    );
    
    html += '</div>';
    return html;
}

module.exports = { generatePortfolioHTML };