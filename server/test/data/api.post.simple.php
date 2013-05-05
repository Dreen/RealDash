<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST')
{
	echo '{"result":"OK"}';
}
else
{
	echo '{"result":"FAILED"}';
}
?>