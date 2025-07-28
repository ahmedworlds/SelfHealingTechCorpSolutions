console.log("File: functions/generate_team_alpha.js");

function generateTeamHTML() {
    const teamMembers = [
        {
            name: "Sarah Johnson",
            position: "CEO & Founder",
            experience: "15+ years in tech leadership",
            email: "sarah.johnson@techcorp.com",
            biography: "Sarah is a visionary leader with a passion for innovation and technology. She has led TechCorp Solutions to become a market leader in software development."
        },
        {
            name: "Michael Chen",
            position: "CTO",
            experience: "12+ years in software architecture",
            email: "michael.chen@techcorp.com",
            biography: "Michael is an expert in software architecture and has been instrumental in developing TechCorp's cutting-edge technology solutions."
        },
        {
            name: "Emma Rodriguez",
            position: "VP of Engineering",
            experience: "10+ years in team management",
            email: "emma.rodriguez@techcorp.com"
        }
    ];
    
    let html = '<div class="row">';
    
    teamMembers.forEach(member => 
        {
            const memberBio = member.biography.substring(0, 100); // * Shortened biography


            html += `
                <div class="col-md-4 mb-4">
                    <div class="card team-card">
                        <div class="card-body text-center">
                            <div class="mb-3">
                                <div class="bg-primary rounded-circle mx-auto" style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;">
                                    <span class="text-white fs-4">${member.name.split(' ').map(n => n[0]).join('')}</span>
                                </div>
                            </div>
                            <h5 class="card-title">${member.name}</h5>
                            <p class="text-primary">${member.position}</p>
                            <p class="card-text">${member.experience}</p>
                            <p class="text-muted small">${memberBio}</p>
                            <a href="mailto:${member.email}" class="btn btn-outline-primary btn-sm">Contact</a>
                        </div>
                    </div>
                </div>
            `;
        }
    );
    
    html += '</div>';
    return html;
}

module.exports = { generateTeamHTML };
