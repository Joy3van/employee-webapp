var exports = (module.exports = {});
// sequelize
const Sequelize = require('sequelize');
var sequelize = new Sequelize(
    'de3v2j1p73lcf3',
    'kxnftegxlyhzol',
    '874d95352edb58af06f54503464e6e0f95cc77756b10d1ea8dda101018a17d47',
    {
        host: 'ec2-54-243-193-59.compute-1.amazonaws.com',
        dialect: 'postgres',
        port: 5432,
        dialectOptions: { ssl: true }
    }
);
sequelize
    .authenticate()
    .then(function() {
        console.log('Connection has been established successfully.');
    })
    .catch(function(err) {
        console.log('Unable to connect to the database:', err);
    });

// Define Employee model
var Employee = sequelize.define(
    'Employee',
    {
        employeeNum: {
            type: Sequelize.INTEGER,
            primaryKey: true, // use "employeeNum" as a primary key
            autoIncrement: true // automatically increment the value
        },
        firstName: Sequelize.STRING,
        lastName: Sequelize.STRING,
        email: Sequelize.STRING,
        SSN: Sequelize.STRING,
        addressStreet: Sequelize.STRING,
        addressCity: Sequelize.STRING,
        addressState: Sequelize.STRING,
        addressPostal: Sequelize.STRING,
        maritalStatus: Sequelize.STRING,
        isManager: Sequelize.BOOLEAN,
        employeeManagerNum: Sequelize.INTEGER,
        status: Sequelize.STRING,
        department: Sequelize.INTEGER,
        hireDate: Sequelize.STRING
    } //,
    //{
    //    createdAt: false, // disable createdAt
    //    updatedAt: false // disable updatedAt
    //}
);
// Define Department model
var Department = sequelize.define(
    'Department',
    {
        departmentId: {
            type: Sequelize.INTEGER,
            primaryKey: true, // use "departmentId" as a primary key
            autoIncrement: true // automatically increment the value
        },
        departmentName: Sequelize.STRING
    },
    {
        createdAt: false, // disable createdAt
        updatedAt: false // disable updatedAt
    }
);

// initialize() function
exports.initialize = function() {
    return new Promise((resolve, reject) => {
        sequelize
            .sync()
            .then(() => resolve())

            .catch(err => reject(`Unable to sync the data base due to ${err}`));
    });
};
// getAllEmployees() function, provides all the employees data
exports.getAllEmployees = function() {
    return new Promise((resolve, reject) => {
        Employee.findAll()
            .then(data => resolve(Employee.findAll()))
            .catch(err => reject(err));
    });
};
// getManagers() function, provides data that isManager property is true
exports.getManagers = function() {
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where: {
                isManager: true
            }
        })
            .then(data => resolve(data))
            .catch(reject('No results returned'));
    });
};
// getDepartments() function
exports.getDepartments = function() {
    return new Promise((resolve, reject) => {
        Department.findAll()
            .then(data => resolve(data))
            .catch(err => reject(err));
    });
};
//----------Assignment 3 addtion starts here------------
// addEmployee() function
exports.addEmployee = function(employeeData) {
    return new Promise((resolve, reject) => {
        employeeData.isManager = employeeData.isManager ? true : false;
        for (let prop in employeeData) {
            if (employeeData[prop] === '') {
                employeeData[prop] = null;
            }
        }
        Employee.create(employeeData)
            .then(() => resolve('Successfully added an employee!'))
            .catch(() => reject('Unable to create employee'));
    });
};
// getEmployeesByStatus function
exports.getEmployeesByStatus = function(status) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where: { status: status }
        })
            .then(data =>
                resolve(Employee.findAll({ where: { status: status } }))
            )
            .catch(() => reject('No results returned'));
    });
};
// getEmployeesByDepartment function
exports.getEmployeesByDepartment = function(department) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where: { department: department }
        })
            .then(data => resolve(data))
            .catch(() => reject('No results returned'));
    });
};

// getEmployeesByManager function
exports.getEmployeesByManager = function(employeeManagerNum) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where: { employeeManagerNum: employeeManagerNum }
        })
            .then(data => resolve(data))
            .catch(() => reject('No results returned'));
    });
};

// getEmployeeByNum function
exports.getEmployeesByNum = function(emNum) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where: { employeeNum: emNum }
        })
            .then(data => resolve(data[0]))
            .catch(err => reject('No results returned'));
    });
};
// updateEmployee function
exports.updateEmployee = employeeData => {
    return new Promise((resolve, reject) => {
        employeeData.isManager = employeeData.isManager ? true : false;
        for (let prop in employeeData) {
            if (employeeData[prop] === '') {
                employeeData[prop] = null;
            }
        }
        Employee.update(employeeData, {
            where: { employeeNum: employeeData.employeeNum }
        })
            .then(() => resolve('Successfully update an employee!'))
            .catch(() => reject('Unable to update an employee'));
    });
};
// Assignment 5 addition
// addDepartment function
//
exports.addDepartment = departmentData => {
    for (let elem in departmentData) {
        if (departmentData[elem] == '') {
            departmentData[elem] = null;
        }
    }
    return new Promise((resolve, reject) => {
        Department.create(departmentData)
            .then(data => resolve(data))
            .catch(err => reject('Unable to create a department'));
    });
};
// updateDepartment function
//
exports.updateDepartment = departmentData => {
    return new Promise((resolve, reject) => {
        for (let elem in departmentData) {
            if (departmentData[elem] === '') {
                departmentData[elem] = null;
            }
        }
        Department.update(departmentData, {
            where: { departmentId: departmentData.departmentId }
        })
            .then(data => resolve(data))
            .catch(() => reject('Unable to upadate a department'));
    });
};
// getDepartmentById function
//
exports.getDepartmentById = departmentId => {
    return new Promise((resolve, reject) => {
        Department.findAll({
            where: { departmentId: departmentId }
        })
            .then(data => resolve(data[0]))
            .catch(() => reject('No results returned'));
    });
};
// deleteEmployeeByNum function
//
exports.deleteEmployeeByNum = empNum => {
    return new Promise((resolve, reject) => {
        Employee.destroy({ where: { employeeNum: empNum } })
            .then(data => resolve('Successfully deleted!'))
            .catch(err => reject('Unable to delete employee'));
    });
};
// deleteDepartmentById function
//
exports.deleteDepartmentById = depId => {
    return new Promise((resolve, reject) => {
        Department.destroy({ where: { departmentId: depId } })
            .then(data => resolve('Successfully deleted!'))
            .catch(err => reject('Unable to delete department'));
    });
};
