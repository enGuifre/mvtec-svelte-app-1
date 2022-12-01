<script>

	import { scaleLinear } from 'd3-scale';

	//let color = '#5cc6b2';
	let alphabet = [
		{"letter":"A","frequency":0.08167}, {"letter":"B","frequency":0.01492}, {"letter":"C","frequency":0.02782},
		{"letter":"D","frequency":0.04253}, {"letter":"E","frequency":0.12702}, {"letter":"F","frequency":0.02288},
		{"letter":"G","frequency":0.02015}, {"letter":"H","frequency":0.06094}, {"letter":"I","frequency":0.06966},
		{"letter":"J","frequency":0.00153}, {"letter":"K","frequency":0.00772}, {"letter":"L","frequency":0.04025},
		{"letter":"M","frequency":0.02406}, {"letter":"N","frequency":0.06749}, {"letter":"O","frequency":0.07507},
		{"letter":"P","frequency":0.01929}, {"letter":"Q","frequency":0.00095}, {"letter":"R","frequency":0.05987},
		{"letter":"S","frequency":0.06327}, {"letter":"T","frequency":0.09056}, {"letter":"U","frequency":0.02758},
		{"letter":"V","frequency":0.00978}, {"letter":"W","frequency":0.0236}, {"letter":"X","frequency":0.0015},
		{"letter":"Y","frequency":0.01974}, {"letter":"Z","frequency":0.00074}
	];

	let height = 250;
	let width = 600;
	//let margin = ({top: 20, right: 30, bottom: 40, left: 50});

	console.log(alphabet)

	/*$: xScale = scaleLinear()
		.domain(alphabet.map(d => d.letter))
		.range([margin.left, width - margin.right])

	
	$: yScale = scaleLinear()
		.domain([0,Math.max(alphabet.map(d=>d.frequency))])
		.range([height - margin.bottom, margin.top]);
	*/

//viewBox="0 0 {width} {height}"
</script>

<main>
	<div class="chart">
		<h1>Frequencies</h1>
		<svg height="{height}" width="{width}" style="background: lightblue">
		<!--<svg class="graph" height="{height}" width="{width}" style="background: lightblue">

			<g class="axis y-axis">
				<g class="grid y-grid" transform="translate({margin.left},0)" fill="black"></g>
				<line x2="100%"></line>
			</g>


			<g class="axis x-axis">
				{#each alphabet as item, i}
				<g class=".tick:last-of-type text" transform="translate(0,{250 - margin.bottom})">
					<text x="10" y="-10">{item.letter}</text>
				</g>
				{/each}
			</g>-->
			<!--<g class="bar">-->
				{#each alphabet as item, i}
					<rect
						x={i*23}
						y={height - item.frequency * 1500}
						witdh=20
						height={item.frequency*1000}
						fill="black"
						stroke="black"></rect>
					<text 
					x={i*23}
					y={height - item.frequency*1500}>
						{item.letter}
					</text>
					{/each}
			<!--</g>-->
		</svg>
		
	</div>
	<!--<rect witdth="(item, i) => i * 25" height="item => height - item.frequency*1500"></rect>
<rect witdth="20" height="item => height - item.frequency*1500" style="fill:purple"></rect>-->

</main>

<style>

</style>