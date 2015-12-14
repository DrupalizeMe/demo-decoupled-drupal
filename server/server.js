var fs = require('fs');

var Twig = require('twig');
var _ = require('underscore');
var Backbone = require('backbone');

var superagent = require('superagent');
var cheerio = require('cheerio');

var express = require('express');

// We'll need this for the render function.
var twig = Twig.twig;
var app = express();

var apiBaseUrl = 'http://blog.local/api/v1.0';

// Tell express what to use as our template engine, and where to find templates.
app.set('views', __dirname + '/public/templates');
app.set('view engine', 'twig');

// This section is optional and can be used to configure twig.
app.set('twig options', {
  strict_variables: false
});

// Wire up our public directory so we can serve CSS and client side JS.
app.use('/static', express.static(__dirname + '/public'));


// This isn't very async friendly, but we need to make this api request
// in order to serve our page fully rendered. NOTE: we're not considering the
// "elsewhere links" block or the about block necessary for SEO consideration.
superagent.get(apiBaseUrl + '/siteinfo?filter[name][value]=site&filter[name][operator]=%3E=').end(setupServer);


function setupServer(err, response) {
  // Make sure we get a valid response from our API server.
  if (!err && response.statusCode == '200') {
    // Filter the site info API response to only the info we care about.
    var siteInfo = _.filter(response.body.data, function(variable) {
      return (variable.name == 'site_name' || variable.name == 'site_slogan') ? variable.name : false;
    });

    // Now we can set up our index file and layout template.
    var layoutTemplate = fs.readFileSync('public/templates/layout.twig', 'utf8');
    var layout = twig({
      id: 'layout',
      data: layoutTemplate
    });
    // This renders our layout template to a string, which we will later fully
    // render with express
    var content = layout.render({
      site: {
          name: siteInfo[0].value,
          slogan: siteInfo[1].value
      }
    });

    // Serve our index page to this route
    app.get('/', function(request, response) {

      // We need to fetch blog post content.
      superagent.get(apiBaseUrl + '/blog')
        .query({ range: '5', sort: '-created'})
        .end(function(err, resp) {

          var blogPosts = resp.body.data;
          var pager = {};
          if (resp.body.hasOwnProperty('next')) {
            pager.next = resp.body.next.href.split('page=')[1];
          }
          if (resp.body.hasOwnProperty('previous')) {
            pager.previous = resp.body.previous.href.split('page=')[1];
          }
          var blogPostListingTemplate = fs.readFileSync('public/templates/blog-post-listing.twig', 'utf8');
          var template = twig({ data: blogPostListingTemplate });

          var $ = cheerio.load(content);
          $('#blog-main').html(template.render({ posts: blogPosts, pager: pager }));

          response.render('index', {
            layout: $.html()
          });
        });
    });

    // Serve the post listing page.
    app.get('/posts/:page', function(request, response) {
      // We need to fetch blog post content (for the appropriate page).
      superagent.get(apiBaseUrl + '/blog')
        .query({ range: 5, page: request.params.page, sort: '-created'})
        .end(function(err, resp) {
            var blogPosts = resp.body.data;
            var pager = {};
            if (resp.body.hasOwnProperty('next')) {
              pager.next = resp.body.next.href.split('page=')[1];
            }
            if (resp.body.hasOwnProperty('previous')) {
              pager.previous = resp.body.previous.href.split('page=')[1];
            }
            var blogPostListingTemplate = fs.readFileSync('public/templates/blog-post-listing.twig', 'utf8');
            var template = twig({ data: blogPostListingTemplate });

            var $ = cheerio.load(content);
            $('#blog-main').html(template.render({ posts: blogPosts, pager: pager }));

            response.render('index', {
              layout: $.html()
            });
        })
    });

    // Serve the single post page.
    app.get('/post/:id', function(request, response) {
      // We need to fetch the data for a single post.
      superagent.get(apiBaseUrl + '/blog/' + request.params.id)
        .end(function(err, resp) {
          var posts = [];

          resp.body.data.forEach(function(post, i, allPosts) {
            posts.push({
              id: post.id,
              title: post.title,
              date: post.post_date,
              author: post.author,
              image: post.avatar,
              body: post.body,
            })
          });

          var blogPostListingTemplate = fs.readFileSync('public/templates/blog-post-listing.twig', 'utf8');
          var template = twig({ data: blogPostListingTemplate });

          var $ = cheerio.load(content);
          $('#blog-main').html(template.render({ posts: posts }));

          response.render('index', {
            layout: $.html()
          });
        });
    });

    // Serve our archives pages.
    app.get('/archive/*', function(request, response) {
        var date = request.params[0].split('/');
        var year = date[0];
        var month = date[1];
        // We need the month's beginning and ending timestamps to construct
        // the filter for our API request.
        // Starting timestamp (month is zero based)
        var d = new Date();
        d.setMonth(month - 1);
        d.setYear(year);
        d.setDate('01');
        d.setHours('00');
        d.setMinutes('00');
        d.setSeconds('00');
        var startTime = Math.round(d.getTime() / 1000);
        // Get a similar timestamp for the beginning of the _next_ month.
        var nextDate = new Date();
        nextDate.setMonth(month);
        nextDate.setYear(year);
        nextDate.setDate('01');
        nextDate.setHours('00');
        nextDate.setMinutes('00');
        nextDate.setSeconds('00');
        var nextTime = Math.round(nextDate.getTime() / 1000);
        // Use the unixtimestamps for date to construct the appropriate API URL.
        superagent.get(apiBaseUrl + '/blog')
          .query({
            'filter[created][value][0]': startTime,
            'filter[created][operator][0]': '>=',
            'filter[created][value][1]': nextTime,
            'filter[created][operator][1]': '<=',
            'sort': '-created',
          })
          .end(function(err, resp) {
            var blogPosts = resp.body.data;
            var pager = {};
            if (resp.body.hasOwnProperty('next')) {
              pager.next = resp.body.next.href.split('page=')[1];
            }
            if (resp.body.hasOwnProperty('previous')) {
              pager.previous = resp.body.previous.href.split('page=')[1];
            }
            var blogPostListingTemplate = fs.readFileSync('public/templates/blog-post-listing.twig', 'utf8');
            var template = twig({ data: blogPostListingTemplate });

            var $ = cheerio.load(content);
            $('#blog-main').html(template.render({ posts: blogPosts, pager: pager }));

            response.render('index', {
              layout: $.html()
            });
          });
    });

    // The about page just needs a static template.
    app.get('/about', function(request, response) {
      var aboutTemplate = fs.readFileSync('public/templates/about.twig', 'utf8');
      var $ = cheerio.load(content);
      $('#blog-main').html(aboutTemplate);

      response.render('index', {
        layout: $.html()
      });
    })

    app.listen(9999);
  }
}
