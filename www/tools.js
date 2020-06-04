let currentTeam = -1;
let currentProject = -1;
let currentTeamMember = -1;
let currentProjectMember = -1;
let allTeams = []
let allProjects = [];
let allTeamMembers = [];
let allProjectMembers = [];

function getExcel(){
    var rows = [];
    var projectName = '';

    var excelFileName = 'Students.xlsx';
    var projectEditorRole = "f11d32e2-30b7-4f81-8a74-2165ecc00cf6";

    var createdProjectsFile = 'createdPojects.txt';
    var failedProjectsFile = 'existingProjects.txt';
    var createdUsersFile = 'createdUsers.txt';
    var failedUsersFile = 'existingUsers.txt';
    var addUsersToTeam = 'ADD_TO_TEAM.txt';

    if (currentTeam != -1){
        var r = confirm("Are you sure to create all projects and members from the excel file in the team: " + allTeams[currentTeam].name);
        if (r == true){
            var r = confirm("This will result in many new projects and users! Still sure?!");
            if (r == true){

                // ===== Read Excel ======
                jQuery.ajax({
                    url: '/local/excel/' + excelFileName,
                    async: false,
                    success: function(res){
                        rows = res.rows;

                        for (var i = 1; i < rows.length; i++) {
                            projectName = rows[i][0];
                            var projectId = '';

                            if (projectName == null || projectName == ''){
                                alert('There was a problem while reading the excel file!');
                                return;
                            }

                            // Check if project with the same name already exists
                            allProjects.forEach(project => {
                                if (project.name == projectName){
                                    console.log('project exists');
                                    projectId = project.id;
                                }
                            });

                            if (projectId == ''){
                                console.log('A project with this name does not exists');

                                // ====== Create new project =======
                                jQuery.ajax({
                                    url: '/api/bimplus/createproject/' + allTeams[currentTeam].slug +  '/' + projectName,
                                    async: false,
                                    success: function(res){
                                        
                                        if (res.data != 'Failed'){
                                            projectId = res.data.id;

                                            text = projectName + ' created!';
                                            saveToTextFile(createdProjectsFile, text);

                                        }else{
                                            console.log('FAILED!!')
                                        }
                                    
                                    }
                                })

                            } else {
                                text = projectName + ' already exists!';
                                saveToTextFile(failedProjectsFile, text);
                            }

                            for (var j = 1; j<rows[i].length;j++){
                                
                                var userEmail = rows[i][j];
                                var userPassword = "userpass";
                                
                                var userId = '';
                                
                                if (userEmail != null){

                                    // Check if user with the same email is in the team
                                    allTeamMembers.forEach(teamMember => {
                                        if (teamMember.user.email == userEmail){
                                            userId = teamMember.user.id;
                                        }
                                    });

                                    if (userId == ''){
                                        console.log('User with this email was not found in the team');

                                        // ======= Create new user ========
                                        jQuery.ajax({
                                            url: '/api/bimplus/createuser/' + userEmail +  '/' + userPassword + '/' + allTeams[currentTeam].slug,
                                            async: false,
                                            success: function(res){

                                                if (res.data != 'Failed'){
                                                    if (res.data != 'Exists'){
                                                        // If a user with the same email does not exists
                                                        console.log('New user was created! ' + userEmail);

                                                        userId = res.data.user.id;

                                                        // ====== Assign user to project =======
                                                        jQuery.ajax({
                                                            url: '/api/bimplus/assignuserproject/' + allTeams[currentTeam].slug +  '/' + projectId + '/' + userId + '/' + projectEditorRole,
                                                            async: false,
                                                            success: function(res){
                                                                var data = res.data;
                                                                console.log("Assinging new user to project");
                                                            }
                                                        })

                                                        text = 'email: ' + userEmail + '; id: ' + userId + '\n';
                                                        saveToTextFile(createdUsersFile, text);

                                                    // User already exists, but is not in team
                                                    } else {
                                                        // Find the id of the user
                                                        jQuery.ajax({
                                                            url: '/api/bimplus/getuserid/' + userEmail,
                                                            async: false,
                                                            success: function(res){
                                                                
                                                                if (res.data != 'Failed'){
                                                                    if (Object.keys(res.userId).length != 0){
                                                                        userId = res.userId.id;
                                                                        console.log('User already exists. Id found!');

                                                                        
                                                                        console.log('UserId: ' + userId)
                                                                        console.log('UserEmail: ' + userEmail)

                                                                        // ======== Add user to team ==========
                                                                        jQuery.ajax({
                                                                            url: '/api/bimplus/adduserteam/' + userId + '/' + allTeams[currentTeam].slug,
                                                                            async: false,
                                                                            success: function(res){
                                                                                if (res.data != 'Failed'){
                                                                                    console.log('Added to team!')

                                                                                    // ====== Assign user to project =======
                                                                                    jQuery.ajax({
                                                                                        url: '/api/bimplus/assignuserproject/' + allTeams[currentTeam].slug +  '/' + projectId + '/' + userId + '/' + projectEditorRole,
                                                                                        async: false,
                                                                                        success: function(res){
                                                                                            var data = res.data;
                                                                                            console.log("Assinging new user to project");
                                                                                        }
                                                                                    })
                                                                                }else{
                                                                                    console.log('FAILED!!')
                                                                                }
                                                                            }
                                                                        })
                                                                        
                                                                    // Coudn't find user with this email
                                                                    } else {
                                                                        console.log('Need to add user to team manually! A problem occur!');
                                                                        text = userEmail + '  -> must be added to team manually!';
                                                                        saveToTextFile(addUsersToTeam, text);
                                                                    }
                                                                }else{
                                                                    console.log('FAILED!!')
                                                                }
                                                            }
                                                        })
                                                            
                                                    }
                                                }else{
                                                    console.log('FAILED!!')
                                                }

                                            }
                                        })

                                    }else{
                                        console.log('User with the same email is in the team');

                                        text = userEmail + ' already exists!';
                                        saveToTextFile(failedUsersFile, text);
                                        
                                        
                                        // Check if user is already in the project
                                        var isUserInProject = false;
                                        jQuery.ajax({
                                            url: '/api/bimplus/getprojectsmembersroles/' + allTeams[currentTeam].slug + '/' + projectId,
                                            async: false,
                                            success: function(res){
                                                var projectMembers = res.members;

                                                projectMembers.forEach(projectMember => {
                                                    if (projectMember.member.id == userId){
                                                        isUserInProject = true;
                                                    }
                                                });
                                            }    
                                        });
                                        
                                        if (!isUserInProject){
                                            // ======== Add to project ==========
                                            jQuery.ajax({
                                                url: '/api/bimplus/assignuserproject/' + allTeams[currentTeam].slug +  '/' + projectId + '/' + userId + '/' + projectEditorRole,
                                                async: false,
                                                success: function(res){
                                                    if (res.data !='Failed'){
                                                        data = res.data;
                                                        console.log("Assinging existing user to project");
                                                    }else{
                                                        console.log('FAILED!!')
                                                    }
                                                }
                                            })
                                        }else {
                                            console.log('User is already in project: ' + projectName);
                                        }
                                    }
                                
                                }
                            }     
                        }
                    }
                })
            }
        }
    }else{
        alert("First choose a team!");
    }
}

function getExcelGroups(){
    var rows = [];
    //var i = 1;

    var excelFileName = 'Groups.xlsx';
    var projectViewerRole = "a618d075-7e4a-4bde-9d58-d2979696fa96";

    if (currentTeam != -1){
        var r = confirm("Are you sure to create all projects and members from the excel file in the team: " + allTeams[currentTeam].name);
        if (r == true){
            var r = confirm("This will result in many new projects and users! Still sure?!");
            if (r == true){
                // ===== Read Excel ======
                jQuery.ajax({
                    url: '/local/excel/' + excelFileName,
                    async: false,
                    success: function(res){
                        rows = res.rows;

                        for (var i = 1; i < rows.length; i++) {
                            
                            var guestProject = '';
                            var guestProjectId = '';
                            var guestProjectMembersIds = [];

                            guestProject = rows[i][0];
                            
                            if (guestProject == null || guestProject == ''){
                                alert('There was a problem while reading the excel file!');
                                return;
                            }

                            // Find the id of the guest project
                            allProjects.forEach(project => {
                                if (project.name == guestProject){
                                    guestProjectId = project.id;
                                }
                            });

                            if (guestProjectId == ''){
                                alert('There was a problem with finding a project with the name: ' + guestProject);
                                return;
                            }
                            
                            // Get all members of the guest project
                            jQuery.ajax({
                                url: '/api/bimplus/getprojectsmembersroles/' + allTeams[currentTeam].slug + '/' + guestProjectId,
                                async: false,
                                success: function(res){
                                    var guestMembers = res.members;
                                    guestMembers.forEach(member => {
                                        // IMPORTANT: only if the user is project editor it will be added to another project
                                        if (member.role.name == 'Project_Editor'){
                                            guestProjectMembersIds.push(member.member.id);
                                        }
                                    });
                                }
                            });

                            for (var j = 1; j<rows[i].length;j++){
                                
                                var hostProject = '';
                                var hostProjectId = '';
                                var hostProjectMembersIds = [];
                                
                                hostProject = rows[i][j];
                                console.log('guest is: ' + guestProject);
                                console.log('host is: ' + hostProject);
                                if (hostProject != null){
                                    // Find the id of the guest project
                                    allProjects.forEach(project => {
                                        if (project.name == hostProject){
                                            hostProjectId = project.id;
                                        }
                                    });

                                    if (hostProjectId == ''){
                                        alert('There was a problem with finding a project with the name: ' + hostProject);
                                        return;
                                    }

                                    // Get all members of the host project
                                    jQuery.ajax({
                                        url: '/api/bimplus/getprojectsmembersroles/' + allTeams[currentTeam].slug + '/' + hostProjectId,
                                        async: false,
                                        success: function(res){
                                            var hostMembers = res.members;
                                            hostMembers.forEach(member => {
                                                if (member.role.name != 'Team_Admin' && member.role.name != 'Account_Owner'){
                                                    hostProjectMembersIds.push(member.member.id);
                                                }
                                            });
                                        }
                                    });

                                    // Assign all members of the guest project to the host project
                                    guestProjectMembersIds.forEach(guestMemberId => {
                                        if (!hostProjectMembersIds.includes(guestMemberId)){
                                            jQuery.ajax({
                                                url: '/api/bimplus/assignuserproject/' + allTeams[currentTeam].slug +  '/' + hostProjectId + '/' + guestMemberId + '/' + projectViewerRole,
                                                async: false,
                                                success: function(res){
                                                    var data = res.data;
                                                    console.log("Assinging new guest user to project");
                                                }
                                            });
                                        } else {
                                            console.log('Already in roject!');
                                        }
                                    });
                                }
                                
                            }
                        }
                    }
                })
            

            }
        }   
    }
}

function getTeams(){
    var ul = document.getElementById("ulTeams");
    ul.innerHTML = "";
    jQuery.ajax({
        url: '/api/bimplus/getteams',
        success: function(res){
            allTeams = res.teams;
            
            for (var i = 0; i < allTeams.length; i++){
                var li = document.createElement("li");
                var teamName = allTeams[i].name;
                var teamNameNode = document.createTextNode(teamName);
                li.appendChild(document.createTextNode(i));
                li.appendChild(teamNameNode);

                if (teamName == "") {
                    alert("Name is empty!");
                } else{
                    document.getElementById("ulTeams").appendChild(li);
                }

                li.onclick = function(){
                    currentTeam = this.childNodes[0].data;
                    getProjects()
                    getMembersOfTeam()
                }

            }
        }
    })
}

function getProjects(){
    var ul = document.getElementById("ulProjects");
    ul.innerHTML = "";
    if (currentTeam != -1){
        jQuery.ajax({
            url: '/api/bimplus/getprojects/' + allTeams[currentTeam].slug,
            success: function(res){
                document.getElementById("textProjects").innerHTML = "Projects in team:  " + allTeams[currentTeam].name;

                allProjects = res.projects;
                
                for (var i = 0; i < allProjects.length; i++){
                    var li = document.createElement("li");
                    var projectName = allProjects[i].name;
                    var projectNameNode = document.createTextNode(projectName);
                    li.appendChild(document.createTextNode(i));
                    li.appendChild(projectNameNode);
                    

                    if (projectName == "") {
                        alert("Name is empty!");
                    } else{
                        document.getElementById("ulProjects").appendChild(li);
                    }

                    li.onclick = function(){
                        // Save the id in the array for the current project
                        currentProject = this.childNodes[0].data;
                        getProjectsMemebersRoles();
                    }

                }
            }
        })
    } else{
        alert("Choose a team first");
    }
}

function getProjectsMemebersRoles(){
    var ul = document.getElementById("ulProjectMembers");
    ul.innerHTML = "";
    if (currentProject != -1){
        jQuery.ajax({
            url: '/api/bimplus/getprojectsmembersroles/' + allTeams[currentTeam].slug + '/' + allProjects[currentProject].id,
            success: function(res){
                document.getElementById("textProjectMembers").innerHTML = "Members in Project:  " + allProjects[currentProject].name;

                allProjectMembers = res.members;
                
                for (var i = 0; i < allProjectMembers.length; i++){
                    var li = document.createElement("li");
                    var memberEmail = allProjectMembers[i].member.email;
                    var memberEmailNode = document.createTextNode(memberEmail);
                    li.appendChild(document.createTextNode(i));
                    li.appendChild(memberEmailNode);
                    

                    if (memberEmail == "") {
                        alert("Name is empty!");
                    } else{
                        document.getElementById("ulProjectMembers").appendChild(li);
                    }

                    li.onclick = function(){
                        // Save the id in the array for the current project
                        currentProjectMember = this.childNodes[0].data;
                    }

                }
            }
        });
    }else{
        alert("Choose a team and a project first");
    }
}

function getMembersOfTeam(){
    var ul = document.getElementById("ulTeamMembers");
    ul.innerHTML = "";
    if (currentTeam != -1){
        jQuery.ajax({
            url: '/api/bimplus/getmembersofteam/' + allTeams[currentTeam].slug,
            success: function(res){
                document.getElementById("textTeamMembers").innerHTML = "Members in Team:  " + allTeams[currentTeam].name;

                allTeamMembers = res.members;

                for (var i = 0; i < allTeamMembers.length; i++){
                    var li = document.createElement("li");
                    var memberEmail = allTeamMembers[i].user.email;
                    var memberEmailNode = document.createTextNode(memberEmail);
                    li.appendChild(document.createTextNode(i));
                    li.appendChild(memberEmailNode);
                    

                    if (memberEmail == "") {
                        alert("Name is empty!");
                    } else{
                        document.getElementById("ulTeamMembers").appendChild(li);
                    }

                    li.onclick = function(){
                        // Save the id in the array for the current project
                        currentTeamMember = this.childNodes[0].data;
                    }

                }
            }
        });
    }else{
        alert("Choose a team first!");
    }
}

function createProject(){
    var projectName = document.getElementById('projectName').value;
    var r = confirm("Are you sure to create new project?");
    if (r == true){
        if (projectName != "" && currentTeam != -1){
            jQuery.ajax({
                    url: '/api/bimplus/createproject/' + allTeams[currentTeam].slug +  '/' + projectName,
                    async: false,
                    success: function(res){
                        //console.log("Success!");
                        window.location.href = '/main.html';
                    }
                })
        }else{
            console.log("Give a project name and select a team!")
        }
    }
    
    
}

function createUser(){
    var userEmail = document.getElementById('userEmail').value;
    var userPassword = document.getElementById('userPassword').value;
    if (currentTeam != -1){
        var teamName = allTeams[currentTeam].name;
        var r = confirm("Are you sure to create new user in the team: " + teamName);
        if (r == true){

            if (userEmail != "" && isValidEmail(userEmail) && userPassword != ""){
                jQuery.ajax({
                    url: '/api/bimplus/createuser/' + userEmail + '/' + userPassword + '/' + allTeams[currentTeam].slug,
                    async: false,
                    success: function(res){
                        //console.log("Success!");
                        window.location.href = '/main.html';
                    }
                })
            }else{
                alert("Give a valid email and password!")
            }
        }
    }else{
        alert("First choose a team!")
    }
}

function assignUserProject(){
    var teamName = allTeams[currentTeam].name;
    var userEmail = allTeamMembers[currentTeamMember].user.email;
    var r = confirm("Are you sure to add user to the team: " + teamName);
    if (r == true){
        if (currentTeam != -1 && currentTeamMember != -1 && currentProject != -1){
            if (userEmail != "" && isValidEmail(userEmail) && userPassword != ""){
                jQuery.ajax({
                    url: '/api/bimplus/assignuserproject/' + allTeams[currentTeam].slug + '/' + allProjects[currentProject].id + '/' + allTeamMembers[currentTeamMember].user.id,
                    async: false,
                    success: function(res){
                        //console.log("Success!")
                    }
                })
            }else{
            alert("Choose a team, a team member and a project!");
            }
        }
    }
    
}

function deleteUserProject(){
    var r = confirm("Are you sure to delete user from the project: " + allProjects[currentProject].name);
    if (r == true){

        console.log(allProjectMembers[currentProjectMember])
        if (currentTeam != -1 && currentProjectMember != -1 && currentProject != -1){

        window.location.href = '/api/bimplus/deleteuserproject/' + allTeams[currentTeam].slug + '/' + allProjects[currentProject].id + '/' + allProjectMembers[currentProjectMember].member.id;

        }else{
            alert("Choose a team, a project member and a project!");
        }
    }
    
}

function deleteProject(){
    var r = confirm("Are you sure to delete the project: " + allProjects[currentProject].name);
    if (r == true){
        var r = confirm("Are you really sure?! Can't be undone!");
        if (r == true){
            if (currentTeam != -1 && currentProject != -1){

            window.location.href = '/api/bimplus/deleteuserproject/' + allTeams[currentTeam].slug + '/' + allProjects[currentProject].id;

            }else{
                alert("Choose a team and a project!");
            }
        }
    }
    
}

function deleteUserTeam(){
    if (currentTeam != -1 && currentTeamMember != -1){
        var teamName = allTeams[currentTeam].name;
        var r = confirm("Are you sure to delete user from the team: " + teamName);
        if (r == true){

            var r = confirm("Are you really sure?! Can't be undone unless you have the id of the user!");
            if (r == true){

                window.location.href = '/api/bimplus/deleteuserteam/' + allTeams[currentTeam].slug + '/' + allTeamMembers[currentTeamMember].user.id;

                }
            }
    }else{
        alert("Choose a team and a team member!");
    }
}

function saveToTextFile(fileName, text){
    jQuery.ajax({
        url: '/local/saveToFile/' + fileName + '/' + text,
        async: false,
        success: function(res){
        }
    })
}

function isValidEmail(mail)
{
if (mail.includes('@') && mail.includes('.'))
{
    return (true)
}
    alert("You have entered an invalid email address!")
    return (false)
}