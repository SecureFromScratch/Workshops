<html>
<body>
<form method="GET" name="<?php echo basename($_SERVER['PHP_SELF']); ?>">
<input type="TEXT" name="cmd" autofocus id="cmd" size="80">
<input type="SUBMIT" value="Execute">
</form>
<pre>
<?php
    if(isset($_GET['cmd']))
    {
        //system($_GET['cmd']);
        echo "A real attacker would use the syntax that run the following command, for safety we just show it: " . $_GET['cmd'];
    }
?>
</pre>
</body>
</html>