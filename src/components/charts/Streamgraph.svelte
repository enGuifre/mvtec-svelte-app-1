<script>
    import * as d3 from 'd3';
  
    let data = [
      { date: new Date(2022, 0, 1), value: 10, category: 'Category 1' },
      { date: new Date(2022, 1, 1), value: 20, category: 'Category 1' },
      { date: new Date(2022, 2, 1), value: 15, category: 'Category 1' },
      { date: new Date(2022, 3, 1), value: 25, category: 'Category 1' },
      { date: new Date(2022, 0, 1), value: 5, category: 'Category 2' },
      { date: new Date(2022, 1, 1), value: 15, category: 'Category 2' },
      { date: new Date(2022, 2, 1), value: 10, category: 'Category 2' },
      { date: new Date(2022, 3, 1), value: 20, category: 'Category 2' }
    ];
  
    const margin = { top: 10, right: 30, bottom: 30, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
  
    const x = d3.scaleUtc()
      .domain(d3.extent(data, d => d.date))
      .range([margin.left, width - margin.right]);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)]).nice()
      .range([height - margin.bottom, margin.top]);
  
    const z = d3.scaleOrdinal()
      .domain(data.map(d => d.category))
      .range(d3.schemeCategory10);
  
    const area = d3.area()
      .x(d => x(d.data.date))
      .y0(d => y(d[0]))
      .y1(d => y(d[1]))
      .curve(d3.curveBasis);
  
    const stack = d3.stack()
      .keys([...new Set(data.map(d => d.category))])
      .value((d, key) => d.value)
      .order(d3.stackOrderInsideOut)
      .offset(d3.stackOffsetWiggle);
  
    function formatTicks(d) {
      const year = d.getUTCFullYear();
      const month = d.getUTCMonth() + 1;
      return `${month}/${year}`;
    }
  
    $: {
      if ($$props.width && $$props.height) {
        x.range([margin.left, $$props.width - margin.right]);
        y.range([$$props.height - margin.bottom, margin.top]);
      }
    }
  
    $: {
      if (x && y && z && area && stack && data) {
        const stackData = stack(data);
        const svg = d3.select('#streamgraph')
          .append('svg')
          .attr('viewBox', `0 0 ${width} ${height}`);
  
        svg.selectAll('path')
          .data(stackData)
          .join('path')
          .attr('fill', d => z(d.key))
          .attr('d', area);
  
        svg.append('g')
          .attr('transform', `translate(0,${height - margin.bottom})`)
          .call(d3.axisBottom(x).ticks(width / 80).tickFormat(formatTicks))
.selectAll('.tick line')
.clone()
.attr('y1', -height)
.attr('y2', 0)
.attr('stroke-opacity', 0.2);

svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('.tick line').clone()
      .attr('x2', width)
      .attr('stroke-opacity', 0.2));
}
}
</script>

<style>
  #streamgraph svg {
    width: 100%;
    height: 100%;
  }

  #streamgraph path {
    transition: opacity 0.3s ease;
  }

  #streamgraph path:hover {
    opacity: 0.7;
  }
</style>
<div id="streamgraph"></div>
  