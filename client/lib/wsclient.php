<?php
include 'class.tpl.php';
header('Content-type: application/x-javascript');

function getID($len) // function to generate client ID
{
    $rzygi = '';
    for ($i=0; $i<$len; $i++)
    {
        $rzygi .= str_pad(dechex(rand(0,65535)),4,'0',STR_PAD_LEFT);
    }
    return $rzygi;
}

// connect to MongoDB and select the collection
try
{
	$conn = new Mongo();
	$clients = $conn->apib->clients;
}
catch(MongoException $e)
{
	die('Database error');
}

if (isset($_COOKIE['APIBrowser_ClientID']) && 
	$clients->find(array('uid' => $_COOKIE['APIBrowser_ClientID']))->count() === 1)
{ // an old id stored in a cookie and there is an entry in db confirming that
	$clientID = $_COOKIE['APIBrowser_ClientID'];
	$clients->update(array('uid' => $clientID), array('$set'=>array('lastip' => $_SERVER['REMOTE_ADDR'])));
}
else
{ // generate a new id
	while (true)
	{
		$clientID = getID(5);
		$cursor = $clients->find(array('uid' => $clientID));
		if ($cursor->count() === 0)
		{
			break;
		}
	}
	$clients->insert(array('uid' => $clientID, 'lastip' => $_SERVER['REMOTE_ADDR'], "savedModel" => array()));
}

if (file_exists('../address'))
{ // app server is online
	$ws = new tpl('wsclient.js', true);
	$ws->add('CLIENTID', $clientID);
	$ws->add('SERVER_ADDRESS', trim(file_get_contents('../address')));
	echo $ws->build();
}
else
{
	echo 'Error: Application server is not running.';
}
?>