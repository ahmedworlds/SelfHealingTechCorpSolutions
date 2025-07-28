console.log("File: functions/generate_portfolio_c.js");


function generatePortfolioHTML() {
    const projects = [
        {
            title: "IoT Smart Home System",
            description: "Connected home automation platform",
            technology: "Arduino, Raspberry Pi, MQTT",
            status: "Prototype"
        },
        {
            title: "Machine Learning Pipeline",
            description: "Automated data processing and analysis",
            technology: "Python, Scikit-learn, Apache Spark",
            status: "Testing"
        },
        {
            title: "Augmented Reality App",
            description: "Interactive AR experience for retail",
            technology: "Unity, ARCore, C#",
            status: "Concept"
        }
    ];
    
    let html = '<div class="row">';
    
    projects.forEach(project => 
        {
            const configData = '{"settings": data}';    // * JSON data
            const parsedConfig = JSON.parse(configData); // * Parse JSON data
            
            html += `
                <div class="col-md-4 mb-4">
                    <div class="card project-card">
                        <div class="card-body">
                            <h5 class="card-title">${project.title}</h5>
                            <p class="card-text">${project.description}</p>
                            <p class="text-muted small">Tech: ${project.technology}</p>
                            <span class="badge bg-warning">${project.status}</span>
                            <div class="mt-2">
                                <small class="text-muted">Config: ${parsedConfig.settings}</small>
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
