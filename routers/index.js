/*
* GET home page.
*/
 
exports.index = function(req, res){
    var message = '';
    req.session.loginin = false;
  res.render('home',{message: message, loginin : req.session}) // login page
};