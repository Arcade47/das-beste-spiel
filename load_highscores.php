<?php

$con = mysqli_connect('database-5000160186.ud-webspace.de','dbu190292','Threctia1847','dbs155300');
if (!$con) {
    echo 'Could not connect: ' . mysqli_error($con);
}

// mysqli_select_db($con,"highscores");
$sql = "SELECT * FROM highscores ORDER BY score DESC";

// ORDER BY score DESC

if ($result=mysqli_query($con, $sql))
  {
  for ($i = 1; $i <= 5; $i++)
    {
    $obj = mysqli_fetch_object($result);
    echo $obj->username;
    echo "|a|";
    echo $obj->score;
    echo "|b|";
    }
  // Free result set
  mysqli_free_result($result);
}

mysqli_close($con);

?>