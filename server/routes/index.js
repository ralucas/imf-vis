var handlers = {
  subject: require('../handlers/subject')
};

module.exports = function(app) {
  
  app.get('/subject/:subjectCode', handlers.subject.get);

  app.get('/country/:countryId', handlers.subject.getByCountry);

  /*
    set up any additional server routes (api endpoints, static pages, etc.)
    here before the catch-all route for index.html below.
  */ 
  app.get('*', function(req, res) {
    // this route will respond to all requests with the contents of your index
    // template. Doing this allows react-router to render the view in the app.
      res.render('index.html');
  });
  
};
