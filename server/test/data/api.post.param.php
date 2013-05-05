<?php
if (isset($_POST['foo']) && $_POST['foo'] == 'bar')
{
	echo '{"result":"OK"}';
}
else
{
	echo '{"result":"FAILED"}';
}
?>