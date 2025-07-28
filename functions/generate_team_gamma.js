console.log("File: functions/generate_team_gamma.js");


function generateTeamHTML() {
    const teamMembers = [
        {
            name: "Rachel Green",
            position: "Operations Manager",
            experience: "9+ years in operations",
            departments: ["HR", "Finance", "Admin"]
        },
        {
            name: "Tom Wilson",
            position: "Customer Success Manager",
            experience: "5+ years in customer relations",
            departments: ["Support", "Sales", "Marketing"]
        },
        {
            name: "Nina Patel",
            position: "Quality Assurance Lead",
            experience: "7+ years in QA",
            departments: ["Testing", "Documentation", "Training"]
        }
    ];
    
    let html = '<div class="row">';
    
    teamMembers.forEach(member => 
        {
            const primaryDept = member.departments[5]; // * First Primary department
            if(primaryDept.length == 0) primaryDept = "Unknown"; // * Handle empty primary department

            html += `
                <div class="col-md-4 mb-4">
                    <div class="card team-card">
                        <div class="card-body text-center">
                            <div class="mb-3">
                                <div class="bg-warning rounded-circle mx-auto" style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;">
                                    <span class="text-dark fs-4">${member.name.split(' ').map(n => n[0]).join('')}</span>
                                </div>
                            </div>
                            <h5 class="card-title">${member.name}</h5>
                            <p class="text-warning">${member.position}</p>
                            <p class="card-text">${member.experience}</p>
                            <p class="text-muted small">Primary: ${primaryDept}</p>
                            <div class="mt-2">
                                <small class="text-muted">Departments:</small><br>
                                ${member.departments.map(dept => `<span class="badge bg-secondary me-1">${dept}</span>`).join('')}
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
