
nv.models.pie = function() {
  var margin = {top: 0, right: 0, bottom: 0, left: 0},
      width = 500,
      height = 500,
      getLabel = function(d) { return d.key },
      getY = function(d) { return d.y },
      id = Math.floor(Math.random() * 10000), //Create semi-unique ID in case user doesn't select one
      color = d3.scale.category20().range(),
      valueFormat = d3.format(',.2f'),
      showLabels = true,
      labelThreshold = .02, //if slice percentage is under this, don't show label
      donut = false;

  var  dispatch = d3.dispatch('chartClick', 'elementClick', 'elementDblClick', 'elementMouseover', 'elementMouseout');

  function chart(selection) {
    selection.each(function(data) {
      var availableWidth = width - margin.left - margin.right,
          availableHeight = height - margin.top - margin.bottom,
          radius = Math.min(availableWidth, availableHeight) / 2;

      var container = d3.select(this)
          .on('click', function(d,i) {
              dispatch.chartClick({
                  data: d,
                  index: i,
                  pos: d3.event,
                  id: id
              });
          });


      var wrap = container.selectAll('.wrap.pie').data([data]);
      var wrapEnter = wrap.enter().append('g').attr('class','wrap nvd3 pie chart-' + id);
      var gEnter = wrapEnter.append('g');
      var g = wrap.select('g')

      gEnter.append('g').attr('class', 'pie');

      wrap.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      g.select('.pie').attr('transform', 'translate(' + availableWidth / 2 + ',' + availableHeight / 2 + ')');



      var arc = d3.svg.arc()
                  .outerRadius((radius-(radius / 5)));

      if (donut) arc.innerRadius(radius / 2);


      // Setup the Pie chart and choose the data element
      var pie = d3.layout.pie()
          .sort(null)
          .value(function(d) { return d.disabled ? 0 : getY(d) });

      var slices = wrap.select('.pie').selectAll('.slice')
          .data(pie);

      slices.exit().remove();

      var ae = slices.enter().append('svg:g')
              .attr('class', 'slice')
              .on('mouseover', function(d,i){
                d3.select(this).classed('hover', true);
                dispatch.elementMouseover({
                    label: getLabel(d.data),
                    value: getY(d.data),
                    point: d.data,
                    pointIndex: i,
                    pos: [d3.event.pageX, d3.event.pageY],
                    id: id
                });
              })
              .on('mouseout', function(d,i){
                d3.select(this).classed('hover', false);
                dispatch.elementMouseout({
                    label: getLabel(d.data),
                    value: getY(d.data),
                    point: d.data,
                    index: i,
                    id: id
                });
              })
              .on('click', function(d,i) {
                dispatch.elementClick({
                    label: getLabel(d.data),
                    value: getY(d.data),
                    point: d.data,
                    index: i,
                    pos: d3.event,
                    id: id
                });
                d3.event.stopPropagation();
              })
              .on('dblclick', function(d,i) {
                dispatch.elementDblClick({
                    label: getLabel(d.data),
                    value: getY(d.data),
                    point: d.data,
                    index: i,
                    pos: d3.event,
                    id: id
                });
                d3.event.stopPropagation();
              });

        slices
            .attr('fill', function(d,i) { return color[i]; });

        var paths = ae.append('svg:path')
            .each(function(d) { this._current = d; });
            //.attr('d', arc);

        d3.transition(slices.select('path'))
            .attr('d', arc)
            //.ease('bounce')
            .attrTween('d', arcTween);
            //.attrTween('d', tweenPie);

        if (showLabels) {
          // This does the normal label
          ae.append('text')
            .attr('transform', function(d) {
               d.outerRadius = radius + 10; // Set Outer Coordinate
               d.innerRadius = radius + 15; // Set Inner Coordinate
               return 'translate(' + arc.centroid(d) + ')';
            })
            .style('text-anchor', 'middle') //center the text on it's origin
            .style('fill', '#000');

          d3.transition(slices.select('text'))
              //.ease('bounce')
              .attr('transform', function(d) {
                 d.outerRadius = radius + 10; // Set Outer Coordinate
                 d.innerRadius = radius + 15; // Set Inner Coordinate
                 return 'translate(' + arc.centroid(d) + ')';
              })
              //.style('font', 'bold 12px Arial') // font style's should be set in css!
              .text(function(d, i) { 
                var percent = (d.endAngle - d.startAngle) / (2 * Math.PI);
                return (d.value && percent > labelThreshold) ? getLabel(d.data) : ''; 
              });
        }


        // Computes the angle of an arc, converting from radians to degrees.
        function angle(d) {
          var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
          return a > 90 ? a - 180 : a;
        }

        function arcTween(a) {
          if (!donut) a.innerRadius = 0;
          var i = d3.interpolate(this._current, a);
          this._current = i(0);
          return function(t) {
            return arc(i(t));
          };
        }

        function tweenPie(b) {
          b.innerRadius = 0;
          var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
          return function(t) {
              return arc(i(t));
          };
        }

    });

    return chart;
  }


  chart.dispatch = dispatch;

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return getY;
    getY = d3.functor(_);
    return chart;
  };

  chart.label = function(_) {
    if (!arguments.length) return getLabel;
    getLabel = _;
    return chart;
  };

  chart.showLabels = function(_) {
    if (!arguments.length) return showLabels;
    showLabels = _;
    return chart;
  };

  chart.donut = function(_) {
    if (!arguments.length) return donut;
    donut = _;
    return chart;
  };

  chart.id = function(_) {
    if (!arguments.length) return id;
    id = _;
    return chart;
  };

  chart.color = function(_) {
    if (!arguments.length) return color;
    color = _;
    return chart;
  };

  chart.valueFormat = function(_) {
    if (!arguments.length) return valueFormat;
    valueFormat = _;
    return chart;
  };

  chart.labelThreshold = function(_) {
    if (!arguments.length) return labelThreshold;
    labelThreshold = _;
    return chart;
  };


  return chart;
}
