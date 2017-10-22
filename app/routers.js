var GRouter = Backbone.Router.extend({
  routes: {
    ":category": "categories",
    "": "nocategory"
  },
  
  nocategory: function(){
  },

  categories: function(category){
    s_view.render(category);
  },
});

window.launch();
