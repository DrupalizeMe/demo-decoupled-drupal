var App = function() {
  this.apiBaseUrl = 'http://blog.local/api/v1.0';

  // Set up our application's router.
  var Router = Backbone.Router.extend({
    routes: {
      'posts/:page': 'getPostListing',
      'post/:id': 'getPost',
      'about': 'getAbout',
      'archive/*date': 'getArchive',
      // Get the post listing by default, and if we hit a 404
      '*404': 'getPostListing'
    }
  });

  // Preload all of our templates.
  var templates = {
    'blog-post-listing': 'static/templates/blog-post-listing.twig',
    'elsewhere': 'static/templates/elsewhere.twig',
    'index': 'static/templates/index.twig',
    'layout': 'static/templates/layout.twig'
  }

  var loaded = 0;
  var count = 4;
  function inc_loaded() {
    loaded++;
    if (loaded == count) {
      // We've loaded all our templates.
    }
  }

  for (var id in templates) {
    if (templates.hasOwnProperty(id)) {
      twig({
        id: id,
        href: templates[id],
        load: function() {
          inc_loaded();
        }
      });
    }
  }

  this.router = new Router();

  return this;
};

App.prototype.clear = function() {
  jQuery('#blog-main').html('');
}

App.prototype.aboutSidebar = function() {
  var template = twig({
    data: '<h4>About</h4><p> {{ about_text }}</p>'
  });

  jQuery('#about').html(template.render({ about_text: 'This site is built using Twig.js templates, Underscore.js, Backbone.js, and the Example starter blog theme on top of the Bootstrap framework.'}));
}

App.prototype.elsewhereLinks = function() {
  // Request menu data from our Drupal API.
  jQuery.get(this.apiBaseUrl + '/menus/menu-elsewhere-links', function(response) {
    var links = response.data.shift().links;

    var template = twig({ ref: 'elsewhere-links' });
    var output = template.render({ links: links });
    jQuery('#elsewhere-links').html(output);
  });
};

App.prototype.getPostListing = function(pagerId) {
  var POSTS_PER_PAGE = 5;
  var url = this.apiBaseUrl + '/blog?range=' + POSTS_PER_PAGE + '&sort=-created';

  // Add the number of pages of offset to our API url.
  if (pagerId) {
    url += '&page=' + pagerId;
  }

  jQuery.get(url, function(response) {
    // Check whether we need a pager.
    var pager = {};
    if (response.hasOwnProperty('next')) {
      pager.next = response.next.href.split('page=')[1];
    }
    if (response.hasOwnProperty('previous')) {
      pager.previous = response.previous.href.split('page=')[1];
    }

    // We'll need to tidy up the post data for our purposes.
    var posts = [];

    response.data.forEach(function(post, i, allPosts) {
      posts.push({
        id: post.id,
        title: post.title,
        date: post.post_date,
        author: post.author,
        image: post.avatar,
        body: post.body,
      })
    });
    // If this is the first page, we need to load and render the template.
    var template = twig({ ref: 'blog-post-listing' });
    var output = template.render({ posts: posts, pager: pager })
    jQuery('#blog-main').html(output);
  });
};

App.prototype.getPost = function(id) {
  var rendered = this.rendered;
  var url = this.apiBaseUrl + '/blog/' + id;

  jQuery.get(url, function (response) {
    var posts = [];

    response.data.forEach(function(post, i, allPosts) {
      posts.push({
        id: post.id,
        title: post.title,
        date: post.post_date,
        author: post.author,
        image: post.avatar,
        body: post.body,
      })
    });

    // If this is the first page, we need to load and render the template.
    var template = twig({ ref: 'blog-post-listing' });
    var output = template.render({ posts: posts })
    jQuery('#blog-main').html(output);
  });
}

App.prototype.getArchive = function(date) {
  date = date.split('/');
  var year = date[0];
  var month = date[1];
  var rendered = this.rendered;

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
  // Get unixtimestamps for date to construct the appropriate API filter URL.
  var url = this.apiBaseUrl + '/blog?filter[created][value][0]=' + startTime +'&filter[created][operator][0]=">="';
  url += '&filter[created][value][1]=' + nextTime + '&filter[created][operator][1]="<="';
  url += '&sort=created';

  jQuery.get(url, function(response) {
    var posts = [];

    response.data.forEach(function(post, i, allPosts) {
      posts.push({
        id: post.id,
        title: post.title,
        date: post.post_date,
        author: post.author,
        image: post.avatar,
        body: post.body,
      })
    });


    var template = twig({ ref: 'blog-post-listing' });
    var output = template.render({ posts: posts });
    jQuery('#blog-main').html(output);
  });
};

var App = new App();

App.router.on('route:getPostListing', function(pageId) {
  App.getPostListing(pageId);
});
App.router.on('route:getPost', function(id) {
  App.getPost(id);
});
App.router.on('route:getAbout', function() {
  window.scrollTo(0,0);
  var template = twig({
    id: 'about',
    href: 'static/templates/about.twig',
    async: true,
    load: function(template) {
      App.clear();
      jQuery('#blog-main').html(template.render({}));
    }
  })
});
App.router.on('route:getArchive', function(date) {
  App.getArchive(date);
});

Backbone.history.start();
// Our initial payload will have most of the content rendered.
// Render these two sidebar blocks that we don't care about from an
// SEO perspective.
App.aboutSidebar();
App.elsewhereLinks();
App.rendered = true;
