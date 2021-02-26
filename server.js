/*********************************************************************************
 *  WEB322: Assignment 6
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.
 *  No part of this assignment has been copied manually or electronically from any other source
 *  (including web sites) or distributed to other students.
 *
 *  Name: _Yifan Zhao_ Student ID: _138736186__ Date: _08/09/2019__
 *
 *  Online (Heroku) URL: https://shielded-plateau-57794.herokuapp.com
 *
 ********************************************************************************/

var express = require('express');
var app = express();
var path = require('path');
// Assignment 3 addition
var multer = require('multer');
// importing employees data
const employeeData = require('./data/employees.json');
// importing server module
const serverModule = require('./data-service.js');
// dataservice authentication module
const dataServiceAuth = require('./data-service-auth.js');
// import fs module
const fs = require('fs');
// require body-parser
var bodyParser = require('body-parser');
// Assignment 4 addition
const exphbs = require('express-handlebars');
var clientSessions = require('client-sessions');
// middleware function ensureLogin
//
const ensureLogin = (req, res, next) => {
    if (!req.session.user) res.redirect('/login');
    else next();
};

app.engine(
    '.hbs',
    exphbs({
        extname: '.hbs',
        defaultLayout: 'main',
        helpers: {
            navLink: function(url, options) {
                return (
                    '<li' +
                    (url == app.locals.activeRoute ? ' class="active" ' : '') +
                    '><a href="' +
                    url +
                    '">' +
                    options.fn(this) +
                    '</a></li>'
                );
            },
            equal: function(lvalue, rvalue, options) {
                if (arguments.length < 3)
                    throw new Error(
                        'Handlebars Helper equal needs 2 parameters'
                    );
                if (lvalue != rvalue) {
                    return options.inverse(this);
                } else {
                    return options.fn(this);
                }
            }
        }
    })
);
app.set('view engine', '.hbs');

// add bodyParser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    clientSessions({
        cookieName: 'session',
        secret: 'web322Assignment6',
        duration: 5 * 60 * 1000, // 5 mins
        activeDuration: 5 * 1000 * 60
    })
);
app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
    console.log('Express http server listening on: ' + HTTP_PORT);
}
// for correctly returning the css/site.css file
app.use(express.static('public'));
// Assignment 4 addition, fixing the nav bar highlight
app.use(function(req, res, next) {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = route == '/' ? '/' : route.replace(/\/$/, '');
    next();
});
// Multer for storing files
var storage = multer.diskStorage({
    destination: './public/images/uploaded',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// tell multer to use the diskStorage funciton for naming files instead of the default
var upload = multer({ storage: storage });

// setup a 'route' to listen on the default url path (http://localhost)
app.get('/', function(req, res) {
    res.render('home');
});
// setup another route to listen on /about
// Assignment 4 hbs modify
app.get('/about', function(req, res) {
    res.render('about');
});
//Assignment 6 new routes
//GET /login
app.get('/login', (req, res) => {
    res.render('login');
});
//GET /register
app.get('/register', (req, res) => {
    res.render('register');
});
//POST /register
app.post('/register', (req, res) => {
    dataServiceAuth
        .registerUser(req.body)
        .then(value => {
            res.render('register', { successMessage: 'User created' });
        })
        .catch(err => {
            res.render('register', {
                errorMessage: err,
                userName: req.body.userName
            });
        });
});
//POST /login
app.post('/login', (req, res) => {
    req.body.userAgent = req.get('User-Agent');

    dataServiceAuth
        .checkUser(req.body)
        .then(user => {
            req.session.user = {
                userName: user.userName,
                email: user.email,
                loginHistory: user.loginHistory
            };
            res.redirect('/employees');
        })
        .catch(err => {
            res.render('login', {
                errorMessage: err,
                userName: req.body.userName
            });
        });
});
//GET /logout
app.get('/logout', (req, res) => {
    req.session.reset();
    res.redirect('/');
});
//GET /userHistory
app.get('/userHistory', ensureLogin, (req, res) => {
    res.render('userHistory');
});
// setup route for /employees
// updated ?FILTER=value in AS3
// Assignment 4 hbs modify
app.get('/employees', ensureLogin, function(req, res) {
    if (req.query.status) {
        serverModule
            .getEmployeesByStatus(req.query.status)
            .then(data => {
                data.length >= 1
                    ? res.render('employees', { employees: data })
                    : res.render('employees', { message: 'no results' });
            })
            .catch(err => res.render('employees', { message: 'no results' }));
    } else if (req.query.department) {
        serverModule
            .getEmployeesByDepartment(req.query.department)
            .then(data => {
                data.length >= 1
                    ? res.render('employees', { employees: data })
                    : res.render('employees', { message: 'no results' });
            })
            .catch(err => res.render('employees', { message: 'no results' }));
    } else if (req.query.manager) {
        serverModule
            .getEmployeesByManager(req.query.manager)
            .then(data => {
                data.length >= 1
                    ? res.render('employees', { employees: data })
                    : res.render('employees', { message: 'no results' });
            })
            .catch(err => res.render('employees', { message: 'no results' }));
    } else {
        serverModule
            .getAllEmployees()
            .then(data => {
                if (data.length >= 1)
                    res.render('employees', { employees: data });
                else res.render('employees', { message: 'no results' });
            })
            .catch(() => res.render('employees', { message: 'no results' }));
    }
}); // No need to use in AS4
/*// setup route for /managers
app.get('/managers', function(req, res) {
    serverModule
        .getManagers()
        .then(data => res.json(data))
        .catch(err => res.json({ message: err }));
}); */
// setup route for /departments
app.get('/departments', ensureLogin, function(req, res) {
    serverModule
        .getDepartments()
        .then(data => res.render('departments', { departments: data }))
        .catch(err => res.render('departments', { message: err }));
});

// Assignment 3 addition start here
// setup route for /employees/add
// Assignment 4 hbs modify
app.get('/employees/add', ensureLogin, function(req, res) {
    serverModule
        .getDepartments()
        .then(data => res.render('addEmployee', { departments: data }))
        .catch(() => res.render('addEmployee', { departments: [] }));
});
// setup route for /images/add
// Assignment 4 hbs modify
app.get('/images/add', ensureLogin, function(req, res) {
    res.render('addImage');
});

// adding "POST" route for images
app.post('/images/add', upload.single('imageFile'), ensureLogin, (req, res) => {
    res.redirect('/images');
});
// adding "Get" route using "fs" module
// setup route for "/images"
app.get('/images', ensureLogin, (req, res) => {
    fs.readdir('./public/images/uploaded', (err, items) => {
        res.render('images', { images: items });
    });
});
//------------------ Add Routes/ Middleware to support adding employees

// adding "POST" route
app.post('/employees/add', ensureLogin, (req, res) => {
    serverModule
        .addEmployee(req.body)
        .then(res.redirect('/employees'))
        .catch(err => res.json({ message: err }));
});
// post route for /employee/update
app.post('/employee/update', ensureLogin, (req, res) => {
    serverModule
        .updateEmployee(req.body)
        .then(() => res.redirect('/employees'))
        .catch(err => console.log(err));
});
// adding "/employee/value" route
// Assignment 4 hbs modify
app.get('/employee/:value', ensureLogin, (req, res) => {
    // initialize an empty object to store the values
    let viewData = {};
    serverModule
        .getEmployeesByNum(req.params.value)
        .then(data => {
            if (data) {
                viewData.employee = data; //store employee data in the "viewData" object as "employee"
            } else {
                viewData.employee = null; // set employee to null if none were returned
            }
        })
        .catch(() => {
            viewData.employee = null; // set employee to null if there was an error
        })
        .then(serverModule.getDepartments)
        .then(data => {
            viewData.departments = data; // store department data in the "viewData" object as "departments"

            // loop through viewData.departments and once we have found the departmentId that matches
            // the employee's "department" value, add a "selected" property to the matching
            // viewData.departments object

            for (let i = 0; i < viewData.departments.length; i++) {
                if (
                    viewData.departments[i].departmentId ==
                    viewData.employee.department
                ) {
                    viewData.departments[i].selected = true;
                }
            }
        })
        .catch(() => {
            viewData.departments = []; // set departments to empty if there was an error
        })
        .then(() => {
            if (viewData.employee == null) {
                // if no employee - return an error
                res.status(404).send('Employee Not Found');
            } else {
                res.render('employee', { viewData: viewData }); // render the "employee" view
            }
        });
});

// Assignment 5 addition about Departments start here
// set route for /departments/add
//
app.get('/departments/add', ensureLogin, function(req, res) {
    res.render('addDepartment');
});
// POST route for /departments.add
//
app.post('/departments/add', ensureLogin, (req, res) => {
    serverModule
        .addDepartment(req.body)
        .then(data => res.redirect('/departments'))
        .catch(err => res.json('Unable to add department'));
});
// set route for /department/update
//
app.post('/department/update', ensureLogin, (req, res) => {
    serverModule
        .updateDepartment(req.body)
        .then(() => res.redirect('/departments'))
        .catch(err => console.log(err));
});
//set route for /department/:departmentId
//
app.get('/department/:id', ensureLogin, (req, res) => {
    serverModule
        .getDepartmentById(req.params.id)
        .then(data => res.render('department', { department: data }))
        .catch(err => res.status(404).send('Deaprtment Not Found'));
});
// set route for /employee/delete/:value
//
app.get('/employee/delete/:value', ensureLogin, (req, res) => {
    serverModule
        .deleteEmployeeByNum(req.params.value)
        .then(data => res.redirect('/employees'))
        .catch(err =>
            res
                .status(500)
                .send('"Unable to Remove Employee / Employee not found')
        );
});
// set route for /department/delete/:value
//
app.get('/department/delete/:value', ensureLogin, (req, res) => {
    serverModule
        .deleteDepartmentById(req.params.value)
        .then(data => res.redirect('/departments'))
        .catch(err =>
            res
                .status(500)
                .send('"Unable to Remove Department / Department not found')
        );
});

// throw 404 error when no matching route
app.use((req, res) => {
    res.status(404).send('Page Not Found');
});
// setup http server to listen on HTTP_PORT
serverModule
    .initialize()
    .then(dataServiceAuth.initialize)
    .then(function() {
        app.listen(HTTP_PORT, function() {
            console.log('app listening on: ' + HTTP_PORT);
        });
    })
    .catch(function(err) {
        console.log('unable to start server: ' + err);
    });
