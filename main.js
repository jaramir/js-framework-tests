$(document).ready(function() {
    var app = new App();
    Backbone.history.start({pushState: true});
});

// In this version:
// - html5 pushstate is used
// - navigation clicks are intercepted
// - they are translated into instructions to the App object to show a page
// - the App object then notifies the router to update the URL passively
// - the nav view's lifecycle is long, it is told to change state when
//   the main view changes.
// - note that when the nav view intercepts a click on a menu item
//   it doesn't highlight that menu item, it just tells the app what
//   view to show, and waits to be told what to highlight in response.
// - instead it could highlight the item immediately, but then there
//   are two codepaths for highlighting the current item (being told
//   externally after initial construction, and internally on click)


var App = function() {
    this.initialize.apply(this, arguments);
};
App.prototype = _.extend({}, Backbone.Events, {
    appRouter: null,
    mainView: null,
    navView: null,
    initialize: function() {
        this.appRouter = new AppRouter({app: this});
        this.navView = new NavView({app: this});
        this.navView.render().$el.appendTo('#nav-container');
    },
    showHome: function() {
        this._show(new HomeView(), 'home', '');
    },
    showStock: function() {
        this._show(new StockView(), 'stock', 'stock');
    },
    _show: function(view, pageName, route) {
        this.mainView && this.mainView.remove();
        this.mainView = view;
        this.mainView.render().$el.appendTo($('#main-view-container'));
        this.navView.setCurrent(pageName);
        this.appRouter.navigate(route);
    }
});


var AppRouter = Backbone.Router.extend({
    routes: {
        '': 'home',
        'stock': 'stock'
    },
    app: null,
    initialize: function(options) {
        this.app = options.app;
    },
    home: function() {
        this.app.showHome();
    },
    stock: function() {
        this.app.showStock();
    }
});


var HomeView = Backbone.View.extend({
    render: function() {
        var template = _.template($('#home-template').text());
        this.$el.html(template());
        return this;
    }
});


var StockView = Backbone.View.extend({
    render: function() {
        var template = _.template($('#stock-template').text());
        this.$el.html(template());
        return this;
    }
});

var NavView = Backbone.View.extend({
    app: null,
    current: null,
    events: {
        'click a': '_navClicked'
    },
    initialize: function(options) {
        this.app = options.app;
    },
    _navClicked: function(e) {
        e.preventDefault();
        var pageName = $(e.target).data('page');
        this.app['show' + pageName]();
    },
    _highlightCurrent: function() {
        this.$('a').removeClass('current');
        this.$('a.' + this.current).addClass('current');
    },
    setCurrent: function(current) {
        this.current = current;
        this.render();
    },
    render: function() {
        var template = _.template($('#nav-template').text());
        this.$el.html(template());
        this._highlightCurrent();
        return this;
    }
});
