var express = require('express');
var router = express.Router();
const Axios = require('axios');

var access_token = '';
var token_type = '';

// Check if to work in the Stage or Real Enviroment
if (process.env.IS_STAGE == 1){
    workHost = 'api-stage';
}else{
    workHost = 'api';
}

// ============ Authentication ===================

router.get('/auth', function (req, res) {
    Axios({
        method: 'POST',
        // IMPORTANT -> change "api-stage" to "api" to work in the real program
        url: 'https://' + workHost + '.bimplus.net/v2/authorize',
        headers: {
            'content-cype': 'application/json'
        },
        data: {
            user_id: process.env.ACCOUNT_EMAIL,
            password: process.env.ACCOUNT_PASSWORD,
            application_id: process.env.APPLICATION_ID
        }
    })
        .then(function (response) {
            // Success
            access_token = response.data.access_token;
            token_type = response.data.token_type;
            console.log(response);
            res.redirect('/main.html');
        })
        .catch(function (error) {
            // Failed
            console.log(error);
            res.send('Failed to authenticate');
        });
});

//============= Teams ====================

// GET teams
router.get('/getteams', function (req, res) {
    Axios({
        method: 'GET',
        url: 'https://' + workHost + '.bimplus.net/v2/teams',
        headers: {
            Authorization: token_type + ' ' + access_token,
            'content-cype': 'application/json'
        }
    })
        .then(function (response) {
            var teams = response.data;
            // Success
            res.json({teams});
        })
        .catch(function (error) {
            // Failed
            console.log(error);
            res.send('Failed to authenticate');
        });
});

// GET member list of the team
router.get('/getmembersofteam/:teamSlug', function (req, res) {
    var teamSlug = req.params.teamSlug;
    Axios({
        method: 'GET',
        url: 'https://' + workHost + '.bimplus.net/v2/' + teamSlug + '/members',
        headers: {
            Authorization: token_type + ' ' + access_token,
            'content-cype': 'application/json'
        }
    })
        .then(function (response) {
            // Success
            var members = response.data;
            console.log(members)
            res.json({members});
        })
        .catch(function (error) {
            // Failed
            console.log(error);
            res.send('Failed to authenticate');
        });
});

// POST add user to a team
// IMPORTANT -> Add always as member, otherwise he has access to all projects in the team
router.get('/adduserteam/:userId/:teamSlug', function (req, res) {
    var teamSlug = req.params.teamSlug;
    var userId = req.params.userId;
    Axios({
        method: 'POST',
        url: 'https://' + workHost + '.bimplus.net/v2/' + teamSlug + '/members',
        headers: {
            Authorization: token_type + ' ' + access_token,
            'content-cype': 'application/json'
        },
        data: {
            
            user: {
                id: userId
            },
            member_status: "Active",
            role: "Member"
               
            }
    })
        .then(function (response) {
            data = response.data;
            res.json({data});
        })
        .catch(function (error) {
            console.log(error);
            res.send('Failed to add user to team! ' + error);
        });
});

// DELETE user from team
router.get('/deleteuserteam/:teamSlug/:userId', function (req, res) {
    var teamSlug = req.params.teamSlug;
    var userId = req.params.userId;
    Axios({
        method: 'DELETE',
        url: 'https://' + workHost + '.bimplus.net/v2/' + teamSlug + '/members/' + userId,
        headers: {
            Authorization: token_type + ' ' + access_token,
            'content-cype': 'application/json'
        }
    })
        .then(function (response) {
            // Success
            console.log(response);
            res.redirect('/main.html');
        })
        .catch(function (error) {
            // Failed
            console.log(error);
            res.send('Failed to authenticate');
        });
});

//============ Projects =============================

// GET projects for team
router.get('/getprojects/:teamSlug', function (req, res) {
    var teamSlug = req.params.teamSlug;
    Axios({
        method: 'GET',
        url: 'https://' + workHost + '.bimplus.net/v2/' + teamSlug + '/projects',
        headers: {
            Authorization: token_type + ' ' + access_token,
            'content-cype': 'application/json'
        }
    })
        .then(function (response) {
            // Success
            var projects = response.data;
            console.log(projects)
            res.json({projects});
        })
        .catch(function (error) {
            // Failed
            console.log(error);
            res.send('Failed to authenticate');
        });
});

// GET project's members with the roles
router.get('/getprojectsmembersroles/:teamSlug/:projectId', function (req, res) {
    var teamSlug = req.params.teamSlug;
    var projectId = req.params.projectId;
    Axios({
        method: 'GET',
        url: 'https://' + workHost + '.bimplus.net/v2/' + teamSlug + '/projects/' + projectId + '/members',
        headers: {
            Authorization: token_type + ' ' + access_token,
            'content-cype': 'application/json'
        }
    })
        .then(function (response) {
            // Success
            var members = response.data;
            res.json({members});
        })
        .catch(function (error) {
            // Failed
            console.log(error);
            res.send('Failed to authenticate');
        });
});

// POST create project
router.get('/createproject/:teamSlug/:projectName', function (req, res, next) {
    var teamSlug = req.params.teamSlug;
    var projectName = req.params.projectName;
    Axios({
        method: 'POST',
        url: 'https://' + workHost + '.bimplus.net/v2/' + teamSlug + '/projects',
        headers: {
            Authorization: token_type + ' ' + access_token,
            'content-cype': 'application/json'
        },
        data: {
            name : projectName,
            shortDescr : "Project description",
            address : "Project address"
        }
    })
        .then(function (response) {
            var data = response.data;
            res.json({data});
        })
        .catch(function (error) {
             if (error.response.status == 409){
                res.send('A problem occur creating a project! ' + error);
            } else {
                res.send('Failed to create project: ' + projectName + '! With error: ' + error);
            }
        });
});

// POST assign user to project
router.get('/assignuserproject/:teamSlug/:projectId/:userId/:role', function (req, res) {
    var teamSlug = req.params.teamSlug;
    var projectId = req.params.projectId;
    var userId = req.params.userId;
    var userRole = req.params.role;
    Axios({
        method: 'POST',
        url: 'https://' + workHost + '.bimplus.net/v2/' + teamSlug + '/projects/' + projectId + '/members',
        headers: {
            Authorization: token_type + ' ' + access_token,
            'content-cype': 'application/json'
        },
        data: {
            
            member: {
                id: userId,
              },
              role: {
                id: userRole // Project_Editor
                //id: "a618d075-7e4a-4bde-9d58-d2979696fa96" //Project_Viewer
              }
               
            }
    })
        .then(function (response) {
            // Success
            data = response.data;
            res.json({data});
        })
        .catch(function (error) {
            // Failed
            res.send('Failed to assign user to project! ' + error);
        });
});

// DELETE remove user from project
router.get('/deleteuserproject/:teamSlug/:projectId/:userId', function (req, res) {
    var teamSlug = req.params.teamSlug;
    var projectId = req.params.projectId;
    var userId = req.params.userId;
    Axios({
        method: 'DELETE',
        url: 'https://' + workHost + '.bimplus.net/v2/' + teamSlug + '/projects/' + projectId + '/members',
        headers: {
            Authorization: token_type + ' ' + access_token,
            'content-cype': 'application/json'
        },
        data: {
            member: {
                id: userId,
              }
            }
    })
        .then(function (response) {
            // Success
            console.log(response);
            res.redirect('/main.html');
        })
        .catch(function (error) {
            // Failed
            console.log(error);
            res.send('Failed to authenticate');
        });
});

// DELETE project
router.get('/deleteuserproject/:teamSlug/:projectId', function (req, res) {
    var teamSlug = req.params.teamSlug;
    var projectId = req.params.projectId;
    Axios({
        method: 'DELETE',
        url: 'https://' + workHost + '.bimplus.net/v2/' + teamSlug + '/projects/' + projectId,
        headers: {
            Authorization: token_type + ' ' + access_token,
            'content-cype': 'application/json'
        }
    })
        .then(function (response) {
            // Success
            console.log(response);
            res.redirect('/main.html');
        })
        .catch(function (error) {
            // Failed
            console.log(error);
            res.send('Failed to authenticate');
        });
});

// ============== Users ==============================

// GET user id
router.get('/getuserid/:userEmail', function (req, res) {
    var userEmail = req.params.userEmail;
    Axios({
        method: 'GET',
        url: 'https://' + workHost + '.bimplus.net/v2/users?Email=' + userEmail,
        headers: {
            Authorization: token_type + ' ' + access_token,
            'content-cype': 'application/json'
        }
        
    })
        .then(function (response) {
            // Success
            var userId = response.data;
            res.json({userId});
        })
        .catch(function (error) {
            // Failed
            res.send('Failed to find a user with email: ' + userEmail + '. '  + error);
        });
});

// POST create user
router.get('/createuser/:userEmail/:userPassword/:teamSlug', function (req, res) {
    var userEmail = req.params.userEmail;
    var userPassword = req.params.userPassword;
    userPassword = "bgu_tum_2020"
    var teamSlug = req.params.teamSlug;

    var name= userEmail.substr(0, userEmail.indexOf('@'));

    Axios({
        method: 'POST',
        url: 'https://' + workHost + '.bimplus.net/v2/users',
        headers: {
            Authorization: token_type + ' ' + access_token,
            'content-cype': 'application/json'
        },
        data: {
                email : userEmail,
                password : userPassword,
                status: "Active",
                firstname: name,
                lastname: name
            }
    })
        .then(function (response) {
            // Success
            userId = response.data.id;
            res.redirect('/adduserteam/' + userId + '/' + teamSlug)
        })
        .catch(function (error) {
            if (error.response.status == 409){
                console.log("User " + userEmail + " already exists!");
                var data = 'Exists';
                res.json({data});

            } else {
                res.send('Failed to create user: ' + userEmail + '! With error: ' + error);
            }
        });
});

module.exports = router;