<script>
	import { LayerCake, ScaledSvg, Html, flatten } from 'layercake';
	import { stack } from 'd3-shape';
	import { scaleOrdinal } from 'd3-scale';
	import { format, precisionFixed } from 'd3-format';
	import { timeParse, timeFormat } from 'd3-time-format';
	import * as d3 from 'd3';
	import d3Tip from 'd3-tip';

	import AxisX from './_components/AxisX.html.svelte';
	import AxisY from './_components/AxisY.html.svelte';
	import AreaStacked from './_components/AreaStacked.svelte';

	// This example loads csv data as json using @rollup/plugin-dsv
	import data from './_data/fruit.csv';

	const xKey = 'date';
	const yKey = [0, 1];
	const zKey = 'key';

	const parseDate = timeParse('%Y-%m-%d');

	const seriesNames = Object.keys(data[0]).filter((d) => d !== xKey);
	const seriesColors = ['#FF5251', '#1DA1F2', '#25D366', '#Bcbcbc'];

	data.forEach((d) => {
		d[xKey] = typeof d[xKey] === 'string' ? parseDate(d[xKey]) : d[xKey];
		seriesNames.forEach((name) => {
			d[name] = +d[name];
		});
	});

	/* --------------------------------------------
	 * Create a stacked data structure
	 */
	const stackData = stack().keys(seriesNames).offset(d3.stackOffsetWiggle);

	const series = stackData(data);

	const formatTickX = timeFormat('%b. %-d');
	const formatTickY = (d) => format(`.${precisionFixed(d)}s`)(d);
</script>

<div class="chart-container">
	<LayerCake
		ssr={true}
		percentRange={true}
		padding={{ top: 0, right: 0, bottom: 20, left: 17 }}
		x={(d) => d.data[xKey]}
		y={yKey}
		z={zKey}
		zScale={scaleOrdinal()}
		zDomain={seriesNames}
		zRange={seriesColors}
		flatData={flatten(series)}
		data={series}
	>
		<Html>
			<AxisX formatTick={formatTickX} tickMarks={true} />
			<AxisY baseline={true} formatTick={formatTickY} />
		</Html>
		<ScaledSvg>
			<AreaStacked />
		</ScaledSvg>
	</LayerCake>
</div>

<style>
	/*
    The wrapper div needs to have an explicit width and height in CSS.
    It can also be a flexbox child or CSS grid element.
    The point being it needs dimensions since the <LayerCake> element will
    expand to fill it.
  */
	.chart-container {
		width: 100%;
		height: 250px;
	}
</style>
