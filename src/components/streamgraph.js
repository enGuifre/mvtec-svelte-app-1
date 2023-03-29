<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  let data = [
    { date: new Date('2022-01-01'), value: 10 },
    { date: new Date('2022-02-01'), value: 20 },
    { date: new Date('2022-03-01'), value: 30 },
    { date: new Date('2022-04-01'), value: 25 },
    { date: new Date('2022-05-01'), value: 15 },
    { date: new Date('2022-06-01'), value: 5 },
    { date: new Date('2022-07-01'), value: 10 },
    { date: new Date('2022-08-01'), value: 20 },
    { date: new Date('2022-09-01'), value: 30 },
    { date: new Date('2022-10-01'), value: 25 },
    { date: new Date('2022-11-01'), value: 15 },
    { date: new Date('2022-12-01'), value: 5 }
  ];

  const margin = { top: 20, right: 30, bottom: 30, left: 40 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  let svg;

  onMount(() => {
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([height - margin.bottom, margin.top]);

    const z = d3.scaleOrdinal(d3.schemeCategory10);

    const stack = d3.stack()
      .offset(d3.stackOffsetWiggle)
      .order(d3.stackOrderInsideOut)
      .keys(Object.keys(data[0]).filter(key => key !== 'date'));

    const series = stack(data);

    svg = d3.select('#streamgraph')
      .append('svg')
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    svg.selectAll('path')
      .data(series)
      .join('path')
      .attr('fill', ({ key }) => z(key))
      .attr('d', d3.area()
        .x(d => x(d.data.date))
        .y0(d => y(d[0]))
        .y1(d => y(d[1])));

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));
  });
</script>

<style>
  path {
    opacity: 0.8;
  }
  
  path:hover {
    opacity: 1;
  }
  
  .axis path,
  .axis line {
    stroke: #ddd;
  }
  
  .tick text {
    font-size: 12px;
  }
  
  .domain {
    display: none;
  }
</style>

<div id="streamgraph"></div>