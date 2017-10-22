var SermonView = Backbone.View.extend({
     
  events: function() {
    return {
      "mouseover tr.bookrow":"toggle_book",
      "mouseout tr.bookrow":"toggle_book",
      "mouseover div.chapter":"toggle_chapter"
    }
  },

  initialize: function(){
    _.bindAll(this, 'render');
    var that = this;
    this.eden_sermons = null
    this.book_template = _.template($("#book").html());
    this.book_row_template = _.template($("#book_row").html());
    this.chapter_template = _.template($("#chapter").html());
    this.chapter_filler_template = _.template($("#chapter_filler").html());
    this.load_bible();
  },

  render: function(column){
    var that = this;
    console.log(1);
  },

  toggle_chapter: function(e){
    $(".chapter").removeClass("selected");
    element = $(e.target);
    $("." + element.attr("class").split(" ")[2]).toggleClass("selected")
    console.log(0);
  },

  toggle_book: function(e){
    element = $(e.target);
    id_name = element.parents("tr").attr("id");
    classname = id_name.substring(0, id_name.length-1);
    $("." + classname).toggleClass("selected")
  },

  load_bible: function(){
    var that = this;
    rowlength = 22;
    // Load Eden
    jQuery.getJSON("data/eden_sermons.json", function(data){
      that.eden_sermons = crossfilter(data);
      $.each(data, function(book_name, book){
        rows = Math.ceil(_.size(book)/rowlength);
        $("#books").append(that.book_template({book:book_name, rows:rows}));
        for(i=1; i<rows; i++){
          $("#books").append(that.book_row_template({book:book_name, row:i}));
        }
        var current = 0;
        var row = 0;
        $.each(book, function(chapter_name, chapter){
          if(current%rowlength==0 && current!=0){row++;}
          $("#" + book_name.replace(" ","_").replace(" ","_")+row).append(that.chapter_template({chapter:chapter, chapter_name: chapter_name, book:book_name}));
          current += 1;
        });

        for(i = rowlength*rows - current; i > 0; i--){
          $("#" + book_name.replace(" ","_").replace(" ","_")+row).append(that.chapter_filler_template());
        }
      });
    });

      //load Park Street
      jQuery.getJSON("data/parkstreet_sermons.json", function(data){
        that.parkstreet_sermons = crossfilter(data);
        $.each(data, function(book_name, book){
          rows = Math.ceil(_.size(book)/rowlength);

          var current = 0;
          var row = 0;
          $.each(book, function(chapter_name, chapter){
            if(current%rowlength==0 && current!=0){row++;}
            $("#" + book_name.replace(" ","_").replace(" ","_")+row).prepend(that.chapter_template({chapter:chapter, chapter_name: chapter_name, book:book_name.replace(" ","%20")}));
            current += 1;
          });

          for(i = rowlength*rows - current; i > 0; i--){
            $("#" + book_name.replace(" ","_").replace(" ","_")+row).prepend(that.chapter_filler_template());
          }
 
        });

      });

      console.log(1);
  }
});
