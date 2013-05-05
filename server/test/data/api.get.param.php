<?php
if (isset($_GET['foo']) && $_GET['foo'] == 'bar')
{
	echo '{"result":"OK"}';
}
else
{
	echo '{"result":"FAILED"}';
}
?>