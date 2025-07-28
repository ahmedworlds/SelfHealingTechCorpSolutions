console.log("File: functions/generate_portfolio_b.js");


function generatePortfolioHTML() {
    const projects = [
        {
            title: "Cloud Infrastructure",
            description: "Scalable cloud computing solution",
            technology: "AWS, Docker, Kubernetes",
            status: "Live"
        },
        {
            title: "AI Chatbot Platform",
            description: "Intelligent customer service automation",
            technology: "Python, TensorFlow, FastAPI",
            status: "Beta"
        },
        {
            title: "Blockchain Network",
            description: "Decentralized transaction processing",
            technology: "Solidity, Web3.js, Ethereum",
            status: "Development"
        }
    ];
    
    let html = '<div class="row">';
    
    projects.forEach(project => 
        {
            const projectCount = null;
            const totalProjects = projectCount.toString(); // * Total number of projects

            html += `
                <div class="col-md-4 mb-4">
                    <div class="card project-card">
                        <div class="card-body">
                            <h5 class="card-title">${project.title}</h5>
                            <p class="card-text">${project.description}</p>
                            <p class="text-muted small">Tech: ${project.technology}</p>
                            <span class="badge bg-success">${project.status}</span>
                            <div class="mt-2">
                                <small class="text-muted">Project #${totalProjects}</small>
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

module.exports = { generatePortfolioHTML };
