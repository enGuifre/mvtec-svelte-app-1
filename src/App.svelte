<script>
	import Streamgraph from './components/streamgraph.svelte';
	

	let header = "Enough phone for today!";
</script>

<style>
	
	img {
		display: block;
		margin: auto;
		max-width: 100%;
		height: auto;
	}
	.smaller {
		max-width: 500px;
		top: 5%;
		left: 2%;
		position: relative;
	}
	h2 {
		text-shadow: 0.5px 0.5px 0.5px #000;
		position: absolute;
		top: 2%;
		left: 3%;
		z-index: 1;
		color: white;
		font-size: 3em;
		text-align: center;
	}
	h3 {
		position: relative;
		top: 2%;
		left: 2%;
		z-index: 1;
		color: black;
		font-size: 1em;
		text-align: left;
	}
	p {
		margin: 30px;
	}
	.image-container {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		margin-top: 50px;
	}
	.image-container img {
		margin-right: 30px;
	}
	@media only screen and (max-width: 600px) {
		.image-container {
			flex-direction: column;
			margin-top: 20px;
		}
		.image-container img {
			margin-right: 0;
			margin-bottom: 30px;
		}
	}
</style>

<div style="position:relative;">
	<img src="photo 1.jpg" alt="Image" />
	<br>
	<h2><b>{header}</b></h2>
</div>

<p> Do you think it would be embarrassing for you to find out how much time you spend every day staring at your
    phone? If so, how about finding out the amount of times you check your device without even realising?
    For this project, I have recorded the amount of time I have spent checking my phone during 60 days,
    and I've done it with two different methodologies: on the one hand, drawing a sign on a piece of paper
    every time I unlocked the phone, and on the other hand letting the phone itself record my activity
    automatically with an app. </p>

<h3><b>Only 12% of the times I checked my phone were manually recorded</b></h3>

<div class="image-container">
	<img src="photo 2.jpg" alt="Image" class="smaller" />
	<p>The comparison between the manual and the automatic recording of the number of unlocks is quite surprising.
		Assuming that the phone is recording its activity accurately as it is reasonable to think, the gap with
		my notes is very significant. 
		<br>
		<br>
		On average, I manually tracked 19 unlocks every day, but in reality I had done it 162 times. That means
		that I have just been able to check 12% of the events,
		so one can argue that I have only been aware of one in ten times that I stared at my phone. 
		Is it a bit worrysome? How many times would you be fully aware that you are using your device? 
		Checking the time, reacting when you receive a notification, texting people...
		<br>
		<br>
		The following chart aims to visualise the big difference between the two methodologies. In the manual
		tracking column, you can see every post-it (one for every day) with a sign drawn every time I checked my
		device. Yellow post-its were used for working days, while pink ones were used for days off. The reason
		for this is that I use the same phone for both and personal purposes. 
		<br>
		<br>
		While no major differences in the percentage of the manual register compared to the automatic one 
		have been spotted, this circumstance is key to understand other variables that will be presented 
		further down this project. As for the automatic tracking column, it shows the outcome of the app 
		tracking with a design similar to the manual one so that it is easier to visually compare.</p>
</div>



<img src="postits_4.png" alt="Image" />
<h3><b>More phone usage on weekdays</b></h3>
<p>Is there any difference between how much I use my phone depending on the day of the week? According to
the data tracked automatically, the real one, there is! Through the following radar charts, you can roughly
see that as the week goes by, my phone usage drops. This includes the number of minutes I use it,
the number of times I check it, and the number of notifications I receive. And, if you compare the average
working day with the average day off, the difference is very clear, as you can also check in the charts
underneath the ones with the data for each weekday. The fact that I use my phone both for personal and
professional means has a clear impact on the data.
<br>
<br>
Can you say which day of the week I check the phone more often? Or when I receive more notifications? 
Dive into these graphs and interact with them to find out if you can't say at first glance! </p>

<iframe src='https://flo.uri.sh/visualisation/13237030/embed' title='Interactive or visual content' 
class='flourish-embed-iframe' frameborder='0' scrolling='no' 
style='width:100%;height:600px;' sandbox='allow-same-origin allow-forms allow-scripts allow-downloads 
allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation'></iframe>

<iframe src='https://flo.uri.sh/visualisation/13188024/embed' title='Interactive or visual content' 
class='flourish-embed-iframe' frameborder='0' scrolling='no' style='width:100%;height:500px;' 
sandbox='allow-same-origin allow-forms allow-scripts allow-downloads allow-popups allow-popups-to-escape-sandbox 
allow-top-navigation-by-user-activation'></iframe>
<h3><b>WhatsApp, topping the rankings of apps used with my phone </b></h3>
<p>The automatic tracking of my phone usage data during two months also reveals the top there
	apps that I use while checking my device: WhatsApp, with 929 minutes over the 60 days; Twitter,
	with 928 minutes during these two months; and the browser Safari, for 743 minutes altogether.
	<br>
	<br>
	This streamgraph provides some information on the evolution of the phone usage in total, and also
	by app.
</p>
<main>
<p><Streamgraph /></p>
</main>