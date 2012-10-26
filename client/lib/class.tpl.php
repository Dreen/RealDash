<?php
/**
 * template class
 * tags: {tag}
 * @author Grzegorz Balaga <dreen1@gmail.com>
 */
class tpl
{
	var $tplDir = 'tpl/';
	var $replaces;
	var $tplFile;
	
	function tpl ($tplFile = 'main', $nonDirTpl = false)
	{
		if ($nonDirTpl === true)
			$this->tplFile = $tplFile;
		else
			$this->tplFile = $this->tplDir . $tplFile . '.tpl';
	}
    
	function add ($name, $value, $append = false)
	{
		if ($append === false || !isset($this->replaces[$name]))
			$this->replaces[$name] = $value;
		else
			$this->replaces[$name] .= $append . $value;
	}
	
	function build ()
	{
		if (!file_exists($this->tplFile))
			return false;
		else
			$tpl = file_get_contents ($this->tplFile);

		
		if (count($this->replaces)>0)
		{
			foreach ($this->replaces as $name => $value)
				$tpl = str_replace('{' . $name . '}',$value,$tpl);
		}
			
		return $tpl;
	}
}
?>
