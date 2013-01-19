<?php

// connect to MongoDB and select the collection
try
{
	$conn = new Mongo();
	$botjobs = $conn->apib->botjobs;
}
catch(MongoException $e)
{
	die('Database error');
}

if (isset($_GET['id']))
{
	$id = $_GET['id'];
}
else
{
	die('ID parameter required');
}

$job = $botjobs->findOne(array('_id' => new MongoId($id)));

if ($job)
{
	echo '<pre>';
	print_r($job['result']);
	echo '</pre>';
}
else
{
	die('No such job');
}
?>