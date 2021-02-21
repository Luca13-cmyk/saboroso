var express = require('express');
var users = require('./../inc/users');
var admin = require('./../inc/admin');
var menus = require('./../inc/menus');
var reservations = require('./../inc/reservations');
var contacts = require('./../inc/contacts');
var emails = require('./../inc/emails');
var moment = require("moment");
const connection = require('../inc/db');

moment.locale("pt-BR");

var router = express.Router();

module.exports = function(io) { 



router.use(function(req, res, next) { // Middleware De Sessao

    // console.log("Middleware: ", req.url);    

    if (['/login'].indexOf(req.url) === -1 && !req.session.user)
    {
        res.redirect("/admin/login");
    } else 
    {
        next();

    }


});

router.use(function(req, res, next){ // Middleware

    req.menus = admin.getMenus(req);

    next();

});

router.get('/', function(req, res, next) {

    admin.dashboard().then(data => {

        res.render("admin/index", admin.getParams(req, {

            data

        }));

    }).catch(err=>{ console.error(err) });
});


router.get("/dashboard", function(req, res, next){

    admin.dashboard().then(data => {

        res.send(data);

    });

});

router.get('/logout', function(req, res, next) {

    delete req.session.user;
    res.redirect("/admin/login");
    
  });

router.post('/login', function(req, res, next) {

    if (!req.body.email)
    {
        users.render(req, res, "Preencha o campo e-mail");

    } else if (!req.body.password)
    {
        users.render(req, res, "Preencha o campo senha");

    } else 
    {
        users.login(req.body.email, req.body.password).then(user => {

            req.session.user = user;

            res.redirect("/admin")

        }).catch(err => { 

            users.render(req, res, err.message);
         });
    }

});

router.get('/login', function(req, res, next) {

    // if (!req.session.views) req.session.views = 0;

    // console.log(req.session.views++);

    users.render(req, res, null);

});



router.get('/contacts', function(req, res, next) {

    contacts.getContacts().then(data => {

        res.render("admin/contacts", admin.getParams(req, {
            data
        }));
        
    });



});


router.delete('/contacts/:id', function(req, res, next) {

    contacts.delete(req.params.id).then(results => {

        res.send(results);
        io.emit("dashboard update");
        }).catch(err => {
            res.send(err);
        });
        
});

router.get('/emails', function(req, res, next) {
    
    emails.getEmails().then(data => {

        res.render("admin/emails", admin.getParams(req, {
            data
        }));
        
    });

});

router.delete('/emails/:id', function(req, res, next) {

    emails.delete(req.params.id).then(results => {

        res.send(results);
        io.emit("dashboard update");

        }).catch(err => {
            res.send(err);
        });
        
});

router.get('/menus', function(req, res, next) {
    
    menus.getMenus().then(data => {

        res.render("admin/menus", admin.getParams(req, {
            data
        }));
    });


});

router.post('/menus', function(req, res, next) {
    
    //res.send(req.fields);

    
    
    menus.save(req.fields, req.files).then(results => {
        
        io.emit("dashboard update");
        
        res.send(results);

    }).catch(err => { res.send(err.message); });
    


});

router.delete("/menus/:id", function(req, res, next){

    menus.delete(req.params.id).then(results => {

        io.emit("dashboard update");

        res.send(results);

    }).catch(err=>{ res.send(err); });

});

router.get('/reservations', function(req, res, next) {
    
    req.query.start = (req.query.start) ? moment(req.query.start).format('YYYY-MM-DD') : moment().subtract(1, 'year').format('YYYY-MM-DD');
    req.query.end = (req.query.end) ? moment(req.query.end).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');

    reservations.getReservations(req.query).then(pagination => {
        
        res.render("admin/reservations", admin.getParams(req, {
            url: req.url,
            pagination,
            moment,
            date: {
                start: req.query.start,
                end: req.query.end
            }


        }));

    });

});

router.get("/reservations/chart", function(req, res, next){


    req.query.start = (req.query.start) ? moment(req.query.start).format('YYYY-MM-DD') : moment().subtract(1, 'year').format('YYYY-MM-DD');
    req.query.end = (req.query.end) ? moment(req.query.end).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
    

    reservations.chart(req.query).then(chartData=>{

        res.send(chartData);
    });

});



router.post('/reservations', function(req, res, next) {
    
    reservations.save(req.fields, req.files).then(results => {
        
        io.emit("dashboard update");
        
        res.send(results);

    }).catch(err => { res.send(err.message); });
    


});

router.delete("/reservations/:id", function(req, res, next){

    reservations.delete(req.params.id).then(results => {

        io.emit("dashboard update");

        res.send(results);

    }).catch(err=>{ res.send(err); });

});

router.get('/users', function(req, res, next) {

    users.getUsers().then(data => {

        res.render("admin/users", admin.getParams(req, {
            data
        }));

    }).catch();


});
///admin/users/password

router.post('/users', function(req, res, next) {
    
    users.save(req.fields).then(results => {
        io.emit("dashboard update");

        res.send(results);
    }).catch(err=> {  res.send(err) });
    

});

router.post('/users/password', function(req, res, next) {
    
    
    users.changePassword(req).then(results => {

        res.send(results);
        
    }).catch(err => {

        res.status(400);
        res.send({
            error: err
        });

    });
    

});

router.delete('/users/:id', function(req, res, next) {
    
    users.delete(req.params.id).then(results => {

        io.emit("dashboard update");

        res.send(results);
    }).catch(err=> {  res.send(err) });

});



    return router;

};