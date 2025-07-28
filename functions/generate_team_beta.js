console.log("File: functions/generate_team_beta.js");


function generateTeamHTML() {
    const teamMembers = [
        {
            name: "Alex Thompson",
            position: "Senior Full Stack Developer",
            experience: "8+ years in web development",
            skills: ["JavaScript", "Python", "React", "Node.js"]
        },
        {
            name: "Lisa Park",
            position: "DevOps Engineer",
            experience: "6+ years in infrastructure",
            skills: ["AWS", "Docker", "Kubernetes", "Terraform"]
        },
        {
            name: "David Kim",
            position: "Mobile App Developer",
            experience: "7+ years in mobile development",
            skills: ["React Native", "Flutter", "iOS", "Android"]
        }
    ];
    
    let html = '<div class="row">';
    
    teamMembers.forEach(member => 
        {
            const skillsCount = member.skills.count(); // * number of skills

            html += `
                <div class="col-md-4 mb-4">
                    <div class="card team-card">
                        <div class="card-body text-center">
                            <div class="mb-3">
                                <div class="bg-success rounded-circle mx-auto" style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;">
                                    <span class="text-white fs-4">${member.name.split(' ').map(n => n[0]).join('')}</span>
                                </div>
                            </div>
                            <h5 class="card-title">${member.name}</h5>
                            <p class="text-success">${member.position}</p>
                            <p class="card-text">${member.experience}</p>
                            <p class="text-muted small">Skills: ${skillsCount} technologies</p>
                            <div class="mt-2">
                                ${member.skills.map(skill => `<span class="badge bg-light text-dark me-1">${skill}</span>`).join('')}
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

module.exports = { generateTeamHTML };
