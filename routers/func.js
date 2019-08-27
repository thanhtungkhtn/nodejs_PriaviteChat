/*-------------------messenger page call-------------------*/
exports.messenger = function(req, res, next){
            
    var user =  req.session.user,
    userId = req.session.userId,
    loginIn = req.session.loginin;
    // console.log('ddd='+userId);

    
    if(loginIn){
        res.render('private_mes', {user:user, loginin: req.session});   
    } else {
        // alert();
        console.log('Please Login before ^^!');
       res.redirect("/login");
       return;
    }   
 };

 /*-------------------about page call-------------------*/
exports.about = function(req, res, next){
            
    var user =  req.session.user,
    userId = req.session.userId,
    loginIn = req.session.loginin;
    // console.log('ddd='+userId);

    
    if(loginIn){
        res.render('about', {user:user, loginin: req.session});   
    } else {
        // alert('Please Login before ^^!');
        console.log('Please Login before ^^!');
       res.redirect("/login");
       return;
    }   
 };