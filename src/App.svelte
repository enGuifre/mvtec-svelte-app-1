<script>
  let message = "Hello, world!!!!!!!!";
  let selectedFile = null;

  function handleClick() {
    message = "Button clicked!";
  }

  function handleFileSelect(event) {
    selectedFile = event.target.files[0];
  }
</script>


<div>
  <p>{message}</p>
<img src="postits_4.png" alt="Example image" width="150"/>
</div>