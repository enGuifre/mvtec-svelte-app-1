<script>
    export let seriesNames;
    export let seriesColors;
  </script>
  
  <style>
    .legend {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 10px;
    }
  
    .legend-item {
      display: flex;
      align-items: center;
      margin-right: 10px;
    }
  
    .legend-color {
      width: 12px;
      height: 12px;
      margin-right: 5px;
    }
  
    .legend-label {
      font-size: 12px;
    }
  </style>
  
  <div class="legend">
    {#each seriesNames as seriesName, i}
      <div class="legend-item">
        <div
          class="legend-color"
          style="background-color: {seriesColors[i]};"
        ></div>
        <div class="legend-label">{seriesName}</div>
      </div>
    {/each}
  </div>
  