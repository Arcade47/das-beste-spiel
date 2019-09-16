<?php
    $q = $_GET['q'];

    $con = mysqli_connect('database-5000160186.ud-webspace.de','dbu190292','Threctia1847','dbs155300');
    if (!$con) {
        echo 'Could not connect: ' . mysqli_error($con);
    }

    // split the input string
    $a = explode("|", $q);
    $na = $a[0];
    $sc = $a[1];

    // reject malicious code
    $na = mysqli_real_escape_string($con, $na);
    $sc = mysqli_real_escape_string($con, $sc);

    // SQL code
    $sql = "INSERT INTO highscores(username,score) VALUES('$na', '$sc')";

    // save to db
    mysqli_query($con, $sql);
?>