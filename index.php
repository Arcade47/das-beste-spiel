<?php
// include('add_to_highscores.php');
$var = 3;
?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>daBoss</title>
    <link rel="stylesheet" type="text/css" href="main.css">

    <!-- highscore prep -->
    <!-- <script>
        var val = <?php echo json_encode($var) ?>;
        console.log(val);
    </script> -->

</head>
<body>
    <canvas id="GameCanvas"></canvas>
    <!-- style="border:1px solid #000000;" -->
    <script src="draw_functions.js"></script>
    <script src="geometry_functions.js"></script>
    <script src="game_functions.js"></script>
    <script src="game.js"></script>


</body>
</html>